# Agent Operating Specs

Status: active workflow contract  
Scope: Project Prompt Library agent behavior  
Last updated: 2026-06-28

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

## Human Consultation Gates

When a Linear issue, role packet, comment, or explicit user instruction says the
work requires `human discussion`, `ask the user`, `consult the user`, an
`explicit human decision`, or equivalent wording, that wording is a hard
consultation gate.

The agent may gather evidence, summarize tradeoffs, and present options. It must
then stop until the human answer is recorded in the issue or active thread.
Before that answer exists, the agent must not execute the decision by moving
issues, changing labels, blockers, dependencies, or lane exposure, mutating the
repository, creating state repair, merging PRs, or closing the issue.

The only exception is an explicit no-consult default path in the issue or
current user instruction. The default must name the action the agent may take
without a human answer and the evidence required before taking it.

Terminal reports for unresolved consultation gates use
`WAITING_FOR_HUMAN` or `BLOCKED PENDING HUMAN DECISION`. If a run discovers that
a prior consultation gate was bypassed, report it as a state/checkpoint or
permission/scope failure and recommend the smallest safe repair without
rewriting historical evidence.

## Same-Issue State Maintenance

When the current Coordinator, gate, or Review closeout changes the completed
slice, active lane, next lane, queue exposure, or routing-critical docs, narrow
ledger/current-state maintenance is in scope by default for that same issue and,
when a PR exists, that same PR.

Use `ledger updated in this PR/issue` when the update is made in the active
issue/PR. Use `ledger already correct` or
`checkpoint recorded in issue/PR/Linear evidence` only when no repository docs
mutation is needed and routing remains unambiguous.

Create or link a separate state-repair issue only when the same-issue/same-PR
path is unavailable or unsafe: the current issue forbids repo mutation, no
active PR exists and a repo-doc update is required, the repair is out-of-band or
discovered after closeout, the required fix is broader than the safe
ledger/pointer surface, evidence conflicts require human or Coordinator
decision, or already-merged work cannot be amended safely. When using separate
state repair, the report must say why the same-issue/same-PR path was not used.

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

## Failure Diagnosis And Requirement Evidence

Use this section when a role run sees a failed, missing, ambiguous, or
contradictory observation before retrying, escalating, creating follow-up work,
or issuing a terminal verdict. This is a role-run diagnosis rule. It does not
replace the Dispatcher decision taxonomy in [`dispatcher.md`](./dispatcher.md)
or the automation incident / learning-candidate format in
[`../workflows/dispatcher-and-learning-setup.md`](../workflows/dispatcher-and-learning-setup.md).
The Dispatcher still emits decisions such as `DONT_NOTIFY`,
`CLAIM_BLOCKED`, `STATE_DRIFT_DETECTED`, `AMBIGUOUS_QUEUE`,
`ROLE_HANDOFF_CANDIDATE`, or `ROLE_HANDOFF`. Automation mistakes or
near-misses that may change future workflow rules still use the PL-66
incident/learning path.

Failure taxonomy:

- `context failure` - the run has the wrong, missing, stale, or incomplete
  target context, such as issue, branch, PR, predecessor evidence, or worktree.
- `tool failure` - a CLI, MCP tool, network call, auth flow, filesystem access,
  sandbox, or service endpoint fails before proving project behavior.
- `instruction ambiguity` - current user instruction, issue scope, role spec,
  or repo guidance is unclear enough that a safe action cannot be selected.
- `source-of-truth conflict` - ledger, issue, PR, docs, branch, or live
  evidence disagree in a way that could change scope, state, or verdict.
- `verification failure` - a local check, CI check, smoke, audit step, or
  evidence review fails or cannot prove the claim it was meant to prove.
- `implementation failure` - changed files do not satisfy the issue, tests,
  architecture boundary, or non-goals.
- `review failure` - review cannot proceed, approve, or merge because of
  unresolved threads, stale head, missing review evidence, or actionable
  defects.
- `QA evidence failure` - QA cannot verify the target, pinned state, runtime
  viability, coverage claim, or gate evidence.
- `state/checkpoint failure` - live claims, issue state, labels, blockers,
  State Checkpoint evidence, or closeout state are missing, stale, or unsafe.
- `model reasoning failure` - an agent selected the wrong target, missed a
  non-goal, invented evidence, skipped a required read, or made an unsupported
  inference.
- `permission/scope failure` - the next action needs authority, credentials,
  escalation, mutation rights, or role scope the run does not have.
