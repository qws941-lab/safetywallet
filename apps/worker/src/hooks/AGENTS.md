# Worker Hooks

Client hook layer for API access, auth/i18n adapters, PWA behaviors.

## Purpose

- Centralize React Query usage and cache invalidation rules
- Expose stable hooks to pages/components; hide fetch/store internals
- Domain-specific API hooks with offline support

## Files

- `use-actions-api.ts` — corrective action CRUD queries/mutations
- `use-api-base.ts` — shared query/mutation factories with `apiFetch`
- `use-api.ts` — barrel re-export (no logic)
- `use-attendance-api.ts` — attendance check-in with 5-min polling
- `use-auth.ts` — thin selector facade over `useAuthStore`
- `use-education-api.ts` — education content + quiz attempt queries
- `use-install-prompt.ts` — PWA install prompt with dismissal tracking
- `use-leaderboard.ts` — leaderboard/ranking queries
- `use-locale.ts` — locale state adapter over `I18nProvider`
- `use-posts-api.ts` — safety report CRUD with offline queue support
- `use-push-subscription.ts` — push notification subscription management
- `use-recommendations-api.ts` — AI recommendation queries
- `use-system-api.ts` — system announcements/banners
- `use-translation.ts` — `t()` function adapter over `useI18n`
- `__tests__/` — hook behavior and regression tests

## Conventions

- `use-api.ts` re-exports domain hooks; no logic in barrel
- Query keys are tuple-style, domain-prefixed (`["posts", siteId]`)
- Mutations invalidate related domain keys explicitly
- Offline-safe mutations use `offlineQueue: true`
- `useAttendanceToday` polls every 5 min (`staleTime` + `refetchInterval`)
- `useAuth` is thin selector over `useAuthStore`
- `useLocale` and `I18nProvider` both persist `i18n-locale`
- `usePushSubscription` requires authenticated state before subscription check
- `useInstallPrompt` stores dismissal at `safetywallet-install-dismissed`

## Anti-Patterns

- Do not add API calls directly in pages when equivalent hook exists
- Do not collapse tuple query keys to strings; invalidation precision degrades
- Do not remove `enabled` guards on site/ID-dependent hooks
- Do not replace `apiFetch` with raw `fetch` in domain API hooks
- Do not return untyped `any` from hook payloads; keep DTO/shape explicit
