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
- [`../workflows/dispatcher-and-learning-setup.md`](../workflows/dispatcher-and-learning-setup.md) — dispatcher/role-learning design rationale, proof guidance, dry-run review aids, and historical setup notes.

## Reusable Codex execution assets

Durable role behavior lives in this directory and `AGENTS.md`. Reusable execution prompts and optional Codex custom-agent configs live outside this directory so task prompts stay short and copyable:

- [`../../codex-prompts/implement-slice.md`](../../codex-prompts/implement-slice.md) — default Coding Agent implementation prompt for one bounded issue/slice.
- [`../../codex-prompts/qa-review-slice.md`](../../codex-prompts/qa-review-slice.md) — default read-only QA boundary review prompt for one issue/PR.
- [`../../.codex/agents/ppl-slice-implementer.toml`](../../.codex/agents/ppl-slice-implementer.toml) — optional Codex custom-agent config for implementation runs.
- [`../../.codex/agents/ppl-qa-boundary-reviewer.toml`](../../.codex/agents/ppl-qa-boundary-reviewer.toml) — optional Codex custom-agent config for read-only boundary review runs.

These assets do not authorize new work. They package the existing workflow contract into faster, lower-token execution entry points.

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

1. Linear queue/state metadata and recent issue comments needed to select work
   and detect live claim markers.
2. `docs/workflows/current-state-ledger.md`.
3. Cheap recent/open GitHub PR metadata needed to detect state drift, limited to PR number, title, state, draft state, base/head branch, timestamps, and visible Linear issue links.

The Dispatcher must not read `AGENTS.md`, role specs, PR diffs, CI logs, PR comments, review threads, source files, long issue histories, or broad project docs before emitting a handoff. Its job is to produce one machine-readable dispatcher decision, normally `ROLE_HANDOFF_CANDIDATE` in candidate mode or `ROLE_HANDOFF` in adopted claim mode, then stop.

Fresh non-dispatcher role runs follow the full common operating contract below.

## Common operating contract

Every non-dispatcher role agent must read:

1. `AGENTS.md`
2. `docs/workflows/current-state-ledger.md`
3. its role-specific file from this directory
4. the target Linear issue, including comments, blockers/dependencies, and attachments
5. the linked PR/diff/commit when relevant
6. the architecture, roadmap, standards, QA, and source docs required by the issue

If these sources conflict, follow the source-of-truth rules in `AGENTS.md`. Stop and report the conflict instead of improvising.

Role-specific specs may add required evidence or role-local reads, but they do
not need to restate this baseline.

## Default Read Budgets

Read budgets define the default evidence surface before a role expands. They
are not permission to skip required live verification, issue-specific required
reading, or conflict checks. When a Role Run Packet is present, use it to orient
quickly, then verify the live sources named below before changing files,
mutating Linear, reviewing, merging, deciding a gate, or exposing a lane.

| Role | Default read budget |
|---|---|
| Dispatcher | Use only the dispatcher cheap preflight: current-state ledger, Linear queue/state metadata, recent issue comments needed for candidate selection, dependency or blocker checks, requested-changes or fix-needed evidence, and live claim checks, and cheap recent/open GitHub PR metadata limited to PR number, title, state, draft state, base/head branch, timestamps, and visible Linear issue links. The Dispatcher does not expand into PR diffs, CI logs, PR comments, review threads, source files, prompt files, role specs, `AGENTS.md`, broad docs, or long histories before handoff; when cheap evidence is insufficient, return the appropriate dispatcher drift or ambiguity result. |
| Coding Agent | Read `README.md`, `AGENTS.md`, current-state ledger, this shared spec, `docs/agents/coding-agent.md`, the target issue with comments, blockers, attachments, linked predecessor or PR evidence, and the directly implicated docs/source/test files. Expand into full architecture, roadmap, standards, QA, source, and test docs only when the issue, diff, or suspected conflict makes them relevant. |
| Review Agent | Read the compact repo/role contract, target issue, implementation report, PR body, changed files/diff, PR comments, review threads, check evidence, and directly implicated docs/source/test files. Expand when the PR touches boundaries, evidence is missing or contradictory, or the review could approve, reject, merge, amend checkpoint docs, or change state. |
| QA Agent | Read the compact repo/role contract, QA issue, implementation and review evidence, PR/commit/diff/check evidence, `docs/qa/test-strategy.md`, CI evidence guidance, and files needed to verify the claim. Expand into runtime/project-state, source, test, architecture, roadmap, and standards evidence when behavior, runnability, release readiness, or boundary safety is claimed. |
| Coordinator Agent | Read the compact repo/role contract, target gate or workflow issue, predecessor Coding/Review/QA evidence, linked PR/check evidence, current-state ledger, roadmap order, and docs directly implicated by the decision. Expand when deciding lane exposure, State Checkpoint sufficiency, queue repair, docs state, architecture scope, or contradictory evidence. |
| AI Automation Expert | Read the compact repo/role contract, target issue, live labels/state/comments/blockers/attachments, current-state ledger, dispatcher/shared role docs, relevant claim/monitor/thread evidence, and repo/worktree state when mutation is possible. Expand into dispatcher setup, learning log, architecture, roadmap, standards, QA, GitHub, or broader docs only when the automation decision could affect product scope, checks, gates, queue exposure, claim behavior, worktree safety, adoption, rollback, or compaction. |

