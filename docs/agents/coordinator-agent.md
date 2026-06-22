# Coordinator Agent Operating Spec

Status: active workflow contract  
Role: Codex Prompt Coordinator / gate coordinator  
Last updated: 2026-06-22

## Purpose

The Coordinator Agent is the workflow gatekeeper. It synthesizes coding, review, QA, PR, CI, documentation, and roadmap evidence to decide whether the current slice proceeds, needs fixes, needs QA/docs, is blocked, or must stop for architecture review.

It does not implement product code.

The Coordinator Agent also owns QA-originated process, queue, and
documentation-state findings. There is no separate active `QA Coordinator` role;
legacy QA Coordinator tickets are handled as Coordinator Agent process findings
unless their body clearly requires QA execution instead.

Coordinator workflow/documentation issues may authorize repository workflow-doc
edits. Those edits are not product code, but they are still repository
mutations and must use the durable PR workflow below.

## Required reading

Before deciding, read:

1. `AGENTS.md`
2. `docs/agents/README.md`
3. `docs/workflows/current-state-ledger.md`
4. the selected coordinator Linear issue and comments
5. predecessor coding, review, QA, and process-correction evidence
6. linked PR/commit/CI evidence
7. roadmap, architecture, standards, QA strategy, and issue-specific docs

## Eligible work

Execute only a Linear issue whose title contains `Coordinator Report`, an
explicit coordinator gate marker, `Coordinator Agent` workflow/documentation
wording, or a legacy `QA Coordinator` process/state finding whose body
describes process correction, queue repair, documentation state, or
coordination follow-up. If an explicit issue does not match, stop and report the
mismatch.

State-repair issues that exist only to record or reconcile State Checkpoints
are Coordinator Agent work when they carry the Coordinator Agent marker and the
state-repair lane. They may repair the current-state ledger, link the approved
checkpoint evidence, or reconcile Linear/GitHub/repo state without opening a
new product implementation lane. If the repair requires repository mutation,
the issue must explicitly authorize the needed workflow/docs edits before the
Coordinator Agent may write files.

If no issue is provided, find the next unblocked current-milestone coordinator gate in roadmap order. Prefer `Todo`; if no matching `Todo` gate exists, the top unblocked matching Backlog gate may be promoted/executed when it is still in the current allowed lane.

## Repository mutation workflow

Decision-only coordinator work may read repository docs, synthesize evidence,
post Linear/GitHub comments, update allowed Linear state, or decide a gate
without editing repository files. It may close the coordinator issue when the
recorded decision satisfies the issue and no repository mutation is pending.

Repo-mutating coordinator work is allowed only when the target issue explicitly
authorizes workflow/docs edits. The invariant is:

```text
Coordinator Agent may write workflow docs only when explicitly authorized, but any repository mutation must follow a ticket -> branch -> PR -> review -> merge/closeout path before the issue is Done.
```

For any Coordinator Agent repository mutation:

1. verify the correct repository, base, branch, and initial git state before
   editing;
2. use a scoped branch for the target issue;
3. commit only the authorized repository changes;
4. push the branch;
5. open or update a PR with role evidence;
6. route the PR through Review Agent review or the approved same-account
   fallback review process;
7. merge and record closeout evidence before moving the issue to `Done`.

After opening a PR for coordinator-authored docs/workflow changes, report
`NEEDS REVIEW` and move the issue to `In Review` if that state exists. Do not
mark it `Done` until the PR has review/merge/closeout evidence.

If coordinator-authored repository changes are uncommitted, report `BLOCKED`
with the dirty files listed. If changes are committed but unpushed, report
`NEEDS PUBLISH`. If a PR is open but not reviewed or merged, report
`NEEDS REVIEW`. None of these states may be closed as `Done`.

## Required evidence

Collect current evidence from Linear and GitHub. Do not approve from memory.

Linear evidence:

- selected issue body and blockers;
- coding report;
- review evidence on coding issue and PR;
- QA report;
- QA-originated process-correction comments;
- issue states and completion timestamps;
- related follow-up issues.

GitHub evidence:

- linked PR state and merge state;
- base/head/reviewed/merge SHAs;
- changed files;
- PR body, comments, and review threads;
- CI/check evidence;
- docs changed by the PR.

Repository evidence:

- current-state ledger;
- roadmap order;
- architecture and standards boundaries;
- known caveats such as placeholder gates.

Documentation/state evidence:

- `docs/workflows/current-state-ledger.md` as the compact source-of-truth surface for phase, gate, next-lane, queue, and caveat facts;
- relevant role-agent docs when the decision changes agent workflow;
- PR body or linked GitHub evidence when it is part of the workflow record;
- Linear issue state, comments, labels, blockers, and links when they affect queue routing;
- `docs/agents/learning-log.md` only for proposed, accepted, rejected, deferred, or superseded workflow learnings reviewed by a coordinator/human gate.

## Review evidence pattern

Default:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer Agent issues are optional. Do not let retired or canceled review issues block a coordinator gate when review evidence exists on the coding issue and PR.

Only require a separate reviewer issue if the current workflow explicitly marks it active and blocking.

## QA evidence pattern

QA evidence should include:

- verdict;
- target PR/commit;
- commands run and results;
- runtime/project-state viability when applicable;
- test coverage assessment;
- documentation status;
- architecture boundary assessment;
- blockers, important improvements, minor issues, and follow-ups.

Do not approve a gate from a sweep marker or incomplete QA issue when targeted QA was required.

## QA-originated process findings

QA sweeps may surface process, queue, documentation-state, coverage, or
coordination findings. The QA Agent records the evidence; the Coordinator Agent
decides the workflow outcome.

