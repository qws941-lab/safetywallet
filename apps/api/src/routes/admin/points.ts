import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import type { Env, AuthContext } from "../../types";
import {
  pointsLedger,
  pushSubscriptions,
  siteMemberships,
} from "../../db/schema";
import { success, error } from "../../lib/response";
import { logAuditWithContext } from "../../lib/audit";
import { AdminCorrectPointsSchema } from "../../validators/schemas";
import { createLogger } from "../../lib/logger";
import {
  enqueueNotification,
  type NotificationQueueMessage,
} from "../../lib/notification-queue";

const logger = createLogger("admin-points");

const app = new Hono<{
  Bindings: Env;
  Variables: { auth: AuthContext };
}>();

app.post(
  "/points/correct",
  zValidator("json", AdminCorrectPointsSchema),
  async (c) => {
    const db = drizzle(c.env.DB);
    const { user } = c.get("auth");
    const body = c.req.valid("json");

    if (
      body.correctionType === "CORRECTION" &&
      (body.correctedAmount === undefined || body.correctedAmount === null)
    ) {
      return error(
        c,
        "CORRECTED_AMOUNT_REQUIRED",
        "correctedAmount is required for CORRECTION",
        400,
      );
    }

    if (
      body.correctionType === "CORRECTION" &&
      typeof body.correctedAmount === "number" &&
      body.correctedAmount < 0
    ) {
      return error(
        c,
        "INVALID_CORRECTED_AMOUNT",
        "correctedAmount must be greater than or equal to 0",
        400,
      );
    }

    const original = await db
      .select()
      .from(pointsLedger)
      .where(eq(pointsLedger.id, body.ledgerId))
      .get();

    if (!original) {
      return error(
        c,
        "LEDGER_NOT_FOUND",
        "Original ledger entry not found",
        404,
      );
    }

    const adminMembership = await db
      .select()
      .from(siteMemberships)
      .where(
        and(
          eq(siteMemberships.userId, user.id),
          eq(siteMemberships.siteId, original.siteId),
          eq(siteMemberships.status, "ACTIVE"),
          eq(siteMemberships.role, "SITE_ADMIN"),
        ),
      )
      .get();

    if (!adminMembership && user.role !== "SUPER_ADMIN") {
      return error(
        c,
        "SITE_ADMIN_REQUIRED",
        "Site admin access required for this site",
        403,
      );
    }

    const existingCorrection = await db
      .select({ id: pointsLedger.id })
      .from(pointsLedger)
      .where(and(eq(pointsLedger.refLedgerId, body.ledgerId)))
      .get();

    if (existingCorrection) {
      return error(
        c,
        "ALREADY_CORRECTED",
        "This ledger entry has already been corrected",
        409,
      );
    }

    const settlementKey = `settlement:${original.settleMonth}:finalized`;
    let isFinalized = false;
    try {
      const finalizedRaw = await c.env.KV.get(settlementKey);
      isFinalized = Boolean(finalizedRaw);
    } catch (e) {
      logger.error("KV settlement finalized read failed", {
        error:
          e instanceof Error
            ? { name: e.name, message: e.message }
            : { name: "UnknownError", message: String(e) },
        metadata: { month: original.settleMonth },
      });
      return error(
        c,
        "SETTLEMENT_CHECK_FAILED",
        "Cannot verify settlement status — try again later",
        503,
      );
    }

    if (isFinalized) {
      return error(
        c,
        "SETTLEMENT_FINALIZED",
        `Cannot correct points for finalized month ${original.settleMonth}`,
        409,
      );
    }

    const correctedAmountValue = body.correctedAmount ?? 0;
    const correctionAmount =
      body.correctionType === "REVOKE"
        ? -original.amount
        : correctedAmountValue - original.amount;
    const now = new Date();
    const settleMonth = original.settleMonth;
    const reasonCode =
      body.correctionType === "REVOKE" ? "REVOCATION" : "CORRECTION";

    const inserted = await db
      .insert(pointsLedger)
      .values({
        userId: original.userId,
        siteId: original.siteId,
        postId: original.postId,
        refLedgerId: original.id,
        amount: correctionAmount,
        reasonCode,
        reasonText: body.reason,
        adminId: user.id,
        settleMonth,
        occurredAt: now,
        createdAt: now,
      })
      .returning({ id: pointsLedger.id });

    const correctionLedgerId = inserted[0]?.id ?? "";

    const auditAction =
      body.correctionType === "REVOKE" ? "POINT_REVOKE" : "POINT_CORRECTION";
    await logAuditWithContext(
      c,
      db,
      auditAction,
      user.id,
      "POINT",
      correctionLedgerId,
      {
        originalLedgerId: original.id,
        originalAmount: original.amount,
        correctedAmount: correctionAmount,
        reason: body.reason,
        reasonCode,
        userId: original.userId,
        postId: original.postId ?? undefined,
      },
    );

    try {
      if (c.env.NOTIFICATION_QUEUE) {
        const subs = await db
          .select({
            id: pushSubscriptions.id,
            userId: pushSubscriptions.userId,
            endpoint: pushSubscriptions.endpoint,
            p256dh: pushSubscriptions.p256dh,
            auth: pushSubscriptions.auth,
            failCount: pushSubscriptions.failCount,
          })
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, original.userId))
          .all();

        if (subs.length > 0) {
          const pushMessage = {
            title:
              body.correctionType === "REVOKE" ? "포인트 취소" : "포인트 수정",
            body: body.reason,
            tag: `point-correction-${correctionLedgerId}`,
          };

          const queueMsg: NotificationQueueMessage = {
            type: "push_bulk",
            subscriptions: subs,
            message: pushMessage,
            enqueuedAt: new Date().toISOString(),
          };
          await enqueueNotification(c.env.NOTIFICATION_QUEUE, queueMsg);
        }
      }
    } catch (e) {
      logger.warn("Point correction notification enqueue failed", {
        error:
          e instanceof Error
            ? { name: e.name, message: e.message }
            : { name: "UnknownError", message: String(e) },
        metadata: {
          originalUserId: original.userId,
          correctionLedgerId,
        },
      });
    }

    logger.info("Points corrected", {
      metadata: {
        correctionLedgerId,
        originalLedgerId: original.id,
        correctionType: body.correctionType,
        originalAmount: original.amount,
        correctedAmount: correctionAmount,
        adminId: user.id,
      },
    });

    return success(c, {
      correctionLedgerId,
      originalLedgerId: original.id,
      originalAmount: original.amount,
      correctedAmount: correctionAmount,
      reason: body.reason,
      correctionType: body.correctionType,
    });
  },
);

export default app;
