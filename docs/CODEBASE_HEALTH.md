# Codebase health

A snapshot for anyone picking up this project. Last reviewed 22 Aug 2026.

## Verdict

The codebase is in strong shape and comfortable to take over. TypeScript runs in
`strict` mode with zero `any` in application code, the architecture is cleanly
layered, and an unusually thorough set of custom audits guards the design system,
accessibility contrast, icon usage and the encrypted vault. The gaps found were
missing *standard tooling* rather than messy code, and the main ones are now
closed.

## Scorecard

| Area | Status | Notes |
| --- | --- | --- |
| Architecture and layering | Strong | `ui / components / scenes / lib / content / styles`, barrel export in `src/ui/index.ts` |
| TypeScript strictness | Strong | `strict: true`, zero `any` in code, zero `@ts-ignore` |
| Code hygiene | Strong | No `console.*`, `TODO/FIXME`, or `as any` in `src` |
| Design system and audits | Exceptional | Token contracts, generated Figma registry, WCAG contrast and target-size audits |
| Documentation and onboarding | Good | `README`, `AGENTS.md`, system docs under `docs/` |
| CI/CD | Good | GitHub Actions builds and deploys to Pages on push to `main` |
| Linting | Added | ESLint (flat config) with typescript-eslint, react-hooks, react-refresh, jsx-a11y |
| Formatting | Added | Prettier + EditorConfig, aligned to the existing no-semicolon, single-quote style |
| Unit tests | Added | Vitest with 20 tests across the date, progress and journey logic |

## What is enforced now

`npm run build` — the same script CI runs to deploy — now runs, in order:

1. `npm run lint` — ESLint, blocks on errors (warnings are allowed through).
2. `npm run test` — Vitest, all unit tests must pass.
3. The existing design-system audits (colours, spacing, icons, typography,
   contrast, target size, vault).
4. `tsc` type-check, then `vite build`, then the sensitive-content audit.

ESLint is calibrated for a first adoption: genuinely broken code is an error,
while opinionated new React rules and accessibility findings on the existing
gesture-driven components are surfaced as **warnings** to burn down over time,
not build blockers. There are currently 0 errors and 19 warnings.

## Developer quickstart

```bash
npm install        # install dependencies
npm run dev        # http://localhost:5173/retire-day/
npm run lint       # ESLint
npm run format     # Prettier, write
npm run test       # Vitest, run once
npm run build      # full gate: lint, test, audits, type-check, production build
```

## Follow-ups, by priority

1. **Repo-wide Prettier format (pending owner approval).** Prettier is configured
   but existing files are not yet formatted to it; a one-time `npm run format`
   reformats roughly 87 files. It is purely mechanical (no behaviour change) and
   should land as its own commit, recorded in a `.git-blame-ignore-revs` file so
   `git blame` skips it. Only after that should `format:check` join the build gate.
2. **Accessibility warnings.** ESLint surfaces keyboard/interaction warnings on
   `ZoomableLightbox`, `VideoLightbox` and `DaySheet`, plus autofocus on `Gate`.
   Each needs a human review — some are intentional, some deserve a keyboard path.
3. **Lint the tooling scripts.** ESLint currently covers `src/**` only; the
   `scripts/*.mjs` audits are unlinted.
4. **Typography has no generated Figma registry** unlike colours and spacing, so
   drift there can only be caught by hand.
5. **Large CSS files** (`src/styles/app.css`, `src/ui/ui.css`) could be split,
   but this is cosmetic and low priority.

## Scope of this review

This was an assessment at the level of structure, configuration and metrics, plus
a first ESLint pass — not a line-by-line reading of every file. The ESLint
warnings above are the most direct list of fine-grained items worth a closer look.
