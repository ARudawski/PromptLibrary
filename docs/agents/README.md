# Agent Operating Specs

Status: active workflow contract  
Scope: Project Prompt Library agent behavior  
Last updated: 2026-06-20

This directory contains the durable operating specs for the agents used in Project Prompt Library. These files are not product architecture and do not authorize new runtime behavior. They define how agents select work, gather evidence, update Linear/GitHub, and stop when scope is unclear.

## Agent specs

| Agent | Spec | Main job |
|---|---|---|
| Coding Agent | [`coding-agent.md`](./coding-agent.md) | Implement one bounded Linear issue or docs task and produce a PR. |
| Review Agent | [`review-agent.md`](./review-agent.md) | Review the coding issue and PR, request changes or approve/merge when safe. |
| QA Agent | [`qa-agent.md`](./qa-agent.md) | Independently verify accepted implementation evidence, runtime viability, docs, and tests. |
| Coordinator Agent | [`coordinator-agent.md`](./coordinator-agent.md) | Synthesize coding/review/QA evidence and decide proceed/fix/re-QA/stop. |

## Common operating contract

Every agent must read:

1. `AGENTS.md`
2. `docs/workflows/current-state-ledger.md`
3. its role-specific file from this directory
4. the target Linear issue and its comments/attachments
5. the linked PR/diff/commit when relevant
6. the architecture, roadmap, standards, QA, and source docs required by the issue

If these sources conflict, follow the source-of-truth order in `AGENTS.md`. Stop and report the conflict instead of improvising.

## Queue selection contract

Automation must not infer readiness from issue order alone.

Default rule:

```text
Executable issue = Linear state Todo + expected agent label + expected title marker + unblocked dependency state.
```

Role markers:

```text
Coding Agent       -> title contains "Coding Agent"
Review Agent       -> issue/PR is in review, or explicit review target is provided
QA Agent           -> title contains "QA Agent"
Coordinator Agent  -> title contains "Coordinator Report" or "Human/Coordinator Gate"
```

Recommended labels:

```text
agent:codex-local   local Codex may execute this issue
agent:auto          recurring automation may pick this without manual target
agent:qa-local      local QA automation may execute this issue
gate:manual         do not auto-execute; human/coordinator decision required
```

Backlog means known future work, not executable work. Keep exactly one next executable Coding Agent issue at a time unless the user explicitly opens a parallel lane.

## Review evidence pattern

Default:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer issues are optional. Use them only when review itself is large, risky, multi-PR, or explicitly required. A retired/canceled review issue must not block a coordinator gate if review evidence exists on the coding issue and PR.

## Drift control

Update `docs/workflows/current-state-ledger.md` only from coordinator gates or explicit human workflow updates. Ordinary coding, review, and QA agents may report stale ledger information, but should not silently rewrite the ledger unless their issue explicitly asks for workflow documentation changes.
