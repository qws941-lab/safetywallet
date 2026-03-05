# Admin Dashboard

Next.js 15 App Router admin SPA, statically exported, served via R2 `ASSETS` binding at `admin.*` hostname (port 3001).

## Structure

- `src/app/` — 31 route pages (App Router). See `src/app/AGENTS.md`.
- `src/components/` — shared shell, sidebar, data-table, review-actions, approvals. See `src/components/AGENTS.md`.
- `src/hooks/` — 33 TanStack Query hook modules. See `src/hooks/AGENTS.md`.
- `src/stores/` — Zustand auth store (persist key `safetywallet-admin-auth`). See `src/stores/AGENTS.md`.
- `src/lib/` — `apiFetch` client + `cn` utility. See `src/lib/AGENTS.md`.

## Core Integration Files

- `src/app/layout.tsx` — shell composition root.
- `src/components/admin-shell.tsx` — auth-gated app frame.
- `src/components/providers.tsx` — QueryClient + bootstrap.
- `src/components/sidebar.tsx` — nav + site switching.
- `src/stores/auth.ts` — persisted user/tokens/site context.
- `src/lib/api.ts` — API client with refresh-on-401 retry.

## Route Groups

- `dashboard` (+ `analytics`, `recommendations`).
- `attendance` (+ `sync`, `unmatched`).
- `posts`, `posts/[id]`.
- `votes` (+ `new`, `candidates`, `[id]`, `[id]/candidates/new`).
- `actions`, `announcements`, `approvals`, `audit`.
- `education`, `issues`, `monitoring`, `sync-errors`.
- `points` (+ `policies`, `settlement`).
- `members` (+ `[id]`), `rewards`, `recommendations`, `settings`, `login`.

## Conventions

- Dynamic route wrappers for static export: `generateStaticParams` placeholder + client page import.
- Site-scoped queries use `currentSiteId` from auth store.
- Query invalidation in hook mutation layers, not page components.
- Sidebar always mounted: icon rail on mobile (`w-16`), expandable on desktop (`md:w-64`).
- Data stack: TanStack Query (staleTime 2min, retry 1) + Zustand stores.
- API calls via `lib/api.ts` `apiFetch` with `API_BASE` constant.
- Korean-primary labels/content.

## Anti-patterns

- Do not duplicate `API_BASE` or refresh-token logic outside `src/lib/api.ts`.
- Do not put query invalidation in page components — keep it in hooks.
- Do not break static export by adding server-side dependencies to wrapper routes.

## Child Agents

- `src/app/AGENTS.md` — route topology.
- `src/app/attendance/AGENTS.md` — logs/unmatched/sync.
- `src/app/education/AGENTS.md` — tabbed education hub.
- `src/app/posts/AGENTS.md` — post review list/detail.
- `src/app/votes/AGENTS.md` — vote period/candidate/result flows.
- `src/components/AGENTS.md` — shell/sidebar/provider components.
- `src/hooks/AGENTS.md` — 33-hook inventory.
- `src/hooks/__tests__/AGENTS.md` — hook test harness.
- `src/stores/AGENTS.md` — auth store contract.
- `src/lib/AGENTS.md` — API client boundary.
