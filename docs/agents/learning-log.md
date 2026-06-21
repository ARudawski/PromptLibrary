# Agent Learning Log

Status: active workflow audit log  
Last updated: 2026-06-20

This log records accepted, rejected, or deferred agent-learning decisions. It is an audit trail, not a runtime prompt. Agents should read the active role specs and current-state ledger first.

## Usage

Add an entry only when a learning candidate is reviewed by a coordinator gate or explicit human workflow update.

Template:

```markdown
## YYYY-MM-DD — Short title

Source:
- ALJ-XX
- PR #YY

Problem:
...

Decision:
accepted / rejected / deferred

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
accepted

Changed:
- Added `docs/agents/dispatcher.md` as the dispatcher prompt/spec.
- Added `docs/workflows/dispatcher-and-learning-setup.md` as the setup design.
- Added this learning log.

Notes:
- Dispatcher must run cheap Linear-only preflight before repository context loading.
- Role learning is artifact-based: agents propose learning candidates; coordinator/human review decides; accepted rules move into exactly one canonical file.
