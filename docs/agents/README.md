# Agent Operating Specs

Status: active workflow contract  
Scope: Project Prompt Library agent behavior  
Last updated: 2026-06-21

This directory contains the durable operating specs for the agents used in Project Prompt Library. These files are not product architecture and do not authorize new runtime behavior. They define how agents select work, gather evidence, update Linear/GitHub, and stop when scope is unclear.

## Agent specs

| Agent | Spec | Main job |
|---|---|---|
| Dispatcher | [`dispatcher.md`](./dispatcher.md) | Proposed queue/claim/handoff router; not active until explicitly adopted. |
| Coding Agent | [`coding-agent.md`](./coding-agent.md) | Implement one bounded Linear issue or docs task and produce a PR. |
| Review Agent | [`review-agent.md`](./review-agent.md) | Review the coding issue and PR, request changes or approve/merge when safe. |
| QA Agent | [`qa-agent.md`](./qa-agent.md) | Independently verify accepted implementation evidence, runtime viability, docs, and tests. |
| Coordinator Agent | [`coordinator-agent.md`](./coordinator-agent.md) | Synthesize coding/review/QA evidence and decide proceed/fix/re-QA/stop. |

Supporting docs:

- [`learning-log.md`](./learning-log.md) — proposed compact audit log for role-learning decisions.
- [`../workflows/dispatcher-and-learning-setup.md`](../workflows/dispatcher-and-learning-setup.md) — proposed operating setup for dispatcher and role-learning workflow.

## Dispatcher exception

The Dispatcher is not a normal role agent and does not follow the full common operating contract during preflight.

Dispatcher preflight may read only:

1. Linear queue/state metadata needed to select work.
2. `docs/workflows/current-state-ledger.md`.

The Dispatcher must not read `AGENTS.md`, role specs, PR diffs, source files, long issue histories, or broad project docs before emitting a handoff. Its job is to produce `ROLE_HANDOFF_CANDIDATE` in candidate mode or `ROLE_HANDOFF` in adopted claim mode, then stop.

Fresh Coding, Review, QA, and Coordinator role runs follow the full common operating contract below.

## Common operating contract

Every non-dispatcher role agent must read:

1. `AGENTS.md`
2. `docs/workflows/current-state-ledger.md`
3. its role-specific file from this directory
4. the target Linear issue and its comments/attachments
5. the linked PR/diff/commit when relevant
6. the architecture, roadmap, standards, QA, and source docs required by the issue

If these sources conflict, follow the source-of-truth rules in `AGENTS.md`. Stop and report the conflict instead of improvising.

## Queue selection contract

Automation must prefer explicit `Todo` work, but it may promote the top
unblocked matching Backlog item when no matching `Todo` issue exists.

Default rule:

```text
Executable issue = (Linear state Todo or top unblocked matching Backlog item) + expected agent label + expected title marker + unblocked dependency state + current allowed slice/lane.
```

Role markers:

```text
Coding Agent       -> title contains Coding Agent
Review Agent       -> issue/PR is in review, or explicit review target is provided
QA Agent           -> title contains QA Agent
Coordinator Agent  -> title contains Coordinator Report or explicit coordinator gate marker
```

Expected labels:

```text
agent:codex-local   local Codex may execute Coding Agent issues
agent:review        review agent may inspect issues/PRs in review
agent:qa-local      local QA automation may execute QA Agent issues
agent:coordinator   coordinator agent may execute gate issues
agent:auto          recurring automation may pick this without manual target
gate:manual         manual or coordinator decision required
```

Backlog pickup must use roadmap/current-state order and must not skip gates or jump to later slices. Keep exactly one next executable Coding Agent issue at a time unless the user explicitly opens a parallel lane.

## Review evidence pattern

Default:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer issues are optional. Use them only when review itself is large, risky, multi-PR, or explicitly required. A retired/canceled review issue must not block a coordinator gate if review evidence exists on the coding issue and PR.

## Drift control

Update `docs/workflows/current-state-ledger.md` only from coordinator gates or explicit workflow updates. Ordinary coding, review, and QA agents may report stale ledger information, but should not silently rewrite the ledger unless their issue explicitly asks for workflow documentation changes.
