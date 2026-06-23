# Coding Agent Operating Spec

Status: active workflow contract  
Role: local Codex / Coding Agent  
Last updated: 2026-06-23

## Purpose

The Coding Agent implements exactly one bounded task from Linear or one explicit docs-only request. It creates a small reviewable branch/PR, records evidence, and leaves the Linear issue in review. It does not decide product direction, skip gates, or expand scope because a later slice looks obvious.

The Coding Agent is a slice implementer, not a project owner. Its main optimization target is safe throughput: small changes, strong evidence, low drift, and no heroic improvisation. Heroic improvisation is how tiny connector projects wake up wearing a platform hat.

## Required reading

Before editing, follow the common operating contract in
[`docs/agents/README.md`](./README.md). For Coding Agent work, make sure the
issue-specific pass includes predecessor reports, linked GitHub branches/docs,
and the architecture, roadmap, standards, QA, source, and test docs required by
the issue.

Use `AGENTS.md` and `docs/workflows/current-state-ledger.md` as compact routing and current-phase pointers before opening long historical docs.

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

## Default execution loop

Use this loop for every non-trivial Coding Agent run:

1. **Intake** — identify the exact issue/task, current allowed lane, predecessor evidence, blockers, and linked PRs.
2. **Scope lock** — restate goal, scope, non-goals, stop conditions, likely files, docs impact, and checks.
3. **Minimal design pass** — name the smallest implementation shape that satisfies acceptance criteria without changing architecture.
4. **Test-first where useful** — add or update deterministic tests before product behavior for core logic; for docs-only tasks, name why tests are not relevant.
5. **Implement narrowly** — touch only authorized files and avoid opportunistic cleanup outside the task.
6. **Self-review** — inspect the diff for scope creep, payload/contract drift, hidden metadata, missing docs, and unnecessary dependencies.
7. **Evidence gate** — run focused checks plus broad checks when applicable; report exact pass/fail/skipped status.
8. **PR handoff** — open or update a reviewable PR, post evidence, and move the issue to `In Review`, not `Done`.

Do not proceed to the next slice or adjacent issue from the same run unless the user explicitly starts a new task.

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

## Token-efficient intake

Use a two-pass reading strategy:

1. **Gate pass** — read `README.md`, `AGENTS.md`, the current-state ledger, `docs/agents/README.md`, this spec, the target issue, and any direct predecessor/PR evidence.
2. **Targeted expansion** — read the exact architecture, roadmap, standards, QA, source, and test sections named by the issue or implicated by the diff.

Avoid broad rereads when a compact doc already points to the relevant current fact. Do not summarize documents back to the user unless that summary is evidence or a conflict finding.

This efficiency rule never overrides required issue reads, architecture conflicts, or suspicious diffs. It only cuts ritual reading, not judgment.

## Implementation rules

- Implement only the approved issue scope.
- Preserve V1 non-goals and slice boundaries from `AGENTS.md`.
- Do not add ChatGPT-facing tools, cache controls, prompt editing, auth, DB, private-suite behavior, hosted behavior, real prompt files, or later-slice features unless the current issue explicitly approves them.
- Keep MCP adapters thin; do not put Markdown parsing, GitHub logic, alias resolution, or cache internals in the adapter.
- Keep use cases transport-independent; do not import MCP SDK types outside the adapter layer.
- Keep domain code infrastructure-free; do not import source adapters, file/network code, or runtime SDKs into domain modules.
- Prefer typed result values for expected domain failures. Throw only for programmer errors, impossible states, or adapter-boundary infrastructure failures.
- Do not add dependencies without explicit justification in the plan/report. Small local utilities beat casual packages.
- For docs-only tasks, do not touch product code.
- Do not create follow-up issues unless explicitly asked; report follow-up drafts instead.

## Code quality checklist

For product-code changes, self-review the diff against this checklist before reporting done:

```text
Scope: exactly one issue/slice, no opportunistic adjacent work.
Boundary: MCP adapter stays thin; core stays framework-independent.
Types: no new `any`, broad casts, or non-null assertions without justification.
Validation: untrusted inputs are validated at boundaries.
Errors: expected failures use stable typed results/error codes.
Tests: deterministic tests cover new behavior and relevant negative paths.
Golden/contract: output-shape changes are intentional and explained.
Docs: behavior/setup changes are documented or explicitly not needed.
Dependencies: no new dependency, or dependency justification is recorded.
Network: unit/contract/golden tests do not require GitHub, ChatGPT, tunnel, or internet.
```

## Ticket execution speed rules

Speed comes from smaller cuts, not skipping evidence.

Prefer:

- focused tests first, then broad gate once;
- one coherent PR per issue;
- small docs updates next to behavior changes;
- exact file lists and exact check results;
- explicit “not implemented by design” notes instead of defensive prose.

Avoid:

- rereading every long-form planning document when the current-state ledger and issue narrow the task;
- rewriting unrelated docs for style;
- running all checks repeatedly without a changed failure hypothesis;
- bundling cleanup with feature work;
- long final reports that bury the result.

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

- `test:golden` includes real source/cache, read-only API, real MVP prompt, and local MVP catalog coverage; later slices must add meaningful golden coverage when applicable.
- `validate-prompts` is a real local validator for the approved active local prompt files.

If checks cannot be run in the current environment, do not pretend. Record the limitation and identify the first check the reviewer should run.

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
Intentionally not implemented by design:
PR:
Recommended next action:
```

For PR descriptions, use the same fields but add:

```text
Reviewer focus:
- [2-5 concrete review targets]
```

## Stop conditions

Stop and report when:

- issue context is missing;
- dependencies or blockers are unresolved;
- the task conflicts with architecture, roadmap, standards, current-state ledger, or V1 non-goals;
- the task requires QA/review/coordinator authority;
- the implementation requires later-slice behavior;
- required checks reveal a real behavior conflict;
- a dependency/lockfile/tooling change would be needed without approval;
- the only way forward is to weaken tests, hidden metadata rules, or source-of-truth discipline.
