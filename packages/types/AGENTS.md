# Types

Shared TypeScript type definitions, enums, DTOs, and i18n contracts for `@safetywallet/types`.

## Files

- `src/index.ts` — barrel re-exports: `./enums`, `./api`, `./dto`, `./i18n`.
- `src/enums.ts` — 24 shared enums (API + UI contract): `UserRole`, `UserStatus`, `PostType`, `PostState`, `ActionStatus`, `ActionType`, `PointsTransactionType`, `VoteStatus`, `AnnouncementStatus`, `ContentType`, `QuizStatus`, `AttemptStatus`, `TrainingType`, `TbmStatus`, `EducationCategory`, `ReviewStatus`, `ReviewResult`, `SiteRole`, `MemberStatus`, `NotificationType`, `ApiErrorCode`, `SortOrder`, `DateRange`, `PointsPolicyType`.
- `src/api.ts` — API envelope contracts: `ApiResponse<T>`, `PaginatedResponse<T>`, `ErrorResponse`.
- `src/dto/` — 11 domain DTO files + barrel (see `src/dto/AGENTS.md`).
- `src/i18n/` — typed locale catalogs (see `src/i18n/AGENTS.md`).
- `src/__tests__/` — 5 test files validating enums, DTO shapes, i18n, exports.

## Conventions

- Package is runtime-free: types, contracts, and constants only.
- Root barrel re-exports all submodules; consumers import from package root.
- Add/remove DTO file → update `src/dto/index.ts` in same commit.
- Add/remove i18n locale → update `src/i18n/index.ts` and root barrel.
- Enum literal changes are breaking across API + apps; treat as contract migration.
- Run package tests when changing exports, enums, DTO shapes, or i18n keys.

## Anti-patterns

- No app-local duplicate DTO type aliases.
- No silent enum value rewrites without migration.
- No deep imports bypassing barrel files.