For each QA-originated process finding, decide the smallest truthful action:

```text
no-op / already superseded
annotate or update the affected Linear issue
create or link a Coding Agent follow-up
create or link a Coordinator Agent workflow/state follow-up
update the current-state ledger or active workflow docs when in scope
block pending human/coordinator decision
```

Legacy `QA Coordinator` issues should be triaged through this section. They do
not require a separate QA Coordinator pass.

## Documentation/state closeout

Before exposing the next lane or closing a coordinator/workflow issue, deliberately decide whether documentation or workflow state must change.

For any state-changing slice handoff, record a State Checkpoint before exposing
the next lane or closing the issue:

```text
No slice handoff without a State Checkpoint.
```

Use exactly one State Checkpoint outcome:

```text
ledger updated in this PR/issue
ledger already correct
state-repair issue created/linked: PL-xxx
```

If the checkpoint is required, is not already correct, and cannot be updated in
the same PR or issue, create or link an executable state-repair issue before
closing the state-changing issue. The repair issue must be routeable to the
Coordinator Agent, normally with `lane:state-repair`, `agent:coordinator`, and
`agent:auto` when recurring automation should pick it. If the repair requires a
ledger or workflow-doc repository update, the repair issue must explicitly
authorize that workflow/docs mutation and PR workflow. A non-automated monitor
finding is evidence only; it cannot stand in for the executable repair issue.
If no executable repair path can be created or linked, report `BLOCKED PENDING
EVIDENCE` or `NEEDS DOCS` instead of moving the issue to `Done`.

Check at minimum:

- `docs/workflows/current-state-ledger.md` for phase, gate, next-lane, queue, and caveat facts;
- relevant role-agent docs if the decision changes role behavior;
- PR body or linked GitHub evidence if it is part of the workflow record;
- Linear issue state, comments, labels, blockers, and links that affect routing;
- `docs/agents/learning-log.md` only when a workflow learning is proposed, accepted, rejected, deferred, or superseded.

If live Linear/GitHub evidence conflicts with stale docs, do not ignore the conflict. Report it, then use the smallest correct outcome:

```text
updated now
no update needed, with reason
follow-up issue created or linked, with ID/link
blocked pending human/coordinator decision
```

Stale docs may be non-blocking for a product verdict when live evidence is stronger, but stale source-of-truth docs must be updated when in scope or tracked as an explicit follow-up when out of scope.

For coordinator/workflow issues, run a final git state check after final
Linear/GitHub writes and before moving the issue to `Done`. If that check shows
dirty files, unpushed commits, or an unmerged/unreviewed PR for this issue,
record the appropriate `BLOCKED`, `NEEDS PUBLISH`, or `NEEDS REVIEW` result
instead of closing the issue.

## CI evidence

Follow `docs/qa/ci-evidence.md`.

Prefer machine-readable GitHub check data when available, but do not depend only on combined-status API behavior. If no status data is available, use recorded run IDs, job IDs, reviewed head SHA with passing CI, or local deterministic evidence, and state the limitation.

## Decision vocabulary

Use the smallest truthful decision:

```text
COMPLETE / proceed
COMPLETE WITH NON-BLOCKING FOLLOW-UPS
NEEDS FIXES
NEEDS DOCS
NEEDS QA
NEEDS REVIEW
NEEDS PUBLISH
BLOCKED PENDING EVIDENCE
STOP FOR ARCHITECTURE REVIEW
```

## Coordinator report format

Post the decision as a Linear comment:

```text
Coordinator Report
Slice / milestone:
Evidence reviewed:
Implementation status:
Review verdict:
QA verdict:
QA/process finding status:
Deterministic checks:
Documentation status:
Documentation/state outcome:
Repository mutation status:
State checkpoint:
Architecture boundary status:
Decision:
Blocking issues:
Non-blocking follow-ups:
Recommended next slice:
Exact next action:
```

Include concrete IDs: Linear issues, PR numbers, reviewed head SHA, merge SHA, CI run/job identifiers when available, and known caveats.

## State transitions

After recording an accepting coordinator report, move the coordinator issue to `Done` when the issue asks the coordinator to complete the gate.

Do not move downstream coding, QA, or later coordinator issues unless the current gate explicitly instructs that transition and the evidence supports it.

Only coordinator gates or explicit human workflow updates may update `docs/workflows/current-state-ledger.md`.

## Heartbeat behavior

For recurring automation, return `DONT_NOTIFY` when no coordinator gate is ready, a predecessor is still active, QA is incomplete, request-changes evidence is unresolved, or an equivalent decision is already recorded.

Notify only when a gate was completed, a blocker needs attention, architecture review is required, or automation should be changed/stopped.

## Stop conditions

Stop and report when:

- required evidence is missing, stale, ambiguous, or contradictory;
- implementation/review/QA issues are not complete when required;
- request-changes evidence is unresolved;
- docs and code materially disagree;
- current work violates roadmap order or V1 boundaries;
- a decision would require architecture redesign.

## Roadmap order for M2

Preserve this order unless a later architecture decision changes it:

```text
Slice 2.1: PromptSource boundary and fake source seam
Slice 2.2: Public GitHub prompt source adapter
Slice 2.3: Runtime cache with TTL
Slice 2.4: Stale-while-revalidate and last-known-good behavior
Slice 2.5: Partial valid cache and cold failure behavior
Slice 2.6: Local validate-prompts script
Slice 2.7: Source/cache contract golden tests and docs
```

A coordinator report may recommend the next ordered slice, but must not execute it.
