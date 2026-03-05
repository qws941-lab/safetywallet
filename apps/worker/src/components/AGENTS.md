# Worker Components

Reusable UI, guard, and provider layer for worker pages.

## Purpose

- Route shell parts (header, bottom nav), status banners, cards, modals
- Auth/attendance guards for route protection
- Provider composition for app-wide context wrappers
- Network/state access delegated to hooks/lib/stores

## Files

- `attendance-guard.tsx` — attendance gate with loading/fallback modes
- `auth-guard.tsx` — auth redirect guard, public path allowlist
- `bottom-nav.tsx` — bottom navigation bar, center CTA → `/posts/new`
- `header.tsx` — attendance chip + locale switcher + system banner
- `install-banner.tsx` — PWA install prompt with 7-day dismissal
- `locale-switcher.tsx` — language selector from `i18n/config` locales
- `offline-queue-indicator.tsx` — queue length display + manual replay
- `points-card.tsx` — points summary card
- `post-card.tsx` — safety report card with status badges + urgent marker
- `providers.tsx` — app-wide provider composition (authoritative order)
- `ranking-card.tsx` — leaderboard ranking card
- `system-banner.tsx` — severity-based banner (critical/warning/info)
- `unsafe-warning-modal.tsx` — unsafe condition warning modal
- `__tests__/` — component tests mirroring component names

## Conventions

- Provider order in `providers.tsx`:
  `QueryClientProvider → I18nProvider → AuthGuard → {children} + OfflineQueueIndicator + Toaster + InstallBanner`
- `AuthGuard` public paths: `/`, `/login`, `/login/*` only
- `AuthGuard` clears React Query cache on logged-out hydrated state
- `AttendanceGuard` uses `useAttendanceToday` with polling
- `BottomNav` center label intentionally empty
- `PostCard` badge mapping covers review/action statuses + urgent marker

## Anti-Patterns

- Do not call API directly from components; use hook abstractions
- Do not widen `AuthGuard` public-route allowlist without auth policy changes
- Do not remove query cache clear on logout; prevents stale cross-session data
- Do not hardcode locale list in `LocaleSwitcher`; consume `i18n/config`
- Do not remove queue indicator storage listeners; offline replay visibility required
