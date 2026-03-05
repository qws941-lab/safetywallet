# Attendance

## Scope

Attendance admin pages: logs, unmatched record review, FAS sync diagnostics.

## Files

- `page.tsx` — primary attendance page; logs/unmatched tab orchestration.
- `page.test.tsx` — route behavior tests.
- `attendance-helpers.ts` — KST/date/status helper utilities.
- `attendance-helpers.test.ts` — helper unit tests.
- `error.tsx` — feature-scoped error fallback.
- `components/attendance-logs-tab.tsx` — logs table + filter surface.
- `components/unmatched-tab.tsx` — unresolved attendance records table.
- `components/attendance-stats.tsx` — summary counters/cards.
- `sync/page.tsx` — sync dashboard route.
- `sync/sync-helpers.ts` — sync health/format normalization helpers.
- `sync/components/status-cards.tsx` — sync status overview.
- `sync/components/manual-sync-card.tsx` — manual sync trigger.
- `sync/components/fas-search-card.tsx` — FAS search interface.
- `sync/components/sync-errors-card.tsx` — sync error display.
- `sync/components/sync-logs-card.tsx` — sync log viewer.
- `sync/components/__tests__/` — sync component tests.
- `sync/__tests__/` — sync route tests.
- `unmatched/page.tsx` — direct deep-link unmatched view.
- `unmatched/__tests__/` — unmatched route tests.

## Operation Flow

- Logs tab: query + filter + anomaly review for attendance events.
- Unmatched tab: detect records lacking worker/site linkage.
- Sync page: inspect health, run manual sync, review recent sync errors.

## Patterns

- In-page tab switching for logs/unmatched avoids full route transition.
- Derived anomaly flags on log rows (timing irregularities, duplicate-name suspicion).
- Sync health normalization treats multiple backend variants as healthy.
- Helper utilities centralize display labels and timezone/date shaping.

## Constraints

- `useAttendanceLogs` uses high limit (`2000`) by design for admin-side filtering.
- `unmatched/page.tsx` and unmatched tab in `page.tsx` must stay behavior-aligned.
- Date partitioning logic assumes KST operational context.

## Boundary

- API behavior in `src/hooks/use-attendance.ts` and `src/hooks/use-fas-sync.ts`.
