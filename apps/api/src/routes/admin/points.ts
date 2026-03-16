import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import type { Env, AuthContext } from "../../types";
import { pointsLedger } from "../../db/schema";
import { success, error } from "../../lib/response";
import { logAuditWithContext } from "../../lib/audit";
import { AdminCorrectPointsSchema } from "../../validators/schemas";
import { createLogger } from "../../lib/logger";

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
      logger.warn(
        "KV settlement finalized read failed, treating as not finalized",
        {
          error:
            e instanceof Error
              ? { name: e.name, message: e.message }
              : { name: "UnknownError", message: String(e) },
          metadata: { month: original.settleMonth },
        },
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

    const correctionAmount = -original.amount;
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
