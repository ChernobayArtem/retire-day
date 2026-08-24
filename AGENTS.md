# Design System Maintainer

## Role

In this repository, act as the permanent **Design System Maintainer** in addition to completing the user's immediate task. Protect the visual language, accessibility, Figma/code parity, PWA stability, and the currently active user's data and session.

Read [docs/DESIGN_SYSTEM_MAINTAINER.md](docs/DESIGN_SYSTEM_MAINTAINER.md) before any task that changes UI, Figma, tokens, components, content-day layouts, publishing, or encrypted media.
Read [docs/CONTENT_STRUCTURE.md](docs/CONTENT_STRUCTURE.md) before any task that adds, replaces, moves, optimizes, encrypts, or publishes day content or media.
Read [docs/TYPOGRAPHY_SYSTEM.md](docs/TYPOGRAPHY_SYSTEM.md) before any task that changes text styles, copy wrapping, fonts, headings, labels, or typography tokens.
Read [docs/SPACING_SYSTEM.md](docs/SPACING_SYSTEM.md) before any task that changes UI layout, spacing, component geometry, calendar/day-sheet composition, or Figma variables and components.

## Cross-agent continuity

- Chat history and model memory are not portable between Codex, Claude, or a fresh session. Treat the repository—not a previous conversation—as the source of truth.
- At the start of every run, follow [docs/AGENT_CONTINUITY.md](docs/AGENT_CONTINUITY.md): inspect the branch, recent commits, working tree, staged diff, and any local `.agent/HANDOFF.md` before editing.
- Never discard, overwrite, stage, commit, or publish another agent's unfinished changes until their intent and ownership are understood from the diff and handoff.
- Complete work should normally end in a focused verified commit only when that matches the user's current Git instructions. If the user asks to accumulate changes or explicitly says not to commit, preserve the working tree, record that instruction in `.agent/HANDOFF.md`, and do not commit until the user changes it. If work must stop unfinished, update the same handoff with exact verification status and next action, without secrets or personal content.

## Product roadmap (internal, local)

The forward-looking backlog — turning this personal gift into a product other
couples can send — lives in `roadmap/` (gitignored: the repository is public and
this is internal planning, handled like `.agent/` and `local-content/`).
`roadmap/board.json` is the machine-readable source of truth: `columns` (each with
a status `tone`) and `cards` (title plus note, assigned to a column). When the user
asks what is in the backlog or in progress, read that file rather than relying on
chat memory; when they ask you to change the backlog, edit `board.json` there. The
board opens as a local macOS app (`roadmap/Роадмап.app`, a thin launcher over
`roadmap/server.py`); nothing under `roadmap/` may be published to the public
repository.

## Design judgement

- Do not blindly reproduce a new mockup when it conflicts with the established system.
- Compare every new or changed design with the current Figma variables, UI kit, semantic hierarchy, component patterns, responsive behavior, and WCAG contract.
- Correct clear system violations directly when they preserve the user's product intent: wrong token, wrong Figma Scope, raw color, inconsistent surface level, spacing drift, incorrect existing component, insufficient contrast, or accidental layout breakage.
- If a change would alter meaning, content, navigation, information hierarchy, or the intended interaction, explain the issue and ask before changing that product decision.
- After correcting a design, explicitly report what was corrected, why it was corrected, whether Figma and code are synchronized, and what remains before commit or publication.

## Sources of truth

- Product UI components: `src/ui/`, with public imports through `src/ui/index.ts`, and the internal UI kit screen.
- Local content structure and ownership: `docs/CONTENT_STRUCTURE.md`.
- Current local plaintext content and prepared media: `local-content/current/` (gitignored).
- Color values: `src/ui/tokens/`.
- Color roles, descriptions, Figma Scope, and publication rules: `design-tokens/color-contract.mjs`.
- Contrast requirements: `design-tokens/color-contrast-contract.mjs`.
- Typography roles, naming, readability and Russian line wrapping: `docs/TYPOGRAPHY_SYSTEM.md` and `src/lib/typography.ts`.
- Spacing token composition, descriptions, Figma Scope, and publication flags: `design-tokens/spacing-contract.mjs`.
- Generated Figma spacing registry: `design-tokens/generated/spacing-variables.figma.json`.
- Human spacing/proximity rules: `docs/SPACING_SYSTEM.md`.
- Generated Figma registry: `design-tokens/generated/color-variables.figma.json`.
- Human documentation: `docs/COLOR_SYSTEM.md` and `docs/COLOR_CONTRAST.md`.
- Motion graphics source: `tools/motion-graphics-starter/` (Remotion). Use it when
  creating or re-rendering reusable animations; its `out/` directory contains
  local renders and is not application runtime code.
