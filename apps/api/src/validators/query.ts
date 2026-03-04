import { z } from "zod";

/**
 * Common pagination query parameters
 */
export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

/**
 * Query schema for sites list endpoint
 */
export const SitesListQuerySchema = PaginationQuerySchema;

export type SitesListQuery = z.infer<typeof SitesListQuerySchema>;

/**
 * Query schema for site members list endpoint
 */
export const SiteMembersQuerySchema = PaginationQuerySchema;

export type SiteMembersQuery = z.infer<typeof SiteMembersQuerySchema>;

/**
 * Query schema for points balance/check endpoints
 */
export const PointsSiteQuerySchema = z.object({
  siteId: z.string().uuid("Invalid site ID format"),
});

export type PointsSiteQuery = z.infer<typeof PointsSiteQuerySchema>;

/**
 * Query schema for points leaderboard endpoint
 */
export const PointsLeaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  type: z.enum(["monthly", "all"]).optional().default("all"),
});

export type PointsLeaderboardQuery = z.infer<
  typeof PointsLeaderboardQuerySchema
>;

/**
 * Query schema for votes results endpoint
 */
export const VoteResultsQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format")
    .optional(),
});

export type VoteResultsQuery = z.infer<typeof VoteResultsQuerySchema>;
