# Current State Ledger - Project Prompt Library

Status: active workflow ledger
Last updated: 2026-06-28
Update authority: coordinator gate, explicit human workflow update, or narrow Review Agent State Checkpoint docs amendment under `docs/agents/review-agent.md`

This ledger is the compact current-state pointer for agents. It prevents stale long-form docs from being treated as current operating state.

## Current State

```text
Last completed product milestone: M5 - Personal-use trial complete via PL-128 / M5.Gate after PL-127 accepted M5.QA readiness; M4 local MVP complete via PL-111 remains the product/runtime baseline
Last completed product gate: M5.Gate - accepted via PL-128 with decision `M5 complete - proceed to M6 hosted deployment planning`; PL-127 approved proceeding to M5.Gate after PL-125 and PL-126 were canceled as conditional no-op work
Last completed M6 slice: Slice 6.1 hosting compatibility spike/planning rework complete via PL-142 / PR #86; prior PR #82 Render paid web service recommendation is historical/non-accepted evidence; Cloudflare Workers Free is selected only as the first no-paid hosted path to prove, with defer-hosting fallback if the no-paid proof cannot preserve approved connector behavior
Active product slice: PL-143 / Slice 6.2 minimal hosted deployment configuration is the next allowed product lane after PL-142 / PR #86 review/merge/closeout; no PL-143 implementation may start before PL-142 is Done
Current workflow lane: PL-143 / Slice 6.2 manual-only exposure after PL-142 / PR #86 closeout; PL-143 remains exact human/coordinator target required / not recurring automation-pickable unless a later explicit Coordinator/human decision adds `agent:auto`
Next product lane: PL-143 / Slice 6.2 minimal hosted deployment configuration for a Cloudflare Workers Free proof/configuration path first, with defer-hosting fallback if the no-paid proof fails; PL-143 remains manual-only / exact human/coordinator target required / not recurring automation-pickable unless a later explicit Coordinator/human decision adds `agent:auto`
Blocked product work after M6.1: PL-143 must not execute until PL-142 / PR #86 is reviewed, merged, and closed out; actual production deployment, hosted endpoint smoke, ChatGPT hosted connection verification, private suites, auth/OAuth, DB, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, additional real prompt files, prompt or alias changes, tool metadata changes, provider abstraction, production observability, paid-hosting selection, and broader runtime behavior remain blocked without explicit later M6 issues and coordinator paths
```

## State Checkpoint Record

