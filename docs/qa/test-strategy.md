# Test Strategy — Project Prompt Library

Status: QA strategy v2.0  
Last updated: 2026-06-21
Owner: QA Agent for verification; Coordinator Agent for QA-originated process findings
Current phase: M2 — public source, cache, validation

## 1. QA goal

QA keeps Project Prompt Library safe to develop with AI coding agents by controlling the risks that matter most:

- `@pl` command routing may fail or not apply returned prompt behavior;
- the connector may invoke the wrong prompt;
- drafts, invalid prompts, or conflicted aliases may leak into runtime behavior;
- operational metadata may pollute model-visible invocation payloads;
- source/cache refresh behavior may replace a safe cache with unsafe data;
- agents may overbuild V1 into an editor, workflow engine, admin surface, private prompt system, or semantic router.

This is not a coverage-percentage exercise. The quality target is meaningful regression protection around exact prompt invocation, fail-closed behavior, source/cache safety, and architecture boundaries.

## 2. Current phase

Historical gates:

```text
Slice 0: local @pl proof — accepted with caveats
Slice 1: fixture-backed invocation walking skeleton — approved
Slice 2.1: PromptSource boundary and fake source seam — approved
Slice 2.2: public GitHub prompt source adapter — approved
Slice 2.3: runtime cache with TTL — approved
```

Current QA focus:

```text
M2 source/cache QA
Current slice: see docs/workflows/current-state-ledger.md
```

Slice 0 is now historical, not the immediate next action. Keep its evidence because it remains the product premise, but do not block current M2 work by treating Slice 0 as unattempted.

## 3. Current system under test

For M2, the system under test includes:

- prompt domain model;
- Markdown/YAML frontmatter parsing;
- prompt validation;
- slug/alias collection validation;
- active command index;
- invocation projection;
- fixture-backed MCP invocation path;
- `PromptSource` boundary;
- public GitHub source adapter;
- runtime cache with TTL and later approved cache behavior;
- deterministic CI gates and local QA worktrees.

Later phases add inspect/list tools, real prompt files, personal-use trial evidence, and hosted deployment readiness.

## 4. QA levels

### 4.1 Historical platform proof

Slice 0 validated the platform premise with cooperative fresh-chat `@pl proof` runs. Keep the proof log as historical evidence. Re-run only when platform behavior changes materially.

### 4.2 Unit tests

Unit tests cover pure deterministic behavior:

- prompt parsing and validation;
- collection validation and alias conflicts;
- active-only index construction;
- invocation projection;
- unknown command failure;
- source adapter success/failure behavior with fakes/mocks;
- cache TTL/fresh/stale behavior;
- stale/LKG behavior where the current slice permits;
- partial-valid/cold-failure behavior when Slice 2.5 permits it.

Core unit tests must not hit GitHub, ChatGPT, tunnels, or hosted endpoints.

### 4.3 Contract tests

Contract tests cover MCP-facing tool shapes without real ChatGPT:

- tool names;
- input schemas;
- output schemas;
- success/failure response shapes;
- model-visible `prompt_body` in invocation results;
- compact visible receipt text;
- `_meta` not being required for model-needed prompt body;
- failure responses clearly indicating no prompt was invoked where ambiguity matters.

### 4.4 Golden tests

Golden tests should protect exact payload and fixture behavior for approved behavior. As of Slice 2.7, `test:golden` includes real source/cache golden coverage; later slices should add targeted golden coverage when exact payloads or fixtures become part of their acceptance surface.

### 4.5 Source/cache QA

For source/cache slices, QA must verify:

- source/cache behavior matches the approved slice only;
- no later-slice behavior is claimed as implemented;
- failed or unsafe source/cache paths fail closed or preserve last-known-good state according to the active slice;
- diagnostics/cache metadata do not leak into normal invocation payloads;
- deterministic tests use fake source/fake clock where possible;
- live GitHub/network checks are separate smoke checks, not default unit/contract gates.

### 4.6 Runtime/project-state viability

QA must distinguish static code review from runtime viability. When reports claim the project can run or behavior is observable, QA should verify from the canonical repo or an issue-specific worktree pinned to the reviewed commit/merge state.

If live ChatGPT/tunnel/hosted checks are out of scope, state that explicitly and use the closest deterministic substitute.

## 5. Required deterministic checks

Use the issue-specific check list first. Default checks are:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:unit
npm run test:contract
npm run test:golden
npm run validate-prompts
```

Record exact pass/fail/skipped status.

`validate-prompts` is a real local validator as of Slice 2.6. It may pass with zero local prompt files until approved real-prompt slices add prompt definitions; do not treat an empty prompt-set pass as live prompt coverage.

## 6. CI evidence

Follow [`ci-evidence.md`](./ci-evidence.md).

Reports must distinguish:

```text
Local checks:
GitHub Actions evidence:
Status/check API evidence:
Unavailable/skipped evidence:
```

If GitHub combined-status/check APIs provide no data, use recorded GitHub Actions run IDs, job IDs, reviewed head SHAs, merge SHAs, or local deterministic evidence and state the limitation.

## 7. QA Agent behavior

Role-specific QA execution rules live in [`../agents/qa-agent.md`](../agents/qa-agent.md).

Default targeted QA flow:

```text
read QA issue -> gather Linear/GitHub/repo evidence -> produce brief plan -> run/verify checks -> report verdict -> move QA issue when verdict allows
```

QA sweeps are useful for process drift, stale docs, missing evidence, or wrong-worktree problems, but they must not create duplicate issues or invent later-slice implementation work.

There is no separate active QA Coordinator role. QA sweeps should create or link
Coordinator Agent issues for process, queue, documentation-state, coverage, or
coordination findings, and Coding Agent issues for implementation fixes.

## 8. Coordinator gates

Coordinator gates decide proceed/fix/re-QA/stop using coding, review, QA, PR, CI, and documentation evidence. They should not require a separate Code Reviewer issue unless that issue is explicitly active and blocking.

Coordinator gates also own QA-originated process findings. A legacy QA
Coordinator issue is treated as a Coordinator Agent process finding unless it
explicitly asks for independent QA execution.

Default review evidence pattern:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

## 9. QA verdicts

Use:

```text
PASS
PASS WITH MINOR ISSUES
NEEDS CHANGES
BLOCKED
SWEEP COMPLETED
```

`PASS WITH MINOR ISSUES` is appropriate only when acceptance criteria pass and residual issues are non-blocking, tracked, or explicitly later-slice.

## 10. Non-goals

QA must treat accidental implementation of these as architecture drift, not bonus functionality:

- prompt editing in ChatGPT;
- draft management through ChatGPT;
- ChatGPT-facing cache refresh or admin tools;
- private prompt suites;
- user accounts/auth/OAuth;
- DB-backed prompt records;
- semantic search;
- automatic prompt selection;
- workflow/session state management;
- hosted deployment before local usefulness is proven.

## 11. Current caveats

Carry these forward until resolved by the relevant slice or issue:

- `test:golden` has real Slice 2.7 source/cache coverage; future exact-payload behavior still needs slice-specific golden coverage where applicable.
- `validate-prompts` is real local validation but may pass with zero prompt files until real prompt slices add approved prompt definitions.
- npm audit findings must be reported when observed.
- Source/cache infrastructure is not equivalent to fully wired real prompt runtime behavior until later slices complete.
