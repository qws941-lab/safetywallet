# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-05
**Commit:** 2b34910
**Branch:** master

## OVERVIEW

SafetyWallet is a TypeScript monorepo for an industrial safety platform. It contains a Cloudflare Worker API (`apps/api`), two Next.js static apps (`apps/admin`, `apps/worker`), and shared packages (`packages/types`, `packages/ui`) with CI/CD and operational runbooks.

## STRUCTURE

```text
./
├── apps/
│   ├── api/             # Hono API on Cloudflare Worker + D1/DO/KV/R2
│   ├── admin/           # Next.js admin dashboard (static export)
│   └── worker/          # Next.js worker PWA (static export)
├── packages/
│   ├── types/           # Shared DTO/enums/i18n metadata (runtime-free)
│   └── ui/              # Shared UI components and theme tokens
├── docs/                # Runbooks, checklists, requirements
├── scripts/             # Repo verification and guard scripts (Go + Node)
├── .github/workflows/   # CI/CD and automation workflows
├── ARCHITECTURE.md      # Canonical architecture overview
├── CODE_STYLE.md        # Naming/import/testing style constraints
├── turbo.json           # Turborepo task graph
└── wrangler.toml        # Root Cloudflare bindings and vars
```

## WHERE TO LOOK

| Task                             | Location                        | Notes                                                                            |
| -------------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| API routes/middleware/validators | `apps/api/src/`                 | Route tree split by domain (`auth`, `attendance`, `posts`, `education`, `admin`) |
| Admin UI flows                   | `apps/admin/src/app/`           | App Router pages and section modules                                             |
| Worker PWA flows                 | `apps/worker/src/app/`          | Offline-first worker UX and i18n runtime                                         |
| Shared request/contract types    | `packages/types/src/`           | DTOs/enums/api envelopes and i18n dictionaries                                   |
| Shared UI primitives             | `packages/ui/src/components/`   | Reusable design-system components                                                |
| CI/release/deploy behavior       | `.github/workflows/`            | Local CI + reusable-caller automation                                            |
| Ops and deployment runbook       | `docs/cloudflare-operations.md` | Worker deploy model, rollback, env notes                                         |
| Feature + requirement tracking   | `docs/requirements/`            | PRD/checklists and verification artifacts                                        |

## CODE MAP

| Entry                            | Role                                                           |
| -------------------------------- | -------------------------------------------------------------- |
| `apps/api/src/index.ts`          | API bootstrap, middleware chain, route mounting                |
| `apps/api/src/db/schema.ts`      | D1 schema and domain table definitions                         |
| `apps/admin/src/app/layout.tsx`  | Admin shell, providers, app-level wiring                       |
| `apps/worker/src/app/layout.tsx` | Worker shell, provider and auth boundaries                     |
| `apps/worker/src/lib/api.ts`     | Worker API transport + token/refresh/offline queue integration |
| `apps/admin/src/lib/api.ts`      | Admin API transport + token refresh retry                      |
| `packages/types/src/index.ts`    | Shared type barrel for all workspaces                          |
| `packages/ui/src/index.ts`       | Shared UI export barrel                                        |

## CONVENTIONS

- TypeScript strict mode across workspaces; no type suppression escape hatches.
- Tests are colocated in `__tests__` directories (`*.test.ts` / `*.test.tsx`).
- API-side validation is Zod-based and middleware-driven.
- Build path: Turbo workspace build + static aggregation into `dist/` (`build:static`).
- Deploy path is Git-ref-driven CI/Cloudflare integration; manual deploy scripts intentionally fail.
- GitHub workflows are SHA-pinned and use stable `name:` values for automation coupling.

## ANTI-PATTERNS (THIS PROJECT)

- No `as any`, `@ts-ignore`, `@ts-expect-error`, or empty `catch {}`.
- No hardcoded secrets, keys, or fixed IPs in source/docs/workflows.
- No mutable GitHub Action tags (`@v*`) when SHA pinning is required.
- No direct edits that desync route/DTO/i18n barrels from actual exports.
- No bypass of verification pipeline (`typecheck`, `lint`, `test`, `build`, `verify`).

## UNIQUE STYLES

- Worker app uses custom i18n runtime (`apps/worker/src/i18n` + `src/locales`) rather than `next-intl`.
- API includes Cloudflare-specific boundaries: Durable Objects, Queue/DLQ, KV auth cache, R2 assets.
- Project keeps hierarchical AGENTS files by domain (apps/packages/docs/scripts/.github) for local rule specialization.

## COMMANDS

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run verify
npm run check:wrangler-sync
```

## NOTES

- `ARCHITECTURE.md` is the canonical high-level architecture reference.
- `docs/requirements/REQUIREMENTS_CHECKLIST.md` is the implementation status ledger.
- `apps/api/wrangler.toml` contains API-specific overrides; root `wrangler.toml` defines shared bindings.
- Root AGENTS content must stay project-specific to this monorepo (not `.github` SSoT copy).