```text
M4.2 State Checkpoint outcome: ledger updated in PL-113 state-repair issue/PR
M4.3 State Checkpoint outcome: ledger updated in PL-114 state-repair issue/PR
M4.4 State Checkpoint outcome: ledger updated in PL-115 state-repair issue/PR
M4.5 State Checkpoint outcome: ledger updated in PL-116 / PR #57
M4.Gate State Checkpoint outcome: ledger updated in this PR/issue
M5.QA.1 State Checkpoint outcome: ledger updated in this PR/issue
M5.2 State Checkpoint outcome: ledger updated in this PR/issue
M5.3 State Checkpoint outcome: ledger updated in this PR/issue
M5.QA State Checkpoint outcome: checkpoint recorded in issue/PR/Linear evidence
M5.Gate State Checkpoint outcome: ledger updated in this PR/issue
M6.1 State Checkpoint outcome: ledger updated in this PR/issue
M6.1 to M6.2 exposure State Checkpoint outcome: ledger updated in this PR/issue
M6.1 no-paid rework State Checkpoint outcome: ledger updated in this PR/issue
Evidence chain: PL-103 / PR #48 merged for Slice 4.1 prompt authoring baseline; PL-104 approved proceeding to prompt files; PL-105 / PR #49 merged at db80c97166d4724ef114f8cf5db351ad8c870868 for local runtime source alignment; PL-106 / PR #50 merged at ebdd0e6e48439d7713591bbfe9ddeec3c2b01e35 for the active handoff MVP prompt; PL-113 / PR #51 merged at 9cc57a11b89ab9316cf26f0fa84430264d8c33f8 for the M4.2 State Checkpoint; PL-107 / PR #52 merged at a419d477417a4e657d00ccf1ac47aa2ca26bf267 for the active grill-me MVP prompt; PL-114 / PR #53 merged at c9977981a61df3ab3db03707e323b85d371ac0d8 for the M4.3 State Checkpoint; PL-108 / PR #54 reviewed head e790a7bf3ce9101ea3b42822abfed3fd549a55a1 and merged at 5a7fd819cec2698d9f5dd6e31f6e1ee755f71078 for the active spec-prompt-creator MVP prompt; PL-115 / PR #55 merged at c3bc91485aaaefaccd321c718fccead61333d5e8 for the M4.4 State Checkpoint; PL-109 / PR #56 reviewed head f74dc007b7e24b0a5a3c4396c8de3def476cb379 and merged at 17cf26ee1e482bc8a371a6553bfe278900f16a64 for Slice 4.5 real-prompt validation, golden tests, and local MVP walkthrough; PL-116 / PR #57 merged at c8b2c594f45629eef05cdf8911cf1de196f8e669 for the M4.5 State Checkpoint; PL-110 QA passed with `PASS / approved - M4 local MVP complete`; PL-111 accepted M4 completion/readiness and M5.1 planning as the next allowed lane; PL-121 / PR #67 reviewed head 862c89ae7c379f24b12021776ff52f2572bab55a and merged at 822f54b4f7cf5bdd128bf6ef709844f2750cdab8 for Slice 5.1 personal-use trial protocol and results log; PL-122 QA passed with `PASS / approved - proceed to personal-use trial` and created PL-130 to record this State Checkpoint; PL-130 / PR #69 merged at 2d2db79b12b7d54b5f5bd63cd99563204811422c; PL-132 / PR #70 merged at 137c9102b78afcc12e43f80e0e363665b7229cf4 for the current ChatGPT app/action schema handoff; PL-123 accepted M5.2 trial evidence with the same 137c9102b78afcc12e43f80e0e363665b7229cf4 local baseline, six successful prompt uses, and caveats carried forward; PL-133 / PR #71 merged at 85e505c031c4057f724a701971da34e662caab66 and made PL-124 executable; PL-124 / PR #72 triaged the evidence in `docs/trials/m5-trial-findings.md`, found no evidence-backed M5.4 hardening issue, and merged at 06ad2953302c143ed7bb01e31c6c18990235e22f; PL-125 and PL-126 were canceled as conditional no-op work; PL-127 accepted M5.QA readiness and recommended PL-128 / M5.Gate; PL-128 accepted M5 completion/readiness and the M6 hosted deployment planning lane; PL-142 / PR #82 reviewed head 850ffd8dd67164c19fbb9cd9c361ece4ecd7dfdd and merged at 5169760882e62d59dcb1f857c34f0a0ce93abd49 for initial Slice 6.1 hosting compatibility/provider planning, but its Render paid web service recommendation was superseded by the explicit no-paid-hosting human constraint; PL-150 and PL-152 previously approved and recorded constrained manual-only PL-143 exposure from the PR #82 decision surface; PL-142 / PR #86 reworked the M6.1 provider decision so Cloudflare Workers Free is the first no-paid path to prove and defer-hosting is the fallback if the no-paid proof fails
Downstream exposure rule: PL-143 / Slice 6.2 minimal hosted deployment configuration may proceed only after PL-142 / PR #86 is reviewed, merged, and closed out, or through another explicit human/coordinator target that proves the same no-paid decision and current ledger state. PL-143 remains manual-only / not recurring automation-pickable unless a later explicit Coordinator/human decision adds `agent:auto`; recurring automation must skip PL-143 without `agent:auto` even if it matches state, title, agent label, and lane. Do not start production deployment, hosted endpoint smoke, ChatGPT hosted connection verification, private suites, auth/OAuth, DB, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, additional real prompt files, prompt or alias changes, tool metadata changes, provider abstraction, production observability, paid-hosting selection, or broader runtime behavior without explicit later M6 issues and coordinator paths.
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
M4.Gate: local MVP completion and M5 readiness - accepted via PL-111; next allowed product lane was M5.1 personal-use trial planning
Slice 5.1: personal-use trial protocol and results log - complete via PL-121 / PR #67; reviewed head 862c89ae7c379f24b12021776ff52f2572bab55a; merge 822f54b4f7cf5bdd128bf6ef709844f2750cdab8
M5.QA.1: personal-use trial protocol review - approved via PL-122 with PASS / approved - proceed to personal-use trial; State Checkpoint recorded via PL-130
Slice 5.2: personal-use trial execution and evidence recording - accepted via PL-123 with Linear-recorded evidence; local baseline 137c9102b78afcc12e43f80e0e363665b7229cf4; State Checkpoint recorded via PL-133
Slice 5.3: trial evidence review and issue triage - captured via PL-124; no evidence-backed M5.4 hardening issue currently justified
M5.QA: real-use readiness audit - approved via PL-127 after PL-125 and PL-126 were canceled as conditional no-op work
M5.Gate: personal-use trial completion and M6 readiness - accepted via PL-128 with decision `M5 complete - proceed to M6 hosted deployment planning`
Slice 6.1: hosting compatibility and provider decision spike - reworked via PL-142 / PR #86 after explicit no-paid-hosting human constraint; prior PR #82 Render paid web service decision is historical/non-accepted evidence; Cloudflare Workers Free selected as the first no-paid path to prove, with defer-hosting fallback if the no-paid proof cannot preserve approved connector behavior
```

