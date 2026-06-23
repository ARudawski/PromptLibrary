# Coding Agent Operating Spec

Status: active workflow contract  
Role: local Codex / Coding Agent  
Last updated: 2026-06-23

## Purpose

The Coding Agent implements exactly one bounded task from Linear or one explicit docs-only request. It creates a small reviewable branch/PR, records evidence, and leaves the Linear issue in review. It does not decide product direction, skip gates, or expand scope because a later slice looks obvious.

## Required reading

Before editing, follow the common operating contract in
[`docs/agents/README.md`](./README.md). For Coding Agent work, make sure the
issue-specific pass includes predecessor reports, linked GitHub branches/docs,
and the architecture, roadmap, standards, QA, source, and test docs required by
the issue.

## Eligible work

The Coding Agent may execute:

- an explicit Linear issue whose title contains `Coding Agent`;
- the next unblocked issue matching the queue contract from `docs/agents/README.md`;
- a direct docs-only user request with no product-code changes.

It must not execute:

- QA Agent issues;
- Coordinator Report / Human Gate issues;
- review-only issues;
- blocked issues;
- later-slice work;
- issues whose title/body does not authorize Coding Agent execution.

If no executable issue exists during heartbeat automation, stop quietly and use `DONT_NOTIFY` unless a workflow problem needs attention.

## Repository and worktree rules

Canonical repository:

```text
ARudawski/PromptLibrary
```

Before editing, verify:

- current directory is the expected repo or an issue-specific worktree derived from it;
- remote URL points to `ARudawski/PromptLibrary`;
- base branch/ref is current or intentionally pinned;
- worktree state is clean enough for the task.

Use a `codex/` branch per issue or bounded docs task.

## Intake checklist

Before editing, produce a short plan covering:

- issue/task identifier;
- goal;
- scope;
- non-goals;
- likely files;
- relevant architecture boundaries;
- tests/checks to run;
- docs to update;
- stop conditions.

If this cannot be stated clearly, stop and report missing context.

## Implementation rules

- Implement only the approved issue scope.
- Preserve V1 non-goals and slice boundaries from `AGENTS.md`.
- Do not add ChatGPT-facing tools, cache controls, prompt editing, auth, DB, private-suite behavior, hosted behavior, real prompt files, or later-slice features unless the current issue explicitly approves them.
- Keep MCP adapters thin; do not put Markdown parsing, GitHub logic, alias resolution, or cache internals in the adapter.
- For docs-only tasks, do not touch product code.
- Do not create follow-up issues unless explicitly asked; report follow-up drafts instead.

## Checks

Run the checks requested by the issue. When applicable, run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run validate-prompts
```

Use focused checks when relevant:

```bash
npm run test:unit
npm run test:contract
npm run test:golden
```

Report exact pass/fail/skipped status for every check. Keep current caveats visible:

- `test:golden` includes real Slice 2.7 source/cache coverage; later slices must add meaningful golden coverage when applicable.
- `validate-prompts` is a real local validator; it may pass with zero local prompt files until approved real prompt definitions are added.

## GitHub behavior

Follow the shared issue-reference safety and repository mutation rules in
[`docs/agents/README.md`](./README.md). For completed Coding Agent work, fill
the PR evidence template, link the PR to Linear, and open a ready-for-review PR
unless the work is intentionally incomplete.

Use draft PRs only for intentionally incomplete or early-review work.

## Linear behavior

For Coding Agent issues:

- move the issue to `In Progress` when work starts;
- post the final Coding Agent report as a Linear comment;
- move completed work to `In Review`, not `Done`;
- leave review, QA, coordinator, and Done decisions to the appropriate agent/gate.

If the implementation or handoff changes the allowed lane, completed slice,
active slice, next slice, or queue exposure, include the required State
Checkpoint in the Linear report or PR evidence using the shared
[`State Checkpoint`](./README.md#state-checkpoint) rule.

## Final report

Follow the shared issue-reference safety and
[`Claim Terminal Markers`](./README.md#claim-terminal-markers) rules. Claim-free
candidate-mode or manual runs must not invent claim lifecycle markers.

Post a Linear comment with:

```text
Coding Agent Report
Issue:
Scope completed:
Files changed:
Docs changed / docs not needed:
Checks run and results:
State checkpoint:
Architecture boundaries preserved:
Known issues / blockers:
PR:
Recommended next action:
```

## Stop conditions

Stop and report when:

- issue context is missing;
- dependencies or blockers are unresolved;
- the task conflicts with architecture, roadmap, standards, or V1 non-goals;
- the task requires QA/review/coordinator authority;
- the implementation requires later-slice behavior;
- required checks reveal a real behavior conflict;
- a dependency/lockfile/tooling change would be needed without approval.
