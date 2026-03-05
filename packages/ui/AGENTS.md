# UI

Shared React component library and theme primitives for `@safetywallet/ui`.

## Files

- `src/index.ts` — public barrel: `cn`, `Button`, `Card*`, `Input`, `Badge`, `Skeleton`, `Avatar*`, `AlertDialog*`, `Dialog*`, `Sheet*`, `Select*`, `Toast*`, `useToast`, `toast`, `Toaster`, `Switch`, `ErrorBoundary`.
- `src/globals.css` — HSL token system (background/foreground/surface/action/status) with `success` + `warning` custom tokens beyond shadcn defaults.
- `src/lib/utils.ts` — `cn()` helper (`clsx` + `twMerge`).
- `src/components/` — 15 component files (see `src/components/AGENTS.md`).
- `src/__tests__/` — 8 test files (7 test suites + setup).

## Conventions

- Add/remove component file → update `src/index.ts` in same commit.
- Class merging via `cn()` only; no ad-hoc class concatenation.
- Token rename/removal requires consuming app migration.
- Keep components free of app-specific business strings.

## Anti-patterns

- No undocumented public exports from component files.
- No duplicate `cn` helpers outside `lib/utils.ts`.
