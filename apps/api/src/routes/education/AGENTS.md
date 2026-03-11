# AGENTS: ROUTES EDUCATION

## PURPOSE

- Education API route contract for content, quiz, completion, statutory, and TBM endpoints.
- Keeps the education surface split by resource family under one mounted feature router.

## INVENTORY

- Route files (8): `completions.ts`, `contents.ts`, `helpers.ts`, `index.ts`, `quiz-attempts.ts`, `quizzes.ts`, `statutory.ts`, `tbm.ts`.
- Test subtree: `__tests__/completions.test.ts`.
- Local doc: `AGENTS.md`.

## CONVENTIONS

- Keep `index.ts` mount-only and delegate resource behavior to sibling modules.
- Keep shared parsing/mapping helpers in `helpers.ts`, not copied across route files.
- Keep quiz attempt flows separate from quiz definition routes.
- Keep TBM and statutory endpoints isolated from content/quiz contracts.

## ANTI-PATTERNS

- Folding all education endpoints into a mega route file.
- Duplicating helper transforms across `contents`, `quizzes`, and `tbm` handlers.
- Mixing quiz-attempt write paths into definition/list handlers.
- Treating statutory or TBM routes as generic content aliases.

## DRIFT GUARDS

- Check `src/routes/education` file list before updating inventory bullets.
- Check `index.ts` mount order against existing sibling files.
- Check added education route modules for matching tests when behavior expands.
- Check parent `src/routes/AGENTS.md` child-doc list stays aligned.
