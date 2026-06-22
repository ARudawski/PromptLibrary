# Current State Ledger - Project Prompt Library

Status: active workflow ledger
Last updated: 2026-06-22
Update authority: coordinator gate or explicit human workflow update

This ledger is the compact current-state pointer for agents. It prevents stale long-form docs from being treated as current operating state.

## Current State

```text
Last completed product milestone: M2 - Public source, cache, validation; M3 is in progress
Last completed product gate: Slice 3.4 - List MCP adapter via PL-77 / PR #43
Active product slice: none
Current workflow lane: M3 / Slice 3.5 queue selection after Slice 3.4 closeout
Next product lane: M3 / Slice 3.5 - Inspect/list golden tests and tool reference, tracked by PL-78 and only after explicit queue selection or promotion
Blocked product work: Slice 3.5+ implementation until the next issue is explicitly selected; real prompts, hosted deployment, private suites, auth, and DB remain later-slice work
```

## Completed Gates

```text
Slice -1: repository/workflow bootstrap - complete
Slice 0: local @pl proof gate - accepted with caveats
Slice 1: fixture-backed invocation walking skeleton - approved
Slice 2.1: PromptSource boundary and fake source seam - approved
Slice 2.2: public GitHub prompt source adapter - approved
Slice 2.3: runtime cache with TTL - approved
Slice 2.4: stale-while-revalidate and last-known-good cache behavior - approved
Slice 2.5: partial valid cache and cold failure behavior - approved
Slice 2.6: local validate-prompts script - approved
Slice 2.7: source/cache contract and golden tests - approved
M2: public source, cache, validation - complete with non-blocking follow-ups
Slice 3.1: inspect use case and projection - approved via PL-74 / PR #35
Slice 3.2: inspect MCP adapter - approved via PL-75 / PR #36
Slice 3.3: list use case and summary projection - approved via PL-76 / PR #40; reviewed head 6e1e56f838e5adef2046023b72d3cfffafa48c16; merge aa8f4c0bbb479d57e2051b22b8d0f892ea1bf9ea
Slice 3.4: list MCP adapter - approved via PL-77 / PR #43; reviewed head 4ef12dc60ddd044ce80e2a7dad3ec77768333668; merge db48a19f57832f5806073f28926b6db0f2b421f7
```

## Active Caveats To Carry Forward

- `test:golden` now includes Slice 2.7 source/cache golden coverage; Slice 3.5 still needs inspect/list golden and tool-reference coverage when reached.
- `validate-prompts` is a real local validator, but it may pass with zero local prompt files until real prompt slices add approved prompt definitions.
- npm audit caveats must be reported when observed.
- The public GitHub source adapter and cache are approved M2 infrastructure; real prompt files and broader runtime/user-facing behavior remain later-slice work.
- `inspect_prompt_library_command` is implemented through Slice 3.2. `ListPromptsUseCase` and command summary projection are implemented through Slice 3.3. `list_prompt_library_commands` MCP adapter is implemented through Slice 3.4. Slice 3.5 inspect/list golden tests and tool-reference coverage remain not implemented; do not start PL-78 / Slice 3.5 work without explicit queue selection or promotion.
- Hosted deployment, private suites, auth, and DB behavior are not implemented.
- Dispatcher claim mode remains off until the handoff-consumer proof/adoption path is explicitly accepted.

## Queue Selection Rule

`Todo` is the preferred executable state. If no matching `Todo` issue exists,
automation may promote and execute the top unblocked matching Backlog item for
the current allowed slice/lane.

Automation may execute only an issue that matches all relevant criteria:

```text
state = Todo, or top unblocked matching Backlog item when no matching Todo exists
expected agent label is present
expected title marker is present
issue is not blocked
issue belongs to the current allowed slice/lane
```

Expected labels:

```text
agent:codex-local   coding automation may pick Coding Agent issues
agent:review        review automation may inspect issues/PRs in review
agent:qa-local      QA automation may pick QA Agent issues
agent:coordinator   coordinator automation may pick Coordinator Report or state-repair issues
agent:auto          recurring automation may pick this without explicit target
gate:manual         human/coordinator decision required
```

State-repair queue exposure:

```text
lane:state-repair   coordinator-owned operating-state repair such as stale ledgers, stale workflow docs, broken labels, ambiguous queues, or stranded claims
agent:auto          may expose exactly one current state-repair candidate when recurring automation should pick it
```

Keep exactly one next executable Coding Agent issue at a time unless the user explicitly opens parallel implementation lanes.

## Review Pattern

Default workflow:

```text
Coding issue -> PR/review evidence on coding issue and PR -> QA issue -> coordinator gate
```

Separate Code Reviewer issues are optional. They are special-case tracking, not the default dependency for coordinator gates.

## Update Rule

Do not rewrite this ledger from ordinary coding, review, or QA runs unless the issue explicitly asks for workflow documentation changes. Agents may report stale ledger data as a finding.
