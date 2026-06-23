# Current State Ledger - Project Prompt Library

Status: active workflow ledger
Last updated: 2026-06-23
Update authority: coordinator gate, explicit human workflow update, or narrow Review Agent State Checkpoint docs amendment under `docs/agents/review-agent.md`

This ledger is the compact current-state pointer for agents. It prevents stale long-form docs from being treated as current operating state.

## Current State

```text
Last completed product milestone: M4 - Local MVP complete via PL-111 after PL-110 QA; M5.1 personal-use trial planning is the next allowed product lane
Last completed product gate: M4 coordinator completion/readiness gate - accepted via PL-111 after PL-110 QA approval; State Checkpoint recorded in this PR/issue
Active product slice: none
Current workflow lane: M5.1 personal-use trial planning issue selection; no M5 implementation issue is active until explicitly selected or created
Next product lane: Slice 5.1 personal-use trial protocol and results log only
Blocked product work: M5.2/M5.3/M5.4 work, M6 hosted deployment, later hosted/private suites, auth/OAuth, DB, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, additional real prompt files, and broader runtime behavior remain blocked without an explicit coordinator path
```

## State Checkpoint Record

```text
M4.2 State Checkpoint outcome: ledger updated in PL-113 state-repair issue/PR
M4.3 State Checkpoint outcome: ledger updated in PL-114 state-repair issue/PR
M4.4 State Checkpoint outcome: ledger updated in PL-115 state-repair issue/PR
M4.5 State Checkpoint outcome: ledger updated in PL-116 / PR #57
M4.Gate State Checkpoint outcome: ledger updated in this PR/issue
Evidence chain: PL-103 / PR #48 merged for Slice 4.1 prompt authoring baseline; PL-104 approved proceeding to prompt files; PL-105 / PR #49 merged at db80c97166d4724ef114f8cf5db351ad8c870868 for local runtime source alignment; PL-106 / PR #50 merged at ebdd0e6e48439d7713591bbfe9ddeec3c2b01e35 for the active handoff MVP prompt; PL-113 / PR #51 merged at 9cc57a11b89ab9316cf26f0fa84430264d8c33f8 for the M4.2 State Checkpoint; PL-107 / PR #52 merged at a419d477417a4e657d00ccf1ac47aa2ca26bf267 for the active grill-me MVP prompt; PL-114 / PR #53 merged at c9977981a61df3ab3db03707e323b85d371ac0d8 for the M4.3 State Checkpoint; PL-108 / PR #54 reviewed head e790a7bf3ce9101ea3b42822abfed3fd549a55a1 and merged at 5a7fd819cec2698d9f5dd6e31f6e1ee755f71078 for the active spec-prompt-creator MVP prompt; PL-115 / PR #55 merged at c3bc91485aaaefaccd321c718fccead61333d5e8 for the M4.4 State Checkpoint; PL-109 / PR #56 reviewed head f74dc007b7e24b0a5a3c4396c8de3def476cb379 and merged at 17cf26ee1e482bc8a371a6553bfe278900f16a64 for Slice 4.5 real-prompt validation, golden tests, and local MVP walkthrough; PL-116 / PR #57 merged at c8b2c594f45629eef05cdf8911cf1de196f8e669 for the M4.5 State Checkpoint; PL-110 QA passed with `PASS / approved - M4 local MVP complete`; PL-111 accepted M4 completion/readiness and M5.1 planning as the next allowed lane
Downstream exposure rule: M5.1 personal-use trial protocol and results log is the next allowed product lane after this PL-111 state-update PR is reviewed, merged, and closed out. M5.2/M5.3/M5.4, M6 hosted deployment, hosted/private suites, auth/OAuth, DB, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, additional real prompt files, and broader runtime behavior remain blocked without an explicit coordinator path.
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
Slice 3.5: inspect/list golden tests and tool reference - approved via PL-78 / PR #45; reviewed head 324df68180cefc2c9cadc33c3b654e420f0134ec; merge 23bda0319154431a8e0d941bf954403a6856b85b
M3: read-only API - complete with non-blocking follow-ups via PL-80 after PL-79 QA
Slice 4.1: prompt authoring baseline and metadata conventions - approved via PL-103 / PR #48; reviewed head 98c1188dc2e5fbc3f1b01fe94484bd5ecd51c343; merge 5172b769b77b19e67eba58d512e23c3af0944b49
M4.QA.1: prompt authoring baseline review before real prompt files - approved via PL-104
Slice 4.1b: local runtime source alignment with real prompt files - approved via PL-105 / PR #49; reviewed head 6cfb093aac432e814cec549c224ec38e8dc39db4; merge db80c97166d4724ef114f8cf5db351ad8c870868
Slice 4.2: active handoff MVP prompt - approved via PL-106 / PR #50; reviewed head cc98aedd8594dce4f1a266e4cea32ebe237e9d6b; merge ebdd0e6e48439d7713591bbfe9ddeec3c2b01e35; State Checkpoint recorded via PL-113
Slice 4.3: active grill-me MVP prompt - approved via PL-107 / PR #52; reviewed head 1d3652783445bc429a8c5aaec2e33735d9ce5527; merge a419d477417a4e657d00ccf1ac47aa2ca26bf267; State Checkpoint recorded via PL-114
Slice 4.4: active spec-prompt-creator MVP prompt - approved via PL-108 / PR #54; reviewed head e790a7bf3ce9101ea3b42822abfed3fd549a55a1; merge 5a7fd819cec2698d9f5dd6e31f6e1ee755f71078; State Checkpoint recorded via PL-115
Slice 4.5: real-prompt validation, golden tests, and local MVP walkthrough - approved via PL-109 / PR #56; reviewed head f74dc007b7e24b0a5a3c4396c8de3def476cb379; merge 17cf26ee1e482bc8a371a6553bfe278900f16a64; State Checkpoint recorded via PL-116
M4.QA: real prompt MVP behavior audit - approved via PL-110 with PASS / approved - M4 local MVP complete
M4.Gate: local MVP completion and M5 readiness - accepted via PL-111; next allowed product lane is M5.1 personal-use trial planning
```

