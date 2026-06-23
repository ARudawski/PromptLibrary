# Agent Operating Specs

Status: active workflow contract  
Scope: Project Prompt Library agent behavior  
Last updated: 2026-06-23

This directory contains the durable operating specs for the agents used in Project Prompt Library. These files are not product architecture and do not authorize new runtime behavior. They define how agents select work, gather evidence, update Linear/GitHub, and stop when scope is unclear.

## Agent specs

| Agent | Spec | Main job |
|---|---|---|
| Dispatcher | [`dispatcher.md`](./dispatcher.md) | Proposed queue/claim/handoff router; not active until explicitly adopted. |
| Coding Agent | [`coding-agent.md`](./coding-agent.md) | Implement one bounded Linear issue or docs task and produce a PR. |
| Review Agent | [`review-agent.md`](./review-agent.md) | Review implementation or workflow-doc PRs, request changes, approve/merge when safe, and make narrow checkpoint-doc amendments when allowed. |
| QA Agent | [`qa-agent.md`](./qa-agent.md) | Independently verify accepted implementation evidence, runtime viability, docs, and tests. |
| Coordinator Agent | [`coordinator-agent.md`](./coordinator-agent.md) | Synthesize coding/review/QA evidence, decide gates, and execute explicitly authorized workflow-doc repairs through PRs. |
| AI Automation Expert | [`ai-automation-expert.md`](./ai-automation-expert.md) | Manual-only audit role for dispatcher, claim, handoff, monitor, State Checkpoint, worktree-safety, adoption, and compaction decisions. |

Supporting docs:

- [`learning-log.md`](./learning-log.md) — proposed compact audit log for role-learning decisions.
- [`../workflows/dispatcher-and-learning-setup.md`](../workflows/dispatcher-and-learning-setup.md) — proposed operating setup for dispatcher and role-learning workflow.

## QA Coordinator retirement

There is no separate active `QA Coordinator` role in the automated workflow.

Legacy `QA Coordinator` tickets or roadmap references map to one of the active
roles:

- `QA Agent` when the work is independent verification, audit execution, or QA
  sweep evidence gathering.
- `Coordinator Agent` when the work is process correction, queue repair,
  documentation/state reconciliation, gate synthesis, or deciding whether a QA
  finding is blocking.

Do not create new `QA Coordinator` issues. QA-originated process findings should
be filed as Coordinator Agent work unless they require implementation fixes,
which belong to a Coding Agent issue.

## Dispatcher exception

The Dispatcher is not a normal role agent and does not follow the full common operating contract during preflight.

Dispatcher preflight may read only:

1. Linear queue/state metadata needed to select work.
2. `docs/workflows/current-state-ledger.md`.
3. Cheap recent/open GitHub PR metadata needed to detect state drift, limited to PR number, title, state, draft state, base/head branch, timestamps, and visible Linear issue links.

The Dispatcher must not read `AGENTS.md`, role specs, PR diffs, CI logs, PR comments, review threads, source files, long issue histories, or broad project docs before emitting a handoff. Its job is to produce one machine-readable dispatcher decision, normally `ROLE_HANDOFF_CANDIDATE` in candidate mode or `ROLE_HANDOFF` in adopted claim mode, then stop.

Fresh non-dispatcher role runs follow the full common operating contract below.

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

The explicit AI Automation Expert route is the manual-only exception to the
normal recurring executable formula: it requires an exact human/coordinator
target, title/body role marker, resolved blockers, and `gate:manual`, but no
recurring agent label and no product-slice lane match.

Role markers:

