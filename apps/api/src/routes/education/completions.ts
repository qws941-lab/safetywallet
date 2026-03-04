import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { success, error } from "../../lib/response";
import {
  educationCompletions,
  educationContents,
  siteMemberships,
} from "../../db/schema";
import type { AppType } from "./helpers";

const app = new Hono<AppType>();

const CompletionSchema = z.object({
  contentId: z.string().min(1),
  signature: z.string().min(10, "signature image required"),
});

app.post("/", zValidator("json", CompletionSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { user } = c.get("auth");
  const { contentId, signature } = c.req.valid("json");

  const content = await db
    .select()
    .from(educationContents)
    .where(eq(educationContents.id, contentId))
    .get();

  if (!content) {
    return error(c, "CONTENT_NOT_FOUND", "Education content not found", 404);
  }

  const membership = await db
    .select()
    .from(siteMemberships)
    .where(
      and(
        eq(siteMemberships.userId, user.id),
        eq(siteMemberships.siteId, content.siteId),
        eq(siteMemberships.status, "ACTIVE"),
      ),
    )
    .get();
  if (!membership && user.role !== "SUPER_ADMIN") {
    return error(c, "NOT_SITE_MEMBER", "Site membership required", 403);
  }

  const now = new Date();
  const existing = await db
    .select()
    .from(educationCompletions)
    .where(
      and(
        eq(educationCompletions.contentId, contentId),
        eq(educationCompletions.userId, user.id),
      ),
    )
    .get();

  let completion;
  if (existing) {
    completion = await db
      .update(educationCompletions)
      .set({
        signatureData: signature,
        signedAt: now,
      })
      .where(eq(educationCompletions.id, existing.id))
      .returning()
      .get();
  } else {
    completion = await db
      .insert(educationCompletions)
      .values({
        contentId,
        siteId: content.siteId,
        userId: user.id,
        signatureData: signature,
        signedAt: now,
      })
      .returning()
      .get();
  }

  return success(c, { completion });
});

app.get("/:contentId/me", async (c) => {
  const db = drizzle(c.env.DB);
  const { user } = c.get("auth");
  const contentId = c.req.param("contentId");

  const content = await db
    .select()
    .from(educationContents)
    .where(eq(educationContents.id, contentId))
    .get();

  if (!content) {
    return error(c, "CONTENT_NOT_FOUND", "Education content not found", 404);
  }

  const membership = await db
    .select()
    .from(siteMemberships)
    .where(
      and(
        eq(siteMemberships.userId, user.id),
        eq(siteMemberships.siteId, content.siteId),
        eq(siteMemberships.status, "ACTIVE"),
      ),
    )
    .get();
  if (!membership && user.role !== "SUPER_ADMIN") {
    return error(c, "NOT_SITE_MEMBER", "Site membership required", 403);
  }

  const completion = await db
    .select({
      id: educationCompletions.id,
      signedAt: educationCompletions.signedAt,
      signatureData: educationCompletions.signatureData,
    })
    .from(educationCompletions)
    .where(
      and(
        eq(educationCompletions.contentId, contentId),
        eq(educationCompletions.userId, user.id),
      ),
    )
    .get();

  return success(c, { completion: completion ?? null });
});

export default app;
