# DTO

Domain data transfer object contracts shared between API and apps.

## Files

- `index.ts` — barrel re-exporting all 11 domain DTO files.
- `action.dto.ts` — `CreateActionDto`, `ActionDto`, `ActionImageDto`, `UpdateActionStatusDto`.
- `analytics.dto.ts` — `TrendDataPointDto`, `TrendFilterDto`, `PointsDistributionDto`.
- `announcement.dto.ts` — `CreateAnnouncementDto`, `AnnouncementDto`, `UpdateAnnouncementDto`.
- `auth.dto.ts` — `OtpRequestDto`, `OtpVerifyDto`, `TokenRefreshDto`, `AuthResponseDto`, `TokenPayloadDto`, `MeResponseDto`, `RegisterDto`.
- `education.dto.ts` — 18 interfaces: content, quiz, attempt, statutory training, TBM records.
- `points.dto.ts` — `AwardPointsDto`, `RevokePointsDto`, `PointsLedgerDto`, `PointsBalanceDto`, `PointsHistoryItemDto`, `PointsHistoryFilterDto`, `CreatePolicyDto`, `UpdatePolicyDto`.
- `post.dto.ts` — `CreatePostDto`, `PostDto`, `PostImageDto`, `PostListDto`, `PostFilterDto`.
- `review.dto.ts` — `ReviewActionDto`, `ReviewDto`.
- `site.dto.ts` — `SiteDto`, `CreateSiteDto`, `UpdateSiteDto`, `SiteMemberDto`, `UpdateMemberStatusDto`, `DashboardStatsDto`.
- `user.dto.ts` — `UserDto`, `UserProfileDto`, `UpdateProfileDto`.
- `vote.dto.ts` — `VoteCandidateDto`, `CreateVoteCandidateDto`, `VoteResultDto`, `VoteDto`, `MyVoteDto`, `VotePeriodSummaryDto`, `VoteResultExportDto`.

## Conventions

- All enum-backed fields import from `../enums`.
- Barrel (`index.ts`) re-exports all domain files; add/remove DTO file → update barrel in same commit.
- Preserve optional/null semantics matching API payloads.
- Keep domain grouping order stable for low-noise diffs.

## Anti-patterns

- No `any` or untyped extension maps.
- No nested DTO object shapes that duplicate enum values.