- `entropy/maintenance failure` - duplicated rules, stale pointers, conflicting
  examples, or accumulated caveats make the workflow harder to execute safely.
- `unknown` - the failure is real, but current evidence is insufficient to
  classify it more precisely.

Before retrying a failed or ambiguous operation that affects files, Linear,
GitHub, checks, gates, claims, or lane exposure, diagnose it:

1. Classify the failed observation with one primary taxonomy value and, when
   useful, one secondary value.
2. Cite the concrete evidence, such as command output, tool error, issue
   comment, PR head SHA, changed file, check result, or source document.
3. Decide `retry allowed`, `no retry`, or `escalate`.
4. Name the smallest safe retry scope, such as one command, one tool call, one
   re-fetch, one file read, one focused check, or one narrow docs edit.

Retry is allowed when the evidence points to a transient or local tool problem
and retrying cannot hide a real implementation, review, QA, state, or scope
failure. Retry is also allowed after the agent makes the smallest safe fix
within role authority for a deterministic format, lint, test, or docs failure;
the retry scope must be the same failing check or the smallest focused
verification that proves the fix. Use `no retry` when the failed observation
proves a real defect, missing evidence, or boundary violation that cannot be
fixed within the current role and scope. Use `escalate` for source-of-truth
conflicts, permission/scope gaps, claim ambiguity, missing State Checkpoint
evidence, destructive-risk uncertainty, fixes that need broader authority, or
repeated same-class failure.

Role reports must include this compact block when a failed, missing,
ambiguous, or contradictory observation materially shapes a terminal result,
such as `BLOCKED`, `REQUEST CHANGES`, `NEEDS FIXES`, escalation, no-retry,
follow-up creation, or a similar terminal verdict. Reports may omit it only
when no such observation shaped the result:

```text
Failure diagnosis:
failed_observation:
failure_class:
evidence:
retry_decision: retry allowed | no retry | escalate
smallest_safe_retry_scope:
result_after_retry:
```

For non-trivial implementation, review, QA, Coordinator, or AI Automation
Expert work, terminal reports should also map material acceptance criteria to
the evidence that proves them. Keep this lightweight for trivial typo fixes,
mechanical pointer-only docs repairs, and ledger-only evidence copies that do
not change routing or state semantics; in those cases one sentence explaining
why the map is not needed is enough.

Use this compact shape:

```text
Requirement-evidence map:
- requirement:
  evidence:
  status: proven | missing | not applicable
```

Material requirements include issue acceptance criteria, explicitly named
non-goals, behavior or workflow-safety risks, required checks, and required
repository or Linear/GitHub state transitions. If evidence is missing, say
which requirement remains unproven and whether the result is `BLOCKED`,
`NEEDS FIXES`, `NEEDS REVIEW`, `NEEDS QA`, or a non-blocking follow-up.

Example failure classification:

```text
Failure diagnosis:
failed_observation: npm run format:check failed after a docs-only edit.
failure_class: verification failure
evidence: format:check output named docs/agents/README.md.
retry_decision: retry allowed
smallest_safe_retry_scope: format the touched markdown file, then rerun npm run format:check once.
result_after_retry: passed
```

Example requirement-evidence map:

```text
Requirement-evidence map:
- requirement: Cross-role failure taxonomy is documented in a canonical place.
  evidence: docs/agents/README.md includes Failure Diagnosis And Requirement Evidence.
  status: proven
- requirement: Dispatcher decision taxonomy and incident/learning reporting are referenced rather than duplicated.
  evidence: The shared section links dispatcher.md and dispatcher-and-learning-setup.md as the canonical PL-63 and PL-66 surfaces.
  status: proven
- requirement: Product/runtime behavior remains unchanged.
  evidence: Changed files are limited to workflow docs; no source, prompt, schema, fixture, CI, or runtime files changed.
  status: proven
```

## Intervention Logging, Tool Permissions, And Entropy Audit

Use this section for harness-maintenance work that makes human steering,
permission boundaries, and workflow bloat visible without creating a dashboard,
database, scheduler, generic monitor queue, or private memory system.

### Human Intervention Logging

Log only material human or Coordinator interventions that unblock, correct, or
materially steer an agent/workflow. Do not log ordinary wording preferences,
normal review nits, one-off taste calls, or harmless chat back-and-forth unless
they reveal repeated missing harness support.

