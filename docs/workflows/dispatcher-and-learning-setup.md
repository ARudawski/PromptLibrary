# Dispatcher and Role Learning Setup

Status: proposed operating setup  
Last updated: 2026-06-21  
Scope: Project Prompt Library Codex/Linear/GitHub workflow

This document designs the lightweight dispatcher setup and the role-learning loop for Project Prompt Library. It keeps runtime state in Linear/GitHub and keeps execution threads disposable.

Adoption note: this setup remains proposed until a coordinator/human adoption gate confirms that the current-state ledger and Linear queue are ready for it.

## Design principles

- Keep durable guidance in repo docs, not repeated long prompts.
- Convert repeated, stable workflows into small role specs.
- Use scheduled runs only after the manual workflow is predictable.
- Keep one thread per coherent unit of work.
- Keep agents small, state-light, and evidence-driven.
- Use Linear and GitHub for queue state, reports, and learning decisions.

## Current assumptions

Repository:

- `AGENTS.md` defines repository-wide guardrails.
- `docs/workflows/current-state-ledger.md` is the compact phase/gate/queue/caveat pointer.
- `docs/agents/README.md` defines the shared queue contract.
- Role specs live in `docs/agents/`.
- CI evidence rules live in `docs/qa/ci-evidence.md`.

Linear:

- Project: `Project Prompt Library`.
- Labels exist for `agent:codex-local`, `agent:review`, `agent:qa-local`, `agent:coordinator`, `agent:auto`, and `gate:manual`.
- `In Progress` agent work is treated as the project-level soft lock.
- `In Review` Coding Agent work is review-ready handoff state, not an active-work lock.
- `Todo` is preferred for executable work, but the top unblocked matching Backlog item may be promoted/executed when no matching executable Todo exists and the current queue rule permits it.

## Dispatcher model

```text
Dispatcher
  -> cheap preflight: Linear + current-state ledger only
  -> if active In Progress agent work exists: stop
  -> if review-ready In Review coding work exists: claim review handoff
  -> else if no executable issue exists: stop
  -> if one executable issue exists: claim it
  -> emit ROLE_HANDOFF
  -> stop

Fresh role run
  -> read role spec and issue context
  -> execute exactly one role workflow
  -> write evidence back to Linear/GitHub
```

The dispatcher is a queue worker, not a reasoning hub. It should not build project understanding unless it has already claimed work. The only repo file it may read before claim is `docs/workflows/current-state-ledger.md`, because the ledger is required to avoid stale Linear labels pulling later-slice work.

## Suggested settings

Dispatcher:

```text
reasoning: low or medium
GitHub/repo access before claim: current-state ledger only
Linear access before claim: yes
role execution in dispatcher run: no
```

Fresh role execution after handoff:

```text
coding: medium/high depending on issue complexity
review: medium/high
QA: medium/high when runtime/project-state viability matters
coordinator: medium unless gate is ambiguous
```

## Queue and claim rules

The dispatcher stops when an agent-marked issue is `In Progress`.

The dispatcher does not stop merely because a Coding Agent issue is `In Review`; that is the normal review handoff state. It should instead claim a review handoff when the issue belongs to the current allowed lane and has a PR or clear review target.

When an issue is selected, claim it before expensive context loading:

1. Generate a unique `claim_id`.
2. Fetch issue.
3. Verify role title/label or review-handoff exception.
4. Move normal Coding, QA, and Coordinator issues to `In Progress`.
5. Leave review-ready Coding Agent issues in `In Review`; claim review by marker comment instead.
6. Remove `agent:auto` if present and safe.
7. Post an `AGENT RUNNING` comment with the claim id.
8. Re-fetch issue/comments and continue only if this run uniquely owns the active claim.
9. Emit a role handoff and stop.

Completion routing happens in the fresh role run, not in the dispatcher:

- Coding work ends in `In Review`, not `Done`.
- Review work either returns the coding issue to `In Progress`, approves/merges and moves it to `Done`, or records `BLOCKED`.
- QA work moves the QA issue to `Done` only after a PASS/PASS WITH MINOR ISSUES verdict.
- Coordinator gates move to `Done` only after the decision is recorded.

## Recommended issue exposure

Keep only the currently intended lane exposed with `agent:auto`.

Example:

```text
Current coordinator gate ready:
  state: Todo or top unblocked Backlog item
  labels: agent:coordinator, agent:auto

Next coding issue waiting behind gate:
  state: Backlog
  labels: agent:codex-local
  no agent:auto

Coding issue ready for review:
  state: In Review
  labels: agent:codex-local
  linked PR present
```

## Role learning model

Agents do not learn privately. The project learns through reviewed artifacts.

Default loop:

```text
agent run
  -> report includes Learning candidates
  -> coordinator filters candidates
  -> accepted learning becomes a small docs/workflow PR or explicit Linear update
  -> active rule goes into exactly one canonical file
  -> learning-log records the decision
```

## Learning candidates section

Add this section to role reports when useful:

```text
Learning candidates:
- candidate:
  evidence:
  affected role/spec:
  proposed change:
  confidence:
  apply now? yes/no
```

If there is no useful learning, write:

```text
Learning candidates: none
```

## Learning acceptance bar

A learning candidate should meet at least one condition:

- repeated friction happened at least twice;
- blocking failure or incorrect gate decision;
- repeated token waste or idle polling waste;
- scope/safety drift risk;
- evidence gap that prevented review, QA, or coordinator decision;
- setup mismatch such as wrong worktree, stale state, or missing label.

Do not encode one-off confusion unless it caused real failure.

## Where accepted learnings go

| Learning type | Canonical target |
|---|---|
| Current phase/gate/caveat changed | `docs/workflows/current-state-ledger.md` |
| Shared queue/review rule changed | `docs/agents/README.md` |
| Coding behavior changed | `docs/agents/coding-agent.md` |
| Review behavior changed | `docs/agents/review-agent.md` |
| QA behavior changed | `docs/agents/qa-agent.md` |
| Coordinator behavior changed | `docs/agents/coordinator-agent.md` |
| Dispatcher behavior changed | `docs/agents/dispatcher.md` |
| CI/check evidence changed | `docs/qa/ci-evidence.md` |
| Project-wide hard boundary changed | `AGENTS.md` |
| PR evidence shape changed | `.github/pull_request_template.md` |
| Issue format changed | Linear issue template or coordinator prompt |

Use `docs/agents/learning-log.md` as a compact audit trail. Active rules must be copied into the canonical file above.

## Compaction rule

At the end of each milestone, run a small workflow compaction:

1. Read `docs/agents/learning-log.md`.
2. Remove or merge duplicate active rules.
3. Ensure each active rule lives in one canonical place.
4. Shorten role specs where possible.
5. Update `docs/workflows/current-state-ledger.md`.
6. Open one docs PR.

## Anti-bloat rules

- Do not add a rule unless it prevents repeated friction, real failure, or real ambiguity.
- Do not copy the same rule into every role spec.
- Put shared rules in `docs/agents/README.md`.
- Put phase facts in the ledger.
- Put role-specific behavior in the role file.
- Put history in the learning log, not in active prompts.
- Prefer deleting obsolete text over appending caveats forever.

## Initial rollout

1. Add `docs/agents/dispatcher.md`.
2. Add this setup document.
3. Add `docs/agents/learning-log.md`.
4. Link the documents from `docs/README.md` and `docs/agents/README.md`.
5. Start with low-frequency manual or scheduled runs.
6. Review the first five dispatcher runs before tightening cadence.