Universal expansion triggers:

- ledger, issue, PR, branch, comments, blockers, labels, or role marker disagree;
- PR body, linked issue scope, changed files, review comments, or local diff disagree;
- checks, CI, review threads, State Checkpoint evidence, or required reports are
  missing, failed, stale, ambiguous, or contradicted;
- docs repeat current state differently from the current-state ledger;
- the change touches architecture, roadmap, standards, QA policy, CI, prompt
  files, prompt bodies, aliases, tool metadata, tool schemas, golden fixtures,
  runtime boundaries, hosted/release readiness, claim mode, queue exposure,
  State Checkpoint rules, or role responsibilities;
- the role would mutate repository files, Linear state, labels, claims,
  comments, PR state, review verdicts, merge state, or downstream exposure;
- the run observes wrong worktree, dirty worktree, unpushed commits, unrelated
  local changes, duplicate claims, expired claims, or active-thread ambiguity.

Expansion should be targeted: read the missing or implicated evidence, not every
historical document. For the Dispatcher, these triggers do not authorize
expensive pre-handoff reads; they require a safe dispatcher result such as
`STATE_DRIFT_DETECTED`, `AMBIGUOUS_QUEUE`, or a handoff that carries a clear
state caveat when the cheap evidence remains sufficient.

## QA Trigger Matrix

Use this matrix to decide whether independent QA is required after repository
changes. It does not replace Review Agent review, Coordinator gates, or
issue-specific QA instructions.

| Change type | QA expectation |
|---|---|
| Product/runtime behavior | Mandatory QA before gate acceptance or downstream exposure. Use deterministic tests and runtime/project-state viability evidence when behavior or runnability is claimed. |
| Prompt body, alias, or tool metadata | Mandatory QA. Run prompt validation and the relevant unit, contract, golden, or walkthrough checks for the changed behavior. |
| Tool schema, MCP contract, or golden-test behavior | Mandatory QA when the model-visible contract, input/output schema, fixtures, or exact payload behavior changes. Contract/golden evidence must be explicit. |
| Hosted, release, tunnel, deployment, auth, database, or readiness behavior | Mandatory QA with CI/check evidence and the closest practical smoke or readiness verification allowed by the issue. |
| Workflow routing, claim mode, queue exposure, State Checkpoint semantics, or role responsibility changes | QA is required when the issue or gate asks for it, when automated execution behavior changes, or when the change can alter lane exposure, live ownership, terminal markers, or closeout decisions. At minimum, Review Agent and Coordinator evidence must cover the workflow-safety impact. |
| Docs-only workflow pointer repair | QA is not needed by default when the repair only updates stale pointers, navigation, or wording and does not change routing/state semantics. QA becomes required when the issue explicitly requires QA or the repair changes executable workflow behavior. |
| Ledger-only mechanical state repair | QA is not needed by default when proven evidence is copied into the ledger without changing policy, routing semantics, or downstream exposure beyond the approved checkpoint. QA becomes required when the evidence is disputed, incomplete, or the repair changes executable state semantics. |
| PR template, report-format, or evidence-format tweak | QA is optional by default. QA is required when the tweak changes machine-parsed markers, terminal evidence semantics, issue-reference safety, required checks, gate responsibilities, or automation behavior. |

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