Intervention entries live on the affected Linear issue as a run comment, or in
a deliberately scoped Linear issue/document named by a human or Coordinator.
Do not add routine intervention entries to `docs/agents/learning-log.md`, repo
memory, or a new global log. If an intervention exposes an automation mistake,
near-miss, bad handoff, stale-state decision, duplicate claim, wrong-worktree
attempt, unsafe selection, or similar workflow-learning candidate, use the
automation incident / learning-candidate format in
[`../workflows/dispatcher-and-learning-setup.md`](../workflows/dispatcher-and-learning-setup.md).
Reviewed durable learning still requires coordinator/human adoption before it
moves into `docs/agents/learning-log.md` or an active role/spec file.

Canceled PL-70 remains context for a non-automated monitor findings idea; this
intervention rule does not make monitor findings executable, create a generic
monitor queue, or authorize `agent:auto` on manual-only role work.

When an intervention is material, classify it before proposing any durable
change:

```text
Human intervention log entry
intervention_at:
source:
affected_run:
trigger:
classification: issue template change | role spec change | script/check | permission rule | no action | future audit input
one_off_or_harness_gap:
evidence:
action_taken:
durability:
```

Use `one_off_or_harness_gap` to separate personal preference from missing
support. A one-off preference usually needs `no action`; a repeated blocker,
wrong target, missing evidence field, unclear permission, or recurring manual
scaffolding can become an issue template change, role spec change, script/check,
permission rule, or future audit input.

### Tool And Permission Registry

This registry summarizes role permissions. Role-specific files remain
authoritative for execution details, but conflicting or missing permission
guidance should be repaired here or in the owning role spec before an agent
mutates files, Linear, GitHub, claims, or queue exposure.

Dispatcher:

- Allowed reads: current-state ledger, Linear queue/state metadata, recent
  issue comments needed for live-claim checks, and cheap recent/open GitHub PR
  metadata allowed by `docs/agents/dispatcher.md`.
- Allowed mutations: none in candidate mode. Claim mode may mutate only the
  adopted claim fields, issue state/labels named by the adoption decision, and
  dispatcher claim comments.
- Forbidden operations: repository/source reads beyond cheap preflight, PR
  diffs, CI logs, product code changes, role execution, merge/review decisions,
  and AI Automation Expert recurring exposure.
- Approval requirements: claim mode requires explicit coordinator/human adoption
  plus a proven handoff consumer; candidate mode remains the default fallback.

Coding Agent:

- Allowed reads: compact repo/role contract, target issue/comments/blockers,
  predecessor evidence, and directly implicated source/docs/tests.
- Allowed mutations: scoped branch, product/docs/tests explicitly authorized by
  the issue, Linear work-state/report updates, and a reviewable PR.
- Forbidden operations: QA/review/coordinator gate decisions, self-merge,
  later-slice work, forbidden V1 runtime behavior, and unapproved workflow
  policy changes.
- Approval requirements: requires an executable Coding Agent issue or direct
  docs-only user request; repository mutation must end in `In Review`.

Review Agent:

- Allowed reads: target issue, PR body/diff/head, review threads, comments,
  check evidence, and directly implicated repo docs/source/tests.
- Allowed mutations: GitHub review or fallback PR comment, resolved review
  threads when actually addressed, Linear review report/state updates, merge
  after approval and final refresh, and the narrow State Checkpoint docs
  amendment path.
- Forbidden operations: implementing requested fixes by default, approving from
  summary alone, merging with stale head/unresolved blockers, or broad docs
  rewrites under checkpoint authority.
- Approval requirements: must have a concrete review target and sufficient
  current Linear/GitHub/check evidence; same-account review failures use the
  documented fallback comment path.

QA Agent:

- Allowed reads: QA target, predecessor reports, PR/commit/diff/check evidence,
  QA strategy/CI evidence, and files needed to verify the claim.
- Allowed mutations: QA Linear report, QA issue state when verdict allows,
  untracked Linear findings, and local ignored artifacts needed for verification.
- Forbidden operations: product-code fixes, test rewrites to make an
  implementation pass, architecture weakening, broad refactors, and product
  scope changes.
- Approval requirements: requires a QA Agent issue or explicit QA sweep request;
  findings must avoid duplicates and route implementation fixes to Coding Agent
  work or process findings to Coordinator Agent work.

Coordinator Agent:

- Allowed reads: gate/workflow issue, predecessor coding/review/QA evidence,
  linked PR/check evidence, current-state ledger, roadmap order, and docs
  implicated by the decision.
- Allowed mutations: Linear gate/report/state updates, issue annotations,
  follow-up issue creation/linking, and explicitly authorized workflow-doc
  repository changes through branch, PR, review, and merge/closeout.