```text
Coding Agent       -> title contains Coding Agent
Review Agent       -> issue/PR is in review, or explicit review target is provided
QA Agent           -> title contains QA Agent
Coordinator Agent  -> title contains Coordinator Report, explicit coordinator gate marker, Coordinator Agent workflow/documentation wording, or legacy QA Coordinator process/state finding
AI Automation Expert -> title or body names AI Automation Expert and a human/coordinator explicitly targets it
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

The AI Automation Expert is manual-only. No recurring automation label is
defined for it. A dispatcher/spawner may route it only when a human or
Coordinator Agent explicitly targets the exact issue and the issue title or
body names `AI Automation Expert`; recurring Todo/Backlog selection must skip
it. If it is the only otherwise visible item and carries `agent:auto`, report
queue drift instead of returning a silent `DONT_NOTIFY`. Do not add `agent:auto`
to AI Automation Expert issues by default, and treat any generic recurring
exposure for this role as queue drift unless a later coordinator/human adoption
gate updates the current-state ledger, shared queue contract, dispatcher
routing, and Linear labels.

Backlog pickup must use roadmap/current-state order and must not skip gates or jump to later slices. Keep exactly one next executable Coding Agent issue at a time unless the user explicitly opens a parallel lane.

## Review evidence pattern

Default:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer issues are optional. Use them only when review itself is large, risky, multi-PR, or explicitly required. A retired/canceled review issue must not block a coordinator gate if review evidence exists on the coding issue and PR.

Coordinator-authored workflow-doc changes use the same durable repository path:

```text
Coordinator workflow/docs issue -> branch/commit/PR -> Review Agent review -> merge/closeout evidence -> Done
```

Decision-only coordinator work may close from recorded Linear/GitHub evidence
without a PR when it does not mutate repository files. A Coordinator Agent issue
with uncommitted, unpushed, unreviewed, or unmerged repository changes must
report `BLOCKED`, `NEEDS PUBLISH`, or `NEEDS REVIEW` with the files/PR listed
instead of moving to `Done`.

## Drift control

Update `docs/workflows/current-state-ledger.md` only from coordinator gates or explicit workflow updates. Ordinary coding, review, and QA agents may report stale ledger information, but should not silently rewrite the ledger unless their issue explicitly asks for workflow documentation changes.

Coordinator gates and workflow closeouts must follow the documentation/state closeout rule in [`coordinator-agent.md`](./coordinator-agent.md) before exposing the next lane or closing the issue.

## State Checkpoint

A State Checkpoint is the explicit evidence recorded when a slice handoff
changes the allowed lane, completed slice, active slice, next slice, or queue
exposure.

Invariant:

```text
No slice handoff without a State Checkpoint.
```

When a State Checkpoint is required, record exactly one of:

```text
ledger updated in this PR/issue
ledger already correct
state-repair issue created/linked: PL-xxx
```

Coding, Review, Coordinator, and Dispatcher evidence must carry the checkpoint
when their work completes, merges, exposes, or selects a state-changing handoff.
If no slice/lane state changes, the report may say no State Checkpoint was
required; do not invent a checkpoint outcome for non-handoffs.

If a required State Checkpoint is missing and the closing agent cannot update
the ledger or prove it is already correct, the agent must create or link an
executable Coordinator Agent state-repair issue before moving the original
issue to `Done`. An executable state-repair issue must carry the Coordinator
Agent marker, `lane:state-repair`, `agent:coordinator`, and the automation
label required by the current workflow when recurring automation should pick it.
When the repair requires repository mutation, such as a current-state ledger or
workflow-doc update, the issue must explicitly authorize the required
workflow/docs edits and durable PR workflow before it counts as executable.
Non-automated monitor findings are evidence only; they do not satisfy
`state-repair issue created/linked: PL-xxx` unless they link to a separate
executable repair issue.

Review Agent may use the `ledger updated in this PR/issue` outcome without a
separate Coordinator state-repair issue only through the narrow checkpoint-doc
amendment path in [`review-agent.md`](./review-agent.md): the substantive review
is complete, the target PR is otherwise approvable or mergeable, the amendment
is limited to exact State Checkpoint/current-state ledger facts already proven
by the PR, Linear, CI/local checks, or recorded merge/head evidence, and no
product code, tests, runtime behavior, architecture scope, roadmap policy, or
new slice work changes. The Review Agent must record the docs files changed,
the reviewed head after amendment, the checkpoint outcome, and checks run or
skipped. If evidence is ambiguous, conflicting, broader than checkpoint facts,
post-failure, or policy-changing, create or link Coordinator state-repair
instead.

State-repair handoffs repair operating state. They do not open a parallel
product lane, promote the next product issue, or authorize later-slice work.

## Live Claim Marker

The canonical role-run live claim marker is:

```text
AGENT RUNNING
claim_id:
claim_expires_at:
role:
issue:
```

Use the exact `AGENT RUNNING` marker name and `claim_expires_at` field for
role-agent live claims. Descriptive headings such as `Coordinator Agent live
claim` are non-canonical and must not be relied on for dispatcher or monitor
detection.

## Claim Terminal Markers

When a role run opens or inherits a `claim_id` through `AGENT RUNNING`, its
final Linear report must end with exactly one canonical terminal marker for the
same `claim_id`:

```text
AGENT COMPLETE
claim_id:
completed_at:
result:
```

```text
AGENT BLOCKED
claim_id:
blocked_at:
reason:
```

```text
AGENT CLAIM RELEASED
claim_id:
released_at:
reason:
```

```text
AGENT CLAIM EXPIRED
claim_id:
observed_at:
reason:
```

Successful completion uses `AGENT COMPLETE` unless the role explicitly releases,
blocks, or expires the claim. Role-specific verdicts such as `PASS`, `APPROVE`,
or `NEEDS CHANGES` remain human-readable report fields only. Do not use
role-specific phrases such as `QA COMPLETE`, `REVIEW COMPLETE`, or
`COORDINATOR COMPLETE` as machine terminal markers.

Claim-free candidate-mode or manual role runs must not invent claim lifecycle
markers.
