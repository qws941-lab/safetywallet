# I18n

Typed locale catalog contracts for `@safetywallet/types`.

## Files

- `ko.ts` — Korean catalog (`as const`, dot-notated `section.key` format, 27 section groups).
- `index.ts` — locale registry (`const i18n = { ko }`) + exported types (`I18n`, `Ko`).

## Conventions

- `ko.ts` exports `export const ko = { ... } as const` and `export type Ko = typeof ko`.
- `index.ts` exports `I18n = typeof i18n` for type-safe locale access.
- Flat key structure: `section.key` format, no nested locale objects.
- Section groups (27): `login`, `register`, `home`, `posts`, `postsCreate`, `postsView`, `points`, `votes`, `actions`, `actionsCreate`, `actionsView`, `announcements`, `education`, `educationQuizTake`, `educationView`, `profile`, `nav`, `common`, `unsafeWarning`, `authGuard`, `attendanceGuard`, `layout`, `providers`, `header`, `pointsCard`, `postCard`, `rankingCard`.
- New keys go under existing semantic sections when possible.
- New section prefix is a contract change; update consumers and tests.

## Anti-patterns

- No nested key hierarchy beyond `section.key`.
- No alias locale objects with divergent keys.