- Forbidden operations: product implementation, unscoped later-lane exposure,
  closing state-changing work without a State Checkpoint outcome, and broad
  mechanical state repair outside the safe edit surface.
- Approval requirements: repository workflow-doc mutation requires explicit
  issue authority; `Done` requires review/merge/closeout evidence when a PR is
  involved.

AI Automation Expert:

- Allowed reads: compact repo/role contract, target issue, live labels/state,
  comments, blockers, attachments, current-state ledger, dispatcher/shared role
  docs, relevant claim/monitor/thread evidence, and repo/worktree state when
  mutation is possible.
- Allowed mutations: Linear live-claim and terminal reports, scoped workflow-doc
  changes only when explicitly authorized by the issue, branch/PR publication,
  and issue movement to `In Review` after repo mutation.
- Forbidden operations: product/runtime changes, claim-mode activation,
  scheduler or automation-loop creation, `agent:auto` exposure, recurring
  pickup, generic monitor queues, self-merge, and private learning outside
  reviewed artifacts.
- Approval requirements: manual-only route with exact human/coordinator target,
  AI Automation Expert title/body marker, `gate:manual`, resolved blockers, and
  no active role-agent thread; repo mutation needs normal Review Agent review.

### Harness Entropy Audit Checklist

Use this repeatable checklist when a human/coordinator explicitly asks for a
harness audit, at milestone/workflow closeout, or when repeated interventions
or state repairs point to the same workflow area. This is a lightweight audit,
not a recurring automation scheduler, dashboard, analytics system, or monitor
queue.

Check for:

- duplicated live-state prose outside `docs/workflows/current-state-ledger.md`;
- stale docs that conflict with Linear, GitHub, PR, branch, or ledger evidence;
- role specs that are too long to execute safely or duplicate shared rules;
- repeated report fields that could live in the shared `agent_evidence` block;
- repeated State Checkpoint or state-repair work for the same missing rule;
- unused labels, role paths, or issue states that invite unsafe queue exposure;
- checks that pass but do not prove the requirement they are cited for;
- prompts or docs longer than their current value;
- repeated material human interventions against the same workflow step.

For each finding, choose the smallest route:

```text
Harness entropy audit finding
finding:
evidence:
failure_class: entropy/maintenance failure | source-of-truth conflict | verification failure | permission/scope failure | other
smallest_action:
route: no action | docs compaction PR | role spec change | issue template change | script/check | future audit input
owner:
```

Prefer deleting, linking, or moving active rules to the canonical file over
copying the same rule into more role specs. If a finding would change product
scope, queue exposure, claim-mode adoption, labels, checks, or role authority,
route it through an explicit Coordinator/human workflow issue before acting.

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

Compact ledger contract:

- The ledger owns current routing facts, not project history. Its `Current
  State` section should stay to the current milestone/gate/slice/lane, next
  executable issue or `none`, and blockers/caveats that affect safe routing.
- The checkpoint record should use compact pointers such as `PL-143 / PR #87 /
  merge SHA` for the current and recent routing decisions. Older evidence
  belongs in Linear reports, PR bodies, roadmap/history docs, or git history
  unless it is still needed to decide the next handoff.
- The ledger should not duplicate queue policy, role specs, review/merge
  mechanics, issue label registries, or dispatcher decision procedures. Those
  active rules live in this shared spec, the role specs, and
  `docs/agents/dispatcher.md`.
- As a maintenance target, keep the ledger short enough for an intake pass:
  roughly one screen for current state and checkpoint pointers, and under about
  120 lines unless a live ambiguity requires temporary extra context. If it
  grows by appending evidence chains, compact it in the same issue/PR when in
  scope or create the smallest workflow-doc follow-up.
- PL-152-style separate state repair remains valid for exceptional stale-state
  cases, but ordinary state movement should prefer same-issue/same-PR compact
  ledger updates using the shared State Checkpoint outcomes below.

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

If a required State Checkpoint is missing, first apply the shared
same-issue/same-PR state maintenance rule above. The closing agent should update
the ledger in the current issue/PR whenever the update is narrow, expected, and
not forbidden; otherwise prove the ledger is already correct or record a durable
issue/PR/Linear checkpoint while routing remains unambiguous. The agent must
create or link an executable Coordinator Agent state-repair issue before moving
the original issue to `Done` only when that same-issue path is unavailable or
unsafe. An executable state-repair issue must carry the Coordinator Agent
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
