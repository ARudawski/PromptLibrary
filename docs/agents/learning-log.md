# Agent Learning Log

Status: proposed workflow audit log  
Last updated: 2026-06-22

This log records proposed, accepted, rejected, deferred, or superseded agent-learning decisions. It is an audit trail, not a runtime prompt. Agents should read the active role specs and current-state ledger first.

Do not use this log for private agent memory, ordinary run notes, or unreviewed lessons. Add only workflow learnings that a coordinator gate or explicit human workflow update has reviewed.

Adoption note: this log becomes part of the active workflow only after a coordinator/human adoption gate accepts the dispatcher and role-learning setup.

## Usage

Add an entry only when a learning candidate is reviewed by a coordinator gate or explicit human workflow update.

Raw automation incidents and near-misses belong first in Linear run comments using the workflow report format. This log records the reviewed decision, not the unreviewed incident transcript.

Decision values:

```text
proposed   documented candidate setup, not active yet
accepted   approved and active
rejected   intentionally not adopted
deferred   valid or plausible, but postponed
superseded replaced by a newer decision
```

Template:

```markdown
## YYYY-MM-DD — Short title

Source:
- ALJ-XX
- PR #YY

Problem:
...

Decision:
proposed / accepted / rejected / deferred / superseded

Changed:
- docs/agents/...
- docs/workflows/...

Notes:
...
```

## 2026-06-20 — Dispatcher and role-learning setup

Source:
- Workflow discussion after recurring Codex runs wasted context on idle Linear/GitHub checks.
- Existing repository agent specs and current-state ledger.

Problem:
Recurring role runs can spend tokens fetching Linear/GitHub/repo context before confirming there is actually executable work. Role behavior can also drift if lessons stay inside long-lived threads instead of durable docs.

Decision:
proposed

Changed:
- Added `docs/agents/dispatcher.md` as the dispatcher prompt/spec.
- Added `docs/workflows/dispatcher-and-learning-setup.md` as the setup design.
- Added this learning log.

Notes:
- Dispatcher must run cheap preflight before context loading.
- Role learning is artifact-based: agents propose learning candidates; coordinator/human review decides; accepted rules move into exactly one canonical file.
- This setup is not active until an explicit adoption gate accepts it.

## 2026-06-21 — Retire QA Coordinator as active role

Source:
- Human workflow request to evaluate PL-59 and PL-60.
- PL-59: QA sweep finding about retired review-ticket dependency.
- PL-60: QA finding about stale current-state ledger/status docs.

Problem:
The two live QA Coordinator tickets do not require a separate role. They are
QA-originated process and documentation-state findings that need workflow
triage, issue annotation, or source-of-truth updates.

Decision:
accepted

Changed:
- `docs/agents/README.md`
- `docs/agents/qa-agent.md`
- `docs/agents/coordinator-agent.md`
- `docs/qa/test-strategy.md`

Notes:
- QA Agent remains responsible for independent verification and sweep evidence.
- Coordinator Agent owns process correction, queue repair, documentation-state
  reconciliation, and gate decisions from QA-originated findings.
- Do not create new QA Coordinator issues.

## 2026-06-22 - Coordinator docs changes require PR workflow

Source:
- PL-84
- PL-85

Problem:
Coordinator/state-repair work may legitimately edit workflow docs, but PL-82
closed after local, uncommitted docs changes. That left hidden repository state
outside the ticket -> branch -> PR -> review -> merge/closeout path.

Decision:
accepted

Changed:
- `docs/agents/coordinator-agent.md`
- `docs/agents/README.md`
- `docs/agents/review-agent.md`
- `docs/agents/dispatcher.md`
- `docs/workflows/dispatcher-and-learning-setup.md`
- `docs/agents/learning-log.md`

Notes:
- Coordinator decision-only work remains distinct from repo-mutating
  workflow-doc work.
- Coordinator repository mutations require explicit docs/workflow issue
  authority and must be published through branch, commit, PR, review, and
  merge/closeout evidence before the issue is Done.

## 2026-06-22 - State Checkpoint for slice handoffs

Source:
- PL-83
- PL-60, PL-62, PL-81, and PL-82 drift-repair evidence

Problem:
Linear/GitHub slice state can advance while canonical repo state docs lag
behind, causing repeated caveats and unsafe handoff ambiguity.

Decision:
accepted

Changed:
- `docs/agents/README.md`
- `docs/agents/coordinator-agent.md`
- `docs/agents/coding-agent.md`
- `docs/agents/review-agent.md`
- `docs/agents/dispatcher.md`
- `docs/workflows/dispatcher-and-learning-setup.md`
- `docs/agents/learning-log.md`

Notes:
- Active invariant: `No slice handoff without a State Checkpoint.`
- Required handoff outcomes are `ledger updated in this PR/issue`, `ledger already correct`, or `state-repair issue created/linked: PL-xxx`.
- This learning does not authorize product implementation, new runtime tools,
  claim-mode adoption, or another role.

## 2026-06-22 - Executable state-repair handoff before closeout

Source:
- PL-89
- PL-87 and PL-88
- PL-76 / PR #40
- PL-82, PL-84, and PL-85

Problem:
The State Checkpoint invariant existed, but a closing agent could still report
that coordinator/state repair was needed without leaving behind executable
repair work. Non-automated monitor findings preserved evidence, but the
dispatcher could not execute them.

Decision:
accepted

Changed:
- `docs/agents/README.md`
- `docs/agents/review-agent.md`
- `docs/agents/coordinator-agent.md`
- `docs/agents/dispatcher.md`
- `docs/workflows/dispatcher-and-learning-setup.md`
- `docs/agents/learning-log.md`

Notes:
- When a required State Checkpoint is missing and cannot be updated or proven
  correct in the current closeout, the closing agent must create or link an
  executable Coordinator Agent state-repair issue before moving the original
  issue to `Done`.
- If that repair requires a ledger or workflow-doc repository update, the
  state-repair issue must explicitly authorize the required workflow/docs edits
  before the handoff counts as executable.
- Non-automated monitor findings are reports only; they do not satisfy
  `state-repair issue created/linked: PL-xxx` unless they link to a separate
  executable repair issue.
- Role-agent live claims use the canonical `AGENT RUNNING` marker with
  `claim_expires_at`.
- This learning does not authorize product implementation, PL-77 promotion,
  new runtime tools, claim-mode adoption, or parallel product lanes.
