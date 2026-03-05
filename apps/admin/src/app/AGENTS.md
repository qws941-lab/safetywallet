# App Routes

## Scope

Next.js 15 App Router route layer. Pages, error boundaries, route-local helpers/components.

## Route System

- Total route pages: 31 (`**/page.tsx`).
- Root redirect: `page.tsx` → `/dashboard`.
- Shared wrappers: `layout.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`.
- CSS entry: `globals.css`.
- Tests: `page.test.tsx`, `not-found.test.tsx`.

## Page Groups

- Core: `dashboard`, `dashboard/analytics`, `dashboard/recommendations`.
- Operations: `attendance`, `attendance/sync`, `attendance/unmatched`, `monitoring`, `sync-errors`.
- Content: `posts`, `posts/[id]`, `actions`, `announcements`.
- Issues: `issues`.
- Voting: `votes`, `votes/new`, `votes/candidates`, `votes/[id]`, `votes/[id]/candidates/new`.
- Governance: `approvals`, `audit`, `recommendations`, `settings`.
- Members/rewards: `members`, `members/[id]`, `rewards`.
- Points: `points`, `points/policies`, `points/settlement`.
- Training: `education`.
- Auth: `login`.

## Route-Local Files

- Attendance: `attendance/components/*`, `attendance-helpers.ts`, `attendance-helpers.test.ts`.
- Votes: `votes/components/*`, `votes-helpers.ts`.
- Education: `education/components/*`, `education-helpers.ts`.
- Posts detail: `posts/[id]/post-detail.tsx`, `post-detail-helpers.ts`, `[id]/components/*`.

## Patterns

- Dynamic wrappers for static export: `posts/[id]`, `votes/[id]`, `votes/[id]/candidates/new`, `members/[id]`.
- Wrapper pages use placeholder `generateStaticParams` + client component handoff.
- Feature pages keep orchestration in `page.tsx`; UI blocks in `components/`.

## Section Doc Links

- `attendance/AGENTS.md` — logs/unmatched/sync.
- `posts/AGENTS.md` — post review list/detail.
- `votes/AGENTS.md` — month-period vote workflows.
- `education/AGENTS.md` — education tab architecture.

## Gotchas

- `attendance/page.tsx` renders unmatched tab state; deep-link unmatched page still required.
- `approvals/page.tsx` is active; not a placeholder.
- Static export compatibility depends on wrapper routes staying lightweight.