Coordinator-authored workflow-doc changes and other role-authorized repository
mutations use the shared repository mutation and closeout discipline below.

Decision-only coordinator work may close from recorded Linear/GitHub evidence
without a PR when it does not mutate repository files.

## Role Run Packet

A Role Run Packet is a compact handoff or intake summary for a fresh role run.
It is derived context only. It does not replace the current-state ledger, target
Linear issue, live issue comments, blockers, attachments, linked PR, branch,
commit, or role spec as sources of truth.

Agents may use a packet to start with less repeated prose, but they must verify
the live ledger, issue, and PR/branch/head state before mutating Linear,
changing files, reviewing, merging, or deciding a gate. If no packet is supplied,
the role agent may build the same summary during intake.

```text
Role Run Packet
target_issue:
target_pr:
target_branch:
target_commit:
role:
current_lane:
allowed_action:
required_reads:
optional_reads_on_trigger:
stop_conditions:
expected_output:
```

Use `none` for PR, branch, or commit fields that do not apply. `current_lane`
must name the ledger-derived lane or explain why the issue is an explicit
manual exception. `allowed_action` must be the smallest role-safe action, such
as implement docs, review PR, run QA audit, synthesize gate, or audit workflow
safety. `required_reads` must include the common operating contract and the
target issue sources. `optional_reads_on_trigger` should name expensive reads
that happen only when needed, such as PR diffs, CI logs, long issue histories,
runtime docs, source/test files, or broader architecture docs.

Expand beyond the packet when any trigger applies:

- live issue state, comments, blockers, labels, attachments, PR head, or ledger
  state differs from the packet;
- the run will change files, move Linear state, review or merge a PR, decide a
  gate, or expose a lane;
- the packet points to a linked PR, check result, dependency, or predecessor
  decision whose current state matters;
- the change could affect product/runtime behavior, architecture, roadmap,
  State Checkpoint evidence, queue exposure, claim mode, or role boundaries;
- required evidence is missing, ambiguous, stale, or contradicted by live
  Linear, GitHub, or repository state.

## Terminal Agent Evidence

Every terminal role report must include the human-readable role report fields
from the relevant spec and a compact evidence block in this shared format.
Include it near the end of the report. If the run has a `claim_id`, the
canonical claim terminal marker still comes after this block and remains the
final machine-facing marker.

```text
<agent_evidence version="1">
role:
target_issue:
target_pr:
target_branch:
target_head_sha:
merge_sha:
changed_files:
checks:
docs:
state_checkpoint:
result:
recommended_next_action:
</agent_evidence>
```

Use concise values, not transcripts or large diffs. `target_pr`,
`target_branch`, `target_head_sha`, and `merge_sha` may be `none` when not
relevant. `checks` must name exact commands, CI runs, or skipped checks with the
reason. `docs` must say what changed or why docs were not needed.
`state_checkpoint` must use the shared State Checkpoint vocabulary when a
checkpoint is required, or `not required: REASON` when no slice/lane state
changes. `result` should match the role verdict, such as `NEEDS REVIEW`,
`APPROVE`, `PASS`, `COMPLETE`, or `BLOCKED`.

## Issue Reference Safety

PR bodies, role reports, Linear comments, and GitHub comments must use issue
references intentionally. Reserve closing or implementation words such as
`close`, `fix`, `resolve`, `complete`, and `implement` for the target issue the
work is meant to advance.

For non-goal or context issues, avoid negated lifecycle phrases. Integrations
may still treat the issue ID as linked to the PR lifecycle.

Unsafe:

```text
This does not close PL-60 or implement PL-67.
```

Safer:

```text
Context only: PL-60, PL-67. No lifecycle action requested for these issues.
```

## Repository Mutation and Closeout

Any role-authorized repository mutation must use a durable path:

```text
ticket -> branch -> commit -> PR -> Review Agent review -> merge/closeout evidence -> Done
```

Before editing, verify the repository, remote, base branch or pinned ref, and
worktree state. Use a scoped branch, commit only the authorized files, push the
branch, and open or update a PR with role evidence.

