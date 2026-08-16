# Design System Maintainer playbook

## Purpose

The maintainer keeps one coherent system across the production PWA, the internal UI kit, the token registry, and the Figma library. It is expected to exercise design judgement, not only translate pixels. It is also the permanent **layout and proximity guardian**: there is no separate autonomous spacing agent.

## Operating loop

### 1. Inspect

- Read the request, affected implementation, nearby existing components, and the relevant Figma nodes.
- Read `docs/SPACING_SYSTEM.md` before any UI-layout, component-geometry, calendar/day-sheet, or Figma task. It defines the human contract for internal versus external spacing and proximity; `design-tokens/spacing-contract.mjs` is the machine-readable token contract.
- Determine whether the change starts in Figma, in code, or in content.
- Record the current Git state and preserve unrelated user changes.
- For an installed-PWA or vault change, identify the existing migration and session constraints before editing.

### 2. Review the design

Check the proposal against:

- semantic color roles and Figma Scope;
- surface nesting and the proximity/grouping contract in `docs/SPACING_SYSTEM.md`;
- typography and semantic spacing already established by the UI kit;
- typography naming and readable-copy rules in `docs/TYPOGRAPHY_SYSTEM.md`;
- control variants, touch targets, safe areas, and mobile scrolling;
- content hierarchy and consistent day-sheet patterns;
- WCAG contrast and focus visibility;
- existing empty, loading, error, disabled, and media states.
- accessible names, focus behavior, reduced motion, safe areas, and touch targets.
- system icon consistency: button and control glyphs use the local Material Symbols Outlined registry in `src/ui/Icons.tsx`; category emoji, company logos, and decorative artwork are not replaced by UI glyphs. Run `npm run audit:icons` after adding or changing an icon.

Fix a clear system mistake immediately when the product intent stays the same. Examples include replacing a raw color with a semantic token, correcting a wrong surface level, using the existing white button instead of inventing a new one, fixing spacing that breaks proximity, or repairing a failing contrast pair.

For layout, the parent owns the external gap and the component owns internal
padding or cluster gaps. Prefer existing `--spacing-semantic-*` roles; do not
invent a new role for one screen or day. Any new spacing role must represent a
repeatable need in at least two contexts, be documented in
  `docs/SPACING_SYSTEM.md`, added to `design-tokens/spacing-contract.mjs`, and be added primitive → alias → semantic. Raw
spacing is limited to art direction, media crop, safe area, and full-bleed
rules, each with an adjacent `layout-exception` comment.

For text changes, reuse or merge the six semantic roles, keep identifiers
lowercase kebab-case, use Onest, and route dynamic Russian copy through
`keepRussianShortWords()`. Do not add a numeric or screen-specific style
without a documented semantic distinction.

Escalate before changing product intent. Examples include removing content, changing navigation, changing which days are revealed, changing copy meaning, changing authentication, or changing the vault key.

### 3. Synchronize

When the user explicitly asks for Figma work and Figma leads:

1. Correct safe design-system violations in Figma.
2. Explain the correction in the handoff.
3. Implement the corrected design in code using existing components and semantic tokens.
4. Update or extend the UI kit when a reusable component or state was introduced.

When code leads and the user explicitly requested Figma synchronization:

1. Update the token/component source of truth.
2. Regenerate derived documentation and the Figma-ready registry.
3. Update the Figma variables or components.
4. Perform an exact Figma ↔ registry comparison before handoff.

Color-variable synchronization order is always:

1. `color-primitives` — internal and hidden;
2. `color-alias` — internal and hidden;
3. `color-semantic` — the only public collection.

Spacing-variable synchronization order is always:

1. `spacing-primitives` — internal, hidden, FLOAT, Scope `[]`;
2. `spacing-alias` — internal, hidden, FLOAT, Scope `[]`;
3. `spacing-semantic` — the only public collection, FLOAT, Scope `[GAP]`.

Product code and ordinary Figma layers bind only to `spacing-semantic`; the
required CSS names start with `--spacing-semantic-`. Preserve each variable's
description, value or alias, code syntax, Scope, and publication flag exactly.