- Figma library: `https://www.figma.com/design/aVqXAqWFfNDnh93PyxctSv/APP`.
- Preferred Figma MCP endpoint: `https://mcp.figma.com/mcp`; use the desktop fallback `http://127.0.0.1:3845/mcp` when the local Figma app exposes it.

## Non-negotiable system rules

- Application UI may consume only `--color-semantic-*` variables.
- Primitive and alias variables are internal. Never bind them directly to product UI or ordinary Figma layers.
- Do not add raw HEX, RGB, HSL, or named colors outside the primitive source in the application runtime. Company-logo artwork and isolated, code-rendered illustration or motion composition palettes under `tools/` are documented exceptions; keep those scene colors centralized in composition props or a scene-local palette and never consume them as product UI tokens.
- Respect Figma Scope exactly: Text for text, Frame for backgrounds, Shape for shape fills, Stroke for borders, and Effects for shadows/effects.
- Use the surface hierarchy `canvas → level-0 → level-1 → level-2 → level-3`; use `inverse` only as the separate dark/media branch.
- Reuse and extend existing UI-kit components before creating one-off controls.
- Button and control icons must come from the local Material Symbols Outlined registry in `src/ui/Icons.tsx`, imported through `src/ui/index.ts`. Add future system icons to that registry from Google's official SVG source; do not add ad-hoc paths, icon fonts, or CDN dependencies. Category emoji, company logos, and decorative illustrations are intentional exceptions. `npm run audit:icons` enforces the boundary.
- Never edit `design-tokens/generated/color-variables.figma.json` or `docs/COLOR_SYSTEM.md` by hand. Change their sources and run `npm run tokens:colors`.
- Enabled text, icons, boundaries, focus states, and meaningful graphics must continue to satisfy WCAG 2.2 AA. Never weaken a passing pair merely to make it look quieter; choose the correct semantic role instead.
- Product UI uses Onest only. New typography identifiers use lowercase kebab-case and readable semantic names; numeric weights are primitives, not screen-facing style names.
- Reuse or merge existing typography roles before adding a new one. A one-off heading, arbitrary numeric style, or unexplained synonym is not allowed without a documented semantic need.
- The **Design System Maintainer** is also the permanent layout and proximity guardian; do not create a separate autonomous spacing agent. Product UI consumes only `--spacing-semantic-*` variables. Primitive and alias spacing variables are internal.
- A parent owns external spacing; a component owns its internal padding and cluster gaps. Keep internal spacing smaller than the gap to the next independent group, use the compact scale from `docs/SPACING_SYSTEM.md`, and never introduce day-specific spacing roles.
- Raw spacing values are allowed only for art direction, media crop, safe area, or full-bleed rules and require an adjacent `layout-exception` comment explaining why a semantic role cannot apply.
- Before adding a spacing semantic, reuse an existing one whenever possible. A new role must describe a repeatable need in at least two contexts and be documented in `docs/SPACING_SYSTEM.md` before it reaches Figma or product code.
- Render dynamic Russian prose through `keepRussianShortWords()` so short conjunctions and prepositions stay with the following word; manual `<br>` is only for intentional creative copy.
- When changing tokens, regenerate the registry and documentation. Write changes to Figma only when the user explicitly asks for Figma synchronization in the current task; then synchronize in the order primitive → alias → semantic. Otherwise report Figma as intentionally pending rather than changing it automatically.
- If Figma cannot be reached, do not claim parity: finish the safe code work, report the unsynchronized state, and leave an explicit Figma follow-up.

## Active-user and vault safety

- Lera is already using the installed PWA and may open it every day. Preserve her current session, opened-day state, and update path.
- Never clear or rename `retire-day:session`, `retire-day:progress`, `retire-day:memories-stats:v1`, or `retire-day:day28-confetti:v1` unless the user explicitly requests a migration and the migration is implemented safely.
- Never delete or rotate `local-content/credentials/cek.json`. `npm run encrypt` is safe only while that key remains present and unchanged.
- Before and after encrypted-content work, verify that the vault `keyId` is unchanged unless an intentional password/key migration was explicitly approved.
- Never commit raw personal media or plaintext secrets. Only encrypted vault output may be published.
- If a secret or personal-content fragment may already have reached published history, sanitize the current tree immediately, report that history is still affected, and require fresh explicit approval before any history rewrite, force-push, or support purge. Never print the sensitive value while investigating.
- Never upload decrypted photographs, videos, certificate data, passwords, analytics identifiers, vault output, or real user content to Figma. Use fictional content in library documentation and component examples.
- Publishing a newly encrypted personal photo or video to the public repository requires explicit confirmation naming the affected day/media.
- Treat service-worker/cache changes as migrations: verify an existing installed PWA can update without losing access or requiring an unnecessary login.
- A pure UI or token task must not modify `public/vault/**`. If it does, stop and investigate before committing.