After opening a PR, report `NEEDS REVIEW` and move the owning issue to
`In Review` when that state exists. Do not move the issue to `Done` until
review, merge, and closeout evidence exist.

If repository work is unfinished, report the smallest truthful state:
uncommitted changes are `BLOCKED`, committed but unpushed changes are
`NEEDS PUBLISH`, and an open unreviewed or unmerged PR is `NEEDS REVIEW`. Include
the dirty files, branch, commit, or PR in the report.

Role-specific specs still decide whether that role may mutate files at all and
which docs or closeout checks are in scope.

## Drift control

Update `docs/workflows/current-state-ledger.md` only from coordinator gates or explicit workflow updates. Ordinary coding, review, and QA agents may report stale ledger information, but should not silently rewrite the ledger unless their issue explicitly asks for workflow documentation changes.

Coordinator gates and workflow closeouts must follow the documentation/state closeout rule in [`coordinator-agent.md`](./coordinator-agent.md) before exposing the next lane or closing the issue.

## Live-State Compression

Detailed current phase, current lane, next lane, queue exposure, and active
caveat facts live in `docs/workflows/current-state-ledger.md` only. README,
AGENTS, docs indexes, and architecture/roadmap/standards/QA entry docs should
point to the ledger instead of repeating detailed live state.

Historical milestone and gate records may stay in durable docs when useful, but
they must not read as the current routing source. Ordinary phase movement should
not require broad entry-doc updates unless a pointer is stale, a required-reading
doc would misroute agents, or routing-critical facts are ambiguous.

## Recurring Documentation State Repair

Recurring documentation state repair keeps current-state routing docs legible
without turning ordinary phase movement into broad documentation churn. It is
operating-state repair only; it must not decide product scope, architecture
policy, roadmap order, runtime behavior, prompt behavior, or later-lane
exposure.

Recurring preflight may use only:

- `docs/workflows/current-state-ledger.md`;
- Linear queue/state metadata and recent issue comments needed to compare the
  current lane, blockers, labels, and live claims, including `AGENT RUNNING`
  and matching terminal markers;
- recent/open GitHub PR metadata needed to explain state drift, limited to PR
  number, title, state, draft state, base/head branch, timestamps, merge state,
  and visible Linear issue links.

Do not read PR diffs, CI logs, PR comments, review threads, source files,
prompt files, broad docs, or long histories before selecting a repair handoff.
Those inputs are allowed only after an explicitly selected repair issue requires
them.

Allowed recurring outcomes are:

```text
DONT_NOTIFY
STATE_DRIFT_DETECTED
docs-repair handoff for mechanical pointer/ledger drift
Coordinator repair issue needed
```

A mechanical docs repair may normally change only these files:

```text
docs/workflows/current-state-ledger.md
README.md
AGENTS.md
docs/README.md
```

The hard limit for one mechanical recurring repair is three changed files. If
the repair needs more files, changes outside that surface, PR diffs or CI logs
to understand the fix, policy judgment, product/architecture decisions, or
unproven lane exposure, stop and create or report a Coordinator Agent
docs/workflow issue instead.

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
checkpoint recorded in issue/PR/Linear evidence
state-repair issue created/linked: PL-xxx
```

Coding, Review, Coordinator, and Dispatcher evidence must carry the checkpoint
when their work completes, merges, exposes, or selects a state-changing handoff.
If no slice/lane state changes, the report may say no State Checkpoint was
required; do not invent a checkpoint outcome for non-handoffs.

Use `checkpoint recorded in issue/PR/Linear evidence` only when the ledger and
other routing-critical docs are already correct and unambiguous, no repository
docs mutation is needed, and the issue, PR body/comment, or Linear report
durably records the state-changing evidence and downstream exposure decision.

If a required State Checkpoint is missing and the closing agent cannot update
the ledger, prove it is already correct, or record a durable issue/PR/Linear
checkpoint while routing remains unambiguous, the agent must create or link an
executable Coordinator Agent state-repair issue before moving the original issue
to `Done`. An executable state-repair issue must carry the Coordinator Agent
marker, `lane:state-repair`, `agent:coordinator`, and the automation label
required by the current workflow when recurring automation should pick it. When
the repair requires repository mutation, such as a current-state ledger or
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
