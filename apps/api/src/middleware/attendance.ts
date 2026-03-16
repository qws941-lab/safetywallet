import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, gte, lt } from "drizzle-orm";
import {
  attendance,
  manualApprovals,
  siteMemberships,
  accessPolicies,
} from "../db/schema";
import { createLogger } from "../lib/logger";
import { error } from "../lib/response";
import type { Env, AuthContext } from "../types";
import { getTodayRange } from "../utils/common";

const logger = createLogger("attendance-middleware");

export async function attendanceMiddleware(
  c: Context<{ Bindings: Env; Variables: { auth: AuthContext } }>,
  next: Next,
  siteId?: string,
) {
  const auth = c.get("auth");

  // Admin users bypass attendance check
  if (auth?.user?.role === "SUPER_ADMIN" || auth?.user?.role === "SITE_ADMIN") {
    return next();
  }
  const resolvedSiteId = siteId?.trim() || undefined;
  const db = drizzle(c.env.DB);

  if (resolvedSiteId) {
    if (!auth) {
      throw new HTTPException(401, { message: "인증이 필요합니다." });
    }

    const membership = await db
      .select({ id: siteMemberships.id })
      .from(siteMemberships)
      .where(
        and(
          eq(siteMemberships.userId, auth.user.id),
          eq(siteMemberships.siteId, resolvedSiteId),
          eq(siteMemberships.status, "ACTIVE"),
        ),
      )
      .get();

    if (!membership) {
      return error(c, "FORBIDDEN", "해당 현장의 멤버가 아닙니다", 403);
    }
  }

  if (c.env.REQUIRE_ATTENDANCE_FOR_POST === "false") {
    if (resolvedSiteId) {
      const kvKey = `access-policy:${resolvedSiteId}`;
      let policy: { requireCheckin: boolean | null } | undefined;
      try {
        const cached = await c.env.KV.get(kvKey);
        if (cached !== null) {
          policy = JSON.parse(cached);
        }
      } catch (err) {
        logger.warn("KV access-policy read failed, falling back to D1", {
          kvKey,
          error: { name: "KVError", message: String(err) },
        });
      }
      if (policy === undefined) {
        policy = await db
          .select({ requireCheckin: accessPolicies.requireCheckin })
          .from(accessPolicies)
          .where(eq(accessPolicies.siteId, resolvedSiteId))
          .get();
        try {
          await c.env.KV.put(kvKey, JSON.stringify(policy ?? null), {
            expirationTtl: 300,
          });
        } catch (err) {
          logger.warn("KV access-policy cache write failed", {
            kvKey,
            error: { name: "KVError", message: String(err) },
          });
        }
      }

      if (!policy?.requireCheckin) {
        return next();
      }
    } else {
      return next();
    }
  }

  if (!auth) {
    throw new HTTPException(401, { message: "인증이 필요합니다." });
  }

  // FAS downtime graceful degradation: bypass attendance check
  // when FAS sync is failing (KV flag set by CRON with 10min TTL)
  try {
    const fasStatus = await c.env.KV.get("fas-status");
    if (fasStatus === "down") {
      return next();
    }
  } catch (err) {
    logger.warn(
      "KV fas-status read failed, continuing with normal attendance check",
      {
        error: { name: "KVError", message: String(err) },
      },
    );
  }

  const { start, end } = getTodayRange();

  const attendanceConditions = [
    eq(attendance.userId, auth.user.id),
    eq(attendance.result, "SUCCESS"),
    gte(attendance.checkinAt, start),
    lt(attendance.checkinAt, end),
  ];

  if (resolvedSiteId) {
    attendanceConditions.push(eq(attendance.siteId, resolvedSiteId));
  }

  const record = await db
    .select({ id: attendance.id })
    .from(attendance)
    .where(and(...attendanceConditions))
    .get();

  let hasAttendance = !!record;

  if (!hasAttendance && resolvedSiteId) {
    const approval = await db
      .select({ id: manualApprovals.id })
      .from(manualApprovals)
      .where(
        and(
          eq(manualApprovals.userId, auth.user.id),
          eq(manualApprovals.siteId, resolvedSiteId),
          gte(manualApprovals.validDate, start),
          lt(manualApprovals.validDate, end),
        ),
      )
      .get();

    hasAttendance = !!approval;
  }

  if (!hasAttendance) {
    throw new HTTPException(403, {
      message: "해당 현장에 오늘 출근 기록이 없습니다",
    });
  }

  await next();
}
