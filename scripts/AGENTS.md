# Scripts

Operational and development tooling scripts.

## Files

- `verify.go` — umbrella verification runner (lint, type-check, test, build).
- `git-preflight.go` — push-readiness gate (branch, uncommitted changes, anti-patterns).
- `check-anti-patterns.go` — blocks commits containing forbidden patterns from AGENTS.md.
- `build-static.go` — builds static assets for worker-app.
- `create-cf-token.go` — creates scoped Cloudflare API tokens.
- `check-wrangler-sync.js` — ensures root and app `wrangler.toml` binding IDs match.
- `lint-naming.js` — validates monorepo package naming conventions (kebab-case).
- `create-test-user.ts` — generates test user SQL with HMAC hashing.
- `hash-admin-password.ts` — generates PBKDF2 hash for admin password secret.
- `create-test-user.sql` — generated SQL output for test user insertion.
- `migrate-s4-enums.sql` — D1 migration for S4 post state machine enum values.

## Conventions

- Go-first policy for operational scripts.
- Node.js exception for ecosystem-tied validators, hooks, and linters.
- CI-facing scripts must be deterministic, non-interactive, and exit-code strict.
- Secret values from env/flags only; never hardcode credentials.

## Anti-patterns

- No local-path assumptions in CI scripts.
- No plaintext token or password defaults.
