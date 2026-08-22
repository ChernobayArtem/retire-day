# Codebase health

A snapshot for anyone picking up this project. Last reviewed 22 Aug 2026.

## Verdict

The codebase is in strong shape and comfortable to take over. TypeScript runs in
`strict` mode with zero `any` in application code, the architecture is cleanly
layered, and an unusually thorough set of custom audits guards the design system,
accessibility contrast, icon usage and the encrypted vault. The gaps found were
missing _standard tooling_ rather than messy code, and the main ones are now
closed.

## Scorecard

| Area                         | Status      | Notes                                                                                   |
| ---------------------------- | ----------- | --------------------------------------------------------------------------------------- |
| Architecture and layering    | Strong      | `ui / components / scenes / lib / content / styles`, barrel export in `src/ui/index.ts` |
| TypeScript strictness        | Strong      | `strict: true`, zero `any` in code, zero `@ts-ignore`                                   |
| Code hygiene                 | Strong      | No `console.*`, `TODO/FIXME`, or `as any` in `src`                                      |
| Design system and audits     | Exceptional | Token contracts, generated Figma registry, WCAG contrast and target-size audits         |
| Documentation and onboarding | Good        | `README`, `AGENTS.md`, system docs under `docs/`                                        |
| CI/CD                        | Good        | GitHub Actions builds and deploys to Pages on push to `main`                            |
| Linting                      | Added       | ESLint (flat config) with typescript-eslint, react-hooks, react-refresh, jsx-a11y       |
| Formatting                   | Added       | Prettier + EditorConfig, aligned to the existing no-semicolon, single-quote style       |
| Unit tests                   | Added       | Vitest with 20 tests across the date, progress and journey logic                        |

## What is enforced now

`npm run build` — the same script CI runs to deploy — now runs, in order:

1. `npm run format:check` — Prettier (CSS, `src/ui/tokens` and generated files excluded).
2. `npm run lint` — ESLint over `src/**`, blocks on errors (warnings pass through).
3. `npm run test` — Vitest, all unit tests must pass.
4. The existing design-system audits (colours, spacing, icons, typography,
   contrast, target size, vault).
5. `tsc` type-check, then `vite build`, then the sensitive-content audit.

Dependency installs require `legacy-peer-deps` (pinned in `.npmrc`), or CI's
`npm ci` fails and no deploy lands.

ESLint is calibrated for a first adoption: genuinely broken code is an error,
while opinionated new React rules and accessibility findings on the existing
gesture-driven components are surfaced as **warnings** to burn down over time,
not build blockers. There are currently 0 errors and 9 warnings — the ten
jsx-a11y warnings have since been resolved, leaving only React-internal and
Fast-Refresh hints.

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

The repo-wide Prettier format (commit `291a2b5`, ignored in `.git-blame-ignore-revs`)
and the accessibility-warning cleanup (commit `e126570`) from the first review are
both done, and `format:check` now gates the build. What remains:

1. **Lint the tooling scripts.** ESLint currently covers `src/**` only; the
   `scripts/*.mjs` audits are unlinted.
2. **React-hooks and Fast-Refresh warnings.** Nine non-blocking ESLint warnings
   remain (`react-hooks/set-state-in-effect`, `react-hooks/static-components`, and
   `react-refresh/only-export-components`); optional to burn down.
3. **Typography has no generated Figma registry** unlike colours and spacing, so
   drift there can only be caught by hand.
4. **Large CSS files** (`src/styles/app.css`, `src/ui/ui.css`) could be split,
   but this is cosmetic and low priority.

## Scope of this review

This was an assessment at the level of structure, configuration and metrics, plus
a first ESLint pass — not a line-by-line reading of every file. The ESLint
warnings above are the most direct list of fine-grained items worth a closer look.
