# Current State Ledger — Project Prompt Library

Status: active workflow ledger  
Last updated: 2026-06-20  
Update authority: coordinator gate or explicit human workflow update

This ledger is the compact current-state pointer for agents. It prevents stale long-form docs from being treated as current operating state.

## Current state

```text
Active milestone: M2 — Public source, cache, validation
Active slice: Slice 2.4 — Stale-while-revalidate and last-known-good cache behavior
Current gate: Slice 2.4 QA/coordinator completion
Last completed gate: Slice 2.3 — runtime cache with TTL
Next allowed slice after gate: Slice 2.5 — partial valid cache and cold failure behavior
Blocked slices: Slice 2.5+ until Slice 2.4 coordinator gate completes
```

## Completed gates

```text
Slice -1: repository/workflow bootstrap — complete
Slice 0: local @pl proof gate — accepted with caveats
Slice 1: fixture-backed invocation walking skeleton — approved
Slice 2.1: PromptSource boundary and fake source seam — approved
Slice 2.2: public GitHub prompt source adapter — approved
Slice 2.3: runtime cache with TTL — approved
```

## Active caveats to carry forward

- `test:golden` may pass with no golden files until golden coverage is implemented.
- `validate-prompts` may remain a placeholder until Slice 2.6 is completed.
- npm audit caveats must be reported when observed.
- The public GitHub source adapter and cache remain infrastructure until later slices wire broader runtime behavior.
- Real prompt files, inspect/list tools, hosted deployment, private suites, auth, and DB behavior are not implemented.

## Queue selection rule

Backlog is planning state, not executable state.

Automation may execute only an issue that matches all relevant criteria:

```text
state = Todo
expected agent label is present
expected title marker is present
issue is not blocked
issue belongs to the current allowed slice/lane
```

Expected labels:

```text
agent:codex-local   coding automation may pick this issue
agent:auto          recurring automation may pick this issue without explicit target
agent:qa-local      QA automation may pick this issue
gate:manual         human/coordinator decision required; do not auto-execute
```

Keep exactly one next executable Coding Agent issue at a time unless the user explicitly opens parallel implementation lanes.

## Review pattern

Default workflow:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer issues are optional. They are special-case tracking, not the default dependency for coordinator gates.

## Update rule

Do not rewrite this ledger from ordinary coding, review, or QA runs unless the issue explicitly asks for workflow documentation changes. Agents may report stale ledger data as a finding.
