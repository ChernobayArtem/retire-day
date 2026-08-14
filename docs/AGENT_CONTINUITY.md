# Agent continuity protocol

## Purpose

This protocol makes handoffs between Codex, Claude Code, and fresh sessions
predictable. Conversation history is helpful but never authoritative; Git,
tracked documentation, tests, and the current working tree are authoritative.

## Shared Figma context

The canonical project file is **APP** — the Figma file where the application
palette and color-variable system were created:

<https://www.figma.com/design/aVqXAqWFfNDnh93PyxctSv/APP>

When the user says “our Figma” or “the Figma with the palette”, use this file
unless the user explicitly provides a newer link. The preferred remote MCP
endpoint is `https://mcp.figma.com/mcp`; the desktop endpoint, when Figma
Desktop exposes it, is `http://127.0.0.1:3845/mcp`. Do not create a new Figma
file or edit another file by assumption. Never upload real personal media,
passwords, certificate codes, analytics identifiers, or vault artifacts.

## Start or resume work

Before editing:

1. Read `AGENTS.md` and every task-specific document it requires.
2. Run `git status --short --branch` and inspect recent commits with
   `git log --oneline --decorate -8`.
3. Inspect both `git diff` and `git diff --cached`. Preserve every unrelated or
   unexplained change.
4. If `.agent/HANDOFF.md` exists, read it and verify every statement against the
   repository. A handoff is a navigation aid, not proof.
5. Confirm the active objective with the user's latest request. Do not silently
   continue an obsolete task merely because it appears in an old handoff.
6. Before publishing, fetch the remote, check divergence, and review every
   outgoing commit as required by `AGENTS.md`.

## Finish cleanly

When the task is complete:

1. Run the required verification for the affected scope.
2. Stage only intended files and review the complete staged diff.
3. Create a focused local commit.
4. Remove a resolved local `.agent/HANDOFF.md` so it cannot mislead the next
   agent.
5. Push only when the user explicitly requests it in the current task.

## Pause unfinished work

If a session or token budget ends before a safe commit, create or update the
ignored local file `.agent/HANDOFF.md` using this template:

```md
# Active handoff

- Objective: <current user-visible outcome>
- Status: <in progress | blocked>
- Base/branch: <branch and last known commit>
- Changed files: <paths and why>
- Decisions: <important choices already made>
- Verification: <commands passed, failed, or not run>
- Remaining work: <ordered concrete steps>
- Risks: <session, vault, PWA, Figma, or publication concerns>
- Publication: <not requested | requested but not done | completed>
```

Never place passwords, certificate codes, decrypted content, personal-media
paths, analytics identifiers, vault keys, or other secrets in a handoff.

## Conflict rules

- Current repository state overrides stale prose.
- Newer explicit user instructions override an older handoff objective.
- `AGENTS.md` overrides this protocol on safety, verification, and publication.
- A dirty working tree is evidence to investigate, never permission to reset it.
- If two sources disagree on a destructive or externally visible action, stop
  and ask the user rather than choosing the more expansive action.
