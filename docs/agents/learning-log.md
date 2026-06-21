# Agent Learning Log

Status: proposed workflow audit log  
Last updated: 2026-06-21

This log records proposed, accepted, rejected, deferred, or superseded agent-learning decisions. It is an audit trail, not a runtime prompt. Agents should read the active role specs and current-state ledger first.

Do not use this log for private agent memory, ordinary run notes, or unreviewed lessons. Add only workflow learnings that a coordinator gate or explicit human workflow update has reviewed.

Adoption note: this log becomes part of the active workflow only after a coordinator/human adoption gate accepts the dispatcher and role-learning setup.

## Usage

Add an entry only when a learning candidate is reviewed by a coordinator gate or explicit human workflow update.

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