## Active Caveats To Carry Forward

- `test:golden` now includes Slice 2.7 source/cache golden coverage, Slice 3.5 read-only API golden coverage, Slice 4.2 handoff golden coverage, Slice 4.3 grill-me golden coverage, Slice 4.4 spec-prompt-creator golden coverage, and Slice 4.5 coherent local MVP catalog coverage; `docs/tool-reference.md` documents the three approved V1 tools.
- `validate-prompts` is a real local validator. As of PL-109 / PR #56 it validates three active local prompts, `handoff`, `grill-me`, and `spec-prompt-creator`; PL-110 independently QA-approved the real prompt MVP behavior, and PL-111 accepted M4 completion/readiness.
- npm audit caveats must be reported when observed.
- The public GitHub source adapter and cache are approved M2 infrastructure; PL-105 / PR #49 aligned the local runtime with local `prompts/*.md` loading; broader hosted/private/source behavior remains later-slice work.
- `inspect_prompt_library_command` is implemented through Slice 3.2. `ListPromptsUseCase` and command summary projection are implemented through Slice 3.3. `list_prompt_library_commands` MCP adapter is implemented through Slice 3.4. Slice 3.5 inspect/list golden tests and tool-reference coverage are implemented through PL-78 / PR #45. PL-79 QA passed, PL-80 accepted M3 completion/readiness, PL-110 QA passed the M4 local MVP, and PL-111 accepted M4 completion/readiness.
- Hosted deployment, private suites, auth/OAuth, DB behavior, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, and additional real prompt files beyond the approved three-prompt M4 MVP set are not implemented.
- Dispatcher claim mode remains off until the handoff-consumer proof/adoption path is explicitly accepted.
- The AI Automation Expert role is represented in the active agent setup as a manual-only workflow audit role. It is not recurring automation-pickable; do not attach `agent:auto`. The runtime dispatcher/spawner may create an AI Automation Expert role thread only for an exact issue explicitly targeted by a human or Coordinator Agent whose title/body names the role. Generic recurring Todo/Backlog selection must skip it and report `agent:auto` exposure as queue drift. This targeted route does not activate claim mode, a new automation loop, product runtime behavior, or broader queue exposure.

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

Manual AI Automation Expert handoffs are the explicit exception to the normal
recurring formula: they require exact human/coordinator targeting, the
AI Automation Expert title/body marker, `gate:manual`, resolved blockers, and no
known active role-agent thread, but no recurring agent label and no product
slice/lane match. Generic Todo/Backlog exposure for that role, especially with
`agent:auto`, is queue drift rather than executable work.

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

Do not rewrite this ledger from ordinary coding or QA runs unless the issue explicitly asks for workflow documentation changes. Review Agent may update it only through the narrow State Checkpoint docs amendment path in `docs/agents/review-agent.md`; otherwise agents may report stale ledger data as a finding.
