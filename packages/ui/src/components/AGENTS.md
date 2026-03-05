# Components

React UI component files for `@safetywallet/ui`.

## Files

- `alert-dialog.tsx` — `AlertDialog*` compound wrappers (Radix).
- `avatar.tsx` — `Avatar`, `AvatarImage`, `AvatarFallback` (Radix).
- `badge.tsx` — `Badge`, `badgeVariants` (CVA).
- `button.tsx` — `Button`, `buttonVariants` (CVA).
- `card.tsx` — `Card*` layout primitives.
- `dialog.tsx` — `Dialog*` compound wrappers (Radix).
- `error-boundary.tsx` — `ErrorBoundary` (React class component).
- `input.tsx` — `Input`.
- `select.tsx` — `Select*` with scroll controls (Radix).
- `sheet.tsx` — `Sheet*` compound wrappers (Radix + CVA).
- `skeleton.tsx` — `Skeleton`.
- `switch.tsx` — `Switch` (Radix).
- `toast.tsx` — `Toast*` primitives + typed toast props (Radix + CVA).
- `toaster.tsx` — `Toaster` host renderer.
- `use-toast.tsx` — `useToast`, `toast`, reducer/state helpers.

## Conventions

- Radix wrapper modules: `alert-dialog`, `dialog`, `select`, `sheet`, `switch`, `toast`.
- CVA variant modules: `button`, `badge`, `toast`, `sheet`.
- DOM primitives use `React.forwardRef`.
- Export changes require matching `src/index.ts` barrel update.
- Class merging via `cn()` only.
- Toast queue constants (`TOAST_LIMIT`, `TOAST_REMOVE_DELAY`) are stable API.

## Anti-patterns

- No business-domain defaults in UI primitives.
- No hidden exports bypassing the barrel.