## Active Caveats To Carry Forward

- `test:golden` now includes Slice 2.7 source/cache golden coverage, Slice 3.5 read-only API golden coverage, Slice 4.2 handoff golden coverage, Slice 4.3 grill-me golden coverage, Slice 4.4 spec-prompt-creator golden coverage, and Slice 4.5 coherent local MVP catalog coverage; `docs/tool-reference.md` documents the three approved V1 tools.
- `validate-prompts` is a real local validator. As of PL-109 / PR #56 it validates three active local prompts, `handoff`, `grill-me`, and `spec-prompt-creator`; PL-110 independently QA-approved the real prompt MVP behavior, and PL-111 accepted M4 completion/readiness.
- npm audit caveats must be reported when observed.
- The public GitHub source adapter and cache are approved M2 infrastructure; PL-105 / PR #49 aligned the local runtime with local `prompts/*.md` loading; broader hosted/private/source behavior remains later-slice work.
- `inspect_prompt_library_command` is implemented through Slice 3.2. `ListPromptsUseCase` and command summary projection are implemented through Slice 3.3. `list_prompt_library_commands` MCP adapter is implemented through Slice 3.4. Slice 3.5 inspect/list golden tests and tool-reference coverage are implemented through PL-78 / PR #45. PL-79 QA passed, PL-80 accepted M3 completion/readiness, PL-110 QA passed the M4 local MVP, and PL-111 accepted M4 completion/readiness.
- Hosted deployment, private suites, auth/OAuth, DB behavior, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, and additional real prompt files beyond the approved three-prompt M4 MVP set are not implemented. PL-142 / PR #86 supersedes the prior Render paid recommendation and scopes PL-143 / Slice 6.2 to a Cloudflare Workers Free proof/configuration path first, with defer-hosting fallback if the no-paid proof cannot preserve approved connector behavior; PL-143 remains manual-only / exact human/coordinator target required / not recurring automation-pickable unless a later explicit Coordinator/human decision adds `agent:auto`.
- M5.1 trial protocol/log docs are complete through PL-121 / PR #67, PL-122 approved the protocol before trial execution, and PL-123 accepted M5.2 trial evidence recorded in Linear comments. PL-124 / M5.3 summarized the accepted evidence in `docs/trials/m5-trial-findings.md` and updated `docs/trials/m5-personal-use-trial-log.md` with a pointer to the Linear evidence instead of copying raw transcripts wholesale. PL-127 accepted M5.QA readiness after PL-125/PL-126 cancellation, and PL-128 accepted M5 completion/readiness for M6 hosted deployment planning.
- Dispatcher claim mode remains off until the handoff-consumer proof/adoption path is explicitly accepted.
- The AI Automation Expert role is represented in the active agent setup as a manual-only workflow audit role. It is not recurring automation-pickable; do not attach `agent:auto`. The runtime dispatcher/spawner may create an AI Automation Expert role thread only for an exact issue explicitly targeted by a human or Coordinator Agent whose title/body names the role. Generic recurring Todo/Backlog selection must skip it and report `agent:auto` exposure as queue drift. This targeted route does not activate claim mode, a new automation loop, product runtime behavior, or broader queue exposure.

## Queue Selection Rule

`Todo` is the preferred executable state. If no matching `Todo` issue exists,
recurring automation may promote and execute the top unblocked matching Backlog
item for the current allowed slice/lane only when recurring pickup is allowed.

Automation may execute only an issue that matches all relevant criteria:

```text
state = Todo, or top unblocked matching Backlog item when no matching Todo exists
expected agent label is present
agent:auto is present for recurring automation pickup
expected title marker is present
issue is not blocked
issue belongs to the current allowed slice/lane
```

Manual-only issues without `agent:auto`, including PL-143 / Slice 6.2, are not
eligible for generic recurring Todo/Backlog selection. They require an exact
human/coordinator target, resolved blockers, and the issue-specific ledger or
handoff authority before execution.

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
