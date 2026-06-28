# Current State Ledger - Project Prompt Library

Status: active workflow ledger
Last updated: 2026-06-28
Update authority: coordinator gate, explicit human workflow update, explicit
workflow-doc issue, or narrow Review Agent State Checkpoint docs amendment under
`docs/agents/review-agent.md`

This ledger is the compact current-state pointer for agents. It records current
routing facts, active blockers, and short checkpoint pointers. Historical
evidence belongs in Linear reports, PR bodies, roadmap/history docs, and git
history instead of long embedded evidence chains here.

## Current State

```text
Last completed product milestone: M5 personal-use trial complete via PL-128 / M5.Gate after PL-127 accepted M5.QA readiness; M4 local MVP via PL-111 remains the product/runtime baseline.
Last completed product gate: M5.Gate accepted via PL-128 with decision `M5 complete - proceed to M6 hosted deployment planning`.
Last completed M6 slice: Slice 6.2 minimal hosted deployment configuration complete via PL-143 / PR #87; Cloudflare Workers Free is proven only through local Worker configuration/build/runtime proof, not live deployment or ChatGPT hosted connection evidence.
Active product slice: none after PL-143 closeout.
Current workflow lane: none exposed after PL-155 dispatcher/ledger simplification closeout. AI Automation Expert remains manual-only and requires an exact human/coordinator target, `gate:manual`, and no `agent:auto`.
Next product lane: none exposed. Hosted smoke, production deployment, ChatGPT hosted verification, private suites, auth/OAuth, DB, and broader hosted behavior require a later explicit issue and coordinator/human path.
Blocked product work after M6.2: actual production deployment, hosted endpoint smoke, ChatGPT hosted connection verification, private suites, auth/OAuth, DB, ChatGPT cache/admin/debug tools, prompt editing, draft management, semantic routing, workflow/session state, additional real prompt files, prompt or alias changes, tool metadata changes, provider abstraction, production observability, paid-hosting selection, and broader runtime behavior remain blocked without explicit later M6 issues and coordinator paths.
```

## State Checkpoint Record

| Checkpoint | Compact evidence pointer | Routing effect |
|---|---|---|
| M5.Gate | PL-128 accepted M5 completion/readiness after PL-127 QA. | M6 hosted deployment planning became eligible only through explicit issues and coordinator/human paths. |
| M6.1 initial provider spike | PL-142 / PR #82 merged at `5169760882e62d59dcb1f857c34f0a0ce93abd49`. | Historical evidence only; prior Render paid recommendation was superseded by the no-paid-hosting constraint. |
| M6.1 no-paid rework | PL-142 / PR #86 merged at `5dd6fee1aaa7f59cae0217b10838527abb3c4b1f`. | Cloudflare Workers Free selected as the first no-paid path to prove; defer-hosting remains the fallback if no-paid proof fails. |
| M6.2 hosted config | PL-143 / PR #87 merged at `d0aa09380f7e4cae3f79dd101c771895cca1dd86`. | Minimal Worker config/build/runtime proof complete; live deployment, hosted smoke, and ChatGPT hosted verification remain blocked. |
| PL-155 workflow simplification | PL-155 / PR #88 review closeout. | Dispatcher/ledger simplification complete after merge; no active product or workflow lane is exposed, and runtime-wrapper simplification requires an explicit follow-up with before/after evidence. |

Older checkpoint and completed-gate evidence remains available in the relevant
Linear issues, PR bodies, roadmap/history docs, and repository git history. Do
not expand this ledger with long historical chains unless that evidence is
currently needed to decide safe routing.

## Active Caveats To Carry Forward

- The approved V1 ChatGPT-facing tools remain exactly
  `invoke_prompt_library_command`, `inspect_prompt_library_command`, and
  `list_prompt_library_commands`; `docs/tool-reference.md` documents them.
- `validate-prompts` is a real local validator for the three approved active
  local MVP prompts: `handoff`, `grill-me`, and `spec-prompt-creator`.
  `test:golden` includes source/cache, inspect/list, and local MVP catalog
  coverage through the accepted slices; later exact-payload behavior still needs
  slice-specific coverage when applicable.
- npm audit caveats must be reported when observed.
- Public GitHub source/cache infrastructure and local prompt runtime behavior
  are approved, but hosted/private/source behavior beyond PL-143 remains
  later-slice work.
- PL-143 / PR #87 proves only local Cloudflare Worker configuration,
  build/runtime, and approved public three-prompt catalog packaging. Live
  deployment, hosted endpoint smoke, ChatGPT hosted connection verification,
  final Origin values, rollback evidence, and broader hosted readiness require
  later explicit M6 issues and coordinator/human paths.
- Dispatcher claim mode remains off until a handoff-consumer proof/adoption
  path is explicitly accepted.
- The AI Automation Expert role is manual-only. A dispatcher/spawner may create
  an AI Automation Expert role thread only for an exact issue explicitly
  targeted by a human or Coordinator Agent whose title/body names the role.
  Generic recurring Todo/Backlog selection must skip it and report
  `agent:auto` exposure as queue drift.
- The active dispatcher runtime artifact is unchanged by this ledger
  compaction. Its current wrapper remains a deployment artifact and should be
  updated or follow-up-routed only with an explicit issue or human/coordinator
  target, recorded before/after runtime evidence, and no implicit `agent:auto`
  exposure.

## Routing Policy Pointers

- Queue selection, expected labels, manual AI Automation Expert routing, live
  claims, terminal markers, State Checkpoint outcomes, repository mutation
  closeout, and compact ledger rules live in `docs/agents/README.md`.
- Dispatcher operating modes, cheap preflight, decision taxonomy, runtime
  deployment contract, policy-source validation, and role-thread reasoning live
  in `docs/agents/dispatcher.md`.
- Role-specific behavior lives in the matching file under `docs/agents/`.
- Do not rewrite this ledger from ordinary coding or QA runs unless the issue
  explicitly asks for workflow documentation changes. Review Agent may update it
  only through the narrow State Checkpoint docs amendment path in
  `docs/agents/review-agent.md`.
