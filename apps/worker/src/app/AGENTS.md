# Worker App Routes

Next App Router page layer for worker flows.

## Purpose

- Route topology, page composition, redirect behavior
- Per-route logic in route folders; shared logic in `src/components`/`src/hooks`
- 16 route pages total

## Files

- `layout.tsx` — root shell (`html lang="ko"`, fixed mobile viewport, provider mount)
- `page.tsx` — entry redirect (`/` → `/login/` or `/home/` after hydration)
- `error.tsx` — error boundary
- `globals.css` — global styles, Tailwind v4 imports
- `actions/` — corrective action list + detail view
- `announcements/` — company announcements
- `education/` — education content + quiz-take + detail view
- `home/` — authenticated landing page
- `login/` — login form (route-local `login-client.tsx`)
- `points/` — points history
- `posts/` — safety reports list + new post + detail view
- `profile/` — user profile
- `register/` — redirects to `/login/`
- `votes/` — voting interface
- `__tests__/` — route-level tests

## Route Map (16 pages)

| Route                  | File                           |
| ---------------------- | ------------------------------ |
| `/`                    | `page.tsx` (redirect)          |
| `/actions`             | `actions/page.tsx`             |
| `/actions/view`        | `actions/view/page.tsx`        |
| `/announcements`       | `announcements/page.tsx`       |
| `/education`           | `education/page.tsx`           |
| `/education/quiz-take` | `education/quiz-take/page.tsx` |
| `/education/view`      | `education/view/page.tsx`      |
| `/home`                | `home/page.tsx`                |
| `/login`               | `login/page.tsx`               |
| `/points`              | `points/page.tsx`              |
| `/posts`               | `posts/page.tsx`               |
| `/posts/new`           | `posts/new/page.tsx`           |
| `/posts/view`          | `posts/view/page.tsx`          |
| `/profile`             | `profile/page.tsx`             |
| `/register`            | `register/page.tsx`            |
| `/votes`               | `votes/page.tsx`               |

## Conventions

- Protected screens compose `Header` + page body + `BottomNav`
- Detail routes use query string IDs (`/posts/view?id=...`, `/actions/view?id=...`)
- Redirect paths use trailing slash targets (`/login/`, `/home/`)
- Login flow is route-local (`login-client.tsx`): `/auth/login` then `/auth/me`
- New post supports offline create (`offlineQueue: true`) + post-create media upload
- Post draft retention: 24h; key pattern `safetywallet_post_draft_<siteId>`

## Anti-Patterns

- Do not add registration UI under `/register`; intentional redirect to `/login/`
- Do not remove hydration guard before redirect in `page.tsx`
- Do not assume media upload success equals post create success in `posts/new`
- Do not hardcode Korean/English text; use translation keys via `useTranslation`