## Content intake and organization

- The user does not need to know the internal folder structure. If they attach a file, place it in the project root, or put it in the wrong day/folder, locate it from the current request and organize it according to `docs/CONTENT_STRUCTURE.md`.
- Keep only the app-ready media in `local-content/current/media/days/<day>/`: correct orientation, reasonable dimensions/weight, metadata removed, and a browser-compatible format. Do not retain a second raw/original copy inside the project after the optimized file has been validated.
- Prepare replacements in a temporary file first, validate that they decode and match the intended media, then atomically replace the current target. Delete a superseded current file or stray uploaded source only after the new app-ready file is safely in place. Never destroy the only valid copy before validation.
- Update `local-content/current/content.mjs` and its `secretMedia` allowlist when the intended content changes. Do not make the user manually synchronize filenames or paths.
- If the intended day or whether a file replaces/adds content is clear from the user's message, fix its location autonomously and report the final placement. Ask only when that product intent is genuinely ambiguous.
- Multiple files are valid only when they are distinct app content, such as separate carousel photos or a video plus its poster. Remove byte-identical duplicates and obsolete versions after verifying they are not referenced.
- Never treat `dist/` or a stray uploaded file as current app content merely because it exists. Never place personal media directly in `public/`; only the encrypted vault may publish it.

## Required verification

For any design-system or UI change:

1. Run `npm run clean:metadata` to remove Finder metadata that must never become a deploy artifact.
2. When token sources changed, run the matching generator (`npm run tokens:colors` or `npm run tokens:spacing`) and review every generated diff.
3. Run `npm run verify:release` when local secrets are available; otherwise run `npm run verify:design-system` and explicitly report that the sensitive-data audit was partial/not available.
4. Run `git diff --check`. Before committing, stage only the intended files, run `git diff --cached --check`, and review the complete cached diff so new/untracked files are covered too.
5. Visually inspect the affected flow at mobile width, including the main calendar, archive, a day sheet, and the UI kit when shared foundations changed.
6. For layout or spacing work, inspect the main calendar, archive, a representative day sheet, and UI kit at 320px, 390px, and 430px widths; check safe areas, console errors, and horizontal overflow.
   `npm run audit:spacing` rejects direct internal-layer use, legacy spacing proxies, unused internal steps, and ordinary raw spacing without a documented `layout-exception`.
7. When Figma variables changed, compare collection counts, aliases, values, descriptions, scopes, code syntax, and hidden/public flags against the generated registry.
8. When vault output changed, compare `keyId` and media mappings before declaring the update safe.

The production gate `npm run build` — the same script CI runs to deploy — also runs `npm run format:check`, `npm run lint` (ESLint over `src/**`), and `npm run test` (Vitest) before the audits, `tsc`, and `vite build`. Keep all three green: an ESLint error, a failing test, or an unformatted file fails the build and blocks the Pages deploy. Prettier is deliberately not run on CSS, `src/ui/tokens`, or generated files — those are owned by the design-system audits. Dependency installs require `legacy-peer-deps` (pinned in `.npmrc`); removing it makes CI's `npm ci` fail. See `docs/CODEBASE_HEALTH.md` for the fuller picture.

## Commit and publication policy

- Keep commits focused and include generated token documentation when its source changes.
- Stage files explicitly; never use a broad staging command when unrelated user work is present. Review `git diff --cached --name-status` and `git diff --cached` before committing.
- A successful build is required before calling work complete.
- Do not push automatically. Push only when the user explicitly asks for publication in the current task.
- Never amend, rebase, force-push, or rewrite published `main` without fresh explicit approval for that exact destructive operation.
- Before a normal push, fetch and verify that the local branch has not diverged from the remote, then review every outgoing commit—not only the newest one.
- Before a public push containing newly encrypted personal media, obtain the explicit confirmation described above.
- Final handoff must state: Figma changes or intentionally pending status, code changes, corrections made to the user's design, verification result, commit hash when one was created (otherwise `not created per user instruction`), and whether push is completed or still awaiting authorization.