Descriptions and Scope are part of the contract, not optional documentation.
Do not write to Figma automatically during ordinary code or token work. If the
user did not explicitly request Figma synchronization in the current task,
finish the registry/code work and report Figma as intentionally pending.
Use the project Figma file at `https://www.figma.com/design/aVqXAqWFfNDnh93PyxctSv/APP`;
prefer `https://mcp.figma.com/mcp` and use the local desktop endpoint
`http://127.0.0.1:3845/mcp` as a fallback when available.
If the connector is unavailable, never report the design as synchronized—record
the exact pending Figma action instead.

Figma library pages and component examples must contain fictional showcase data only. Do not upload decrypted photos or video, certificates or codes, passwords, analytics identifiers, vault artifacts, or other real user content.

### 4. Verify

Run:

```sh
npm run verify:release
git diff --check
```

For typography or copy-wrapping work, run `npm run audit:typography` as part
of the same verification; production `build` also enforces this audit.

When token sources changed, first run `npm run tokens:colors` and review the generated diff. `verify:release` checks the local plaintext source for accidental exposure, authenticates and decrypts the encrypted vault, compares its content and media with the local sources, runs the structural color audit, strict WCAG audit, TypeScript, and a production build, then scans the fresh ignored `dist/` output again. It may refresh ignored build artifacts, but it must not rewrite tracked sources or `public/vault/**`. In an environment without local secrets, use `npm run verify:design-system`; its portable audits still validate structure and public-file policy, but report that source-backed sensitive-data and decryption checks were unavailable. Never silently describe that as a full release check.

For shared foundations, visually inspect at least:

- the main calendar;
- the surprise archive;
- one representative day sheet;
- the UI kit;
- the affected photo/video fullscreen state when media controls changed.

Inspect the main calendar, archive, representative day sheet, and UI kit at
320px, 390px, and 430px widths. Confirm safe areas, no horizontal overflow,
clear proximity between groups, and console errors. Test on a real installed
iPhone PWA when a change touches the keyboard, safe areas, orientation, media
download/fullscreen, storage, service worker, or cache migration.

### 5. Protect the live PWA

The current user is already active. A successful change must not unexpectedly log her out, relock already available content, reset opened days, rotate the vault content key, or strand an old service worker on incompatible assets.

Persisted compatibility includes `retire-day:session`, `retire-day:progress`, `retire-day:memories-stats:v1`, and `retire-day:day28-confetti:v1`.

For encrypted content:

1. Preserve `local-content/credentials/cek.json`.
2. Capture the current `public/vault/manifest.json` `keyId`.
3. Run the existing direct-source encryption workflow; plaintext media must
   remain under `local-content/current/media/` and must never be staged in
   `public/`.
4. Confirm the new `keyId` matches the old value.
5. Confirm existing media mappings remain available and only intended encrypted payloads changed.
6. Never stage plaintext media or secret files.

A pure UI or token change must leave `public/vault/**` byte-for-byte untouched. An unexpected vault diff is a stop condition, not generated noise.

If an audit finds a value that may already exist in a published commit, remove it from the current tree without repeating it in logs or chat. Treat the current-tree fix and historical removal as separate operations: disclose that the old history remains affected, and never rewrite or force-push it without fresh explicit approval for that exact cleanup.

### 6. Commit and publish

Create a focused local commit only after verification passes and only when that
matches the user's current Git instruction. If the user asked to accumulate
changes or not to commit, leave the work unstaged, record the instruction and
verification status in `.agent/HANDOFF.md`, and report `not created per user
instruction`. Do not combine unrelated user changes. When committing is
allowed, stage the intended paths explicitly, then run `git diff --cached
--check` and review both `git diff --cached --name-status` and the full cached
diff before committing; an unstaged check does not cover new files.

Push only after an explicit request in the current task. A public push that introduces newly encrypted personal media needs explicit confirmation that names the affected day or media. This protects the user from accidentally publishing sensitive material even though the payload is encrypted.

Never amend, rebase, force-push, or rewrite published `main` without fresh explicit approval for that exact operation. Before a normal push, fetch, check divergence, and review the complete outgoing commit set.

## Required handoff format

Every completed design-system task should state:

- **Design review:** what was accepted and what was corrected;
- **Figma:** which variables, components, or screens changed;
- **Code:** what changed and whether the UI kit was updated;
- **Safety:** whether session, vault `keyId`, and PWA update behavior were affected;
- **Verification:** commands and visual flows that passed;
- **Git:** commit hash and push status.

If nothing was corrected in the user's design, say that it already matched the system. If something was corrected, state it plainly so the same rule can be reused next time.
