# M5 Trial Findings

Status: M5.3 Coordinator triage through PL-124
Source evidence: PL-123 Linear comments, PL-123 Coordinator closeout, and PL-133 State Checkpoint closeout
Scope: classify accepted M5.2 personal-use trial evidence and decide follow-up issue exposure

This document summarizes the accepted PL-123 trial evidence. The raw evidence
record remains the Linear comment history on PL-123. The repo trial log now
links to this summary instead of copying every raw transcript artifact.

## Decision Summary

PL-124 remains relevant after PL-133 because PL-133 made the PL-123 / M5.2
checkpoint durable and exposed M5.3 as the next allowed lane.

The accepted PL-123 evidence is sufficient for M5.3 triage:

- local validation passed at `137c9102b78afcc12e43f80e0e363665b7229cf4`;
- local MCP sanity showed only the three approved V1 tools;
- ChatGPT app/action evidence later showed the current three-tool surface after
  the old proof-only blocker was addressed by PL-132;
- the trial recorded two successful real uses for each approved prompt;
- the inferred overall usefulness was high, about 4.7 out of 5;
- the inferred friction was low, about 1.3 out of 5;
- no prompt wording, alias, routing, local runtime, documentation, or test
  coverage fix is justified by the accepted evidence window.

No new follow-up issues are created by this triage. PL-125 / M5.4 hardening and
PL-126 / M5.5 retest should remain unexposed or be canceled by coordinator
closeout unless review finds a material evidence-backed hardening need. After
PL-124 is reviewed and closed out, the next useful gate is PL-127 / M5.QA
real-use readiness audit.

## Finding Classifications

| ID | Finding | Classification | Evidence | Triage decision |
|---|---|---|---|---|
| M5-F001 | Local prompt validation and local MCP sanity passed for the approved three-prompt MVP. | not worth fixing | PL-123 local baseline and local MCP sanity comments. | No follow-up. This is positive readiness evidence. |
| M5-F002 | The first natural ChatGPT/Codex surface attempt routed through the old proof-only connector and failed with a tunnel 404. | tool description/routing issue; local runtime friction | PL-123 M5-TRIAL-001 and PL-132 blocker comments. | Resolved before PL-123 acceptance by PL-132 and later current-surface evidence. No new issue. |
| M5-F003 | Current ChatGPT app/action settings and `@pl list` later showed the three approved V1 tools and no prompt bodies in list output. | not worth fixing | PL-123 final closeout and setup/list evidence. | No follow-up. This confirms the old proof-only blocker did not remain material. |
| M5-F004 | `handoff` produced useful handoff artifacts in two real contexts. | not worth fixing | PL-123 handoff smoke and final closeout evidence. | No prompt wording, routing, docs, or test issue. |
| M5-F005 | `grill-me` and alias `grill` supported one-question-at-a-time clarification and stopped on request. | not worth fixing | PL-123 M5-TRIAL-002 and M5-TRIAL-005 evidence. | No prompt wording, routing, docs, or test issue. |
| M5-F006 | `spec-prompt-creator`, `spec-creator`, and `prompt-creator` produced scoped specs and coding-agent prompts from rough requests. | not worth fixing | PL-123 M5-TRIAL-003 and M5-TRIAL-006 evidence. | No prompt wording, routing, docs, or test issue. |
| M5-F007 | Several usefulness and friction ratings were coordinator-inferred instead of user-stated numeric ratings. | documentation issue; evidence caveat | PL-123 final closeout and per-entry rating caveats. | Accepted caveat. No follow-up because the transcripts still support the M5.3 usefulness/friction summary. |
| M5-F008 | One accepted `handoff` artifact paste omitted the raw tool-call block. | documentation issue; evidence caveat | PL-123 final closeout caveat for the cookbook handoff entry. | Accepted caveat. No follow-up because the artifact was responsive and the other handoff use had routing evidence. |
| M5-F009 | ChatGPT settings evidence did not include app id, version id/name, tunnel id, or explicit save/refresh status in the final accepted paste. | documentation issue; future milestone | PL-123 final closeout caveat. | No M5.4 issue. Revisit only if M5.QA or hosted-readiness review requires stricter platform setup evidence. |
| M5-F010 | Trial evidence was recorded in Linear comments rather than committed into `docs/trials/m5-personal-use-trial-log.md` during PL-123. | documentation issue | PL-123 and PL-133 closeouts. | Closed by this findings doc and the updated trial-log pointer. No separate docs issue. |

## Follow-Up Issue Decision

Created follow-up issues: none.

Existing conditional issues:

- PL-125 / M5.4 hardening: no current evidence-backed prompt, alias, tool
  metadata, runtime, docs, or test change is justified.
- PL-126 / M5.5 retest after hardening: not needed if PL-125 is skipped.
- PL-127 / M5.QA readiness audit: recommended next gate after PL-124 review and
  closeout.

Do not start M5.4, M5.5, M5.QA, M5.Gate, M6 hosting, prompt changes, alias
changes, runtime/tool metadata changes, extra prompts, private suites, auth,
database work, semantic routing, prompt editing, or workflow/session behavior
from this triage before PL-124 review and closeout.

## Documentation Change Log

Updated:

- `docs/trials/m5-trial-findings.md`
- `docs/trials/m5-personal-use-trial-log.md`
- `README.md`
- `docs/README.md`
- `docs/roadmap/README.md`
- `docs/workflows/current-state-ledger.md`
- `docs/qa/test-strategy.md`
- `docs/roadmap/project-prompt-library-m5-plan.md`
- `docs/trials/m5-personal-use-trial-protocol.md`

Verified unchanged:

- prompt files;
- aliases;
- runtime code;
- MCP tool names and schemas;
- tool metadata;
- hosted/tunnel infrastructure;
- private-suite, auth/OAuth, DB, cache/admin/debug, prompt editing, semantic
  routing, and workflow/session behavior.

Intentionally not updated:

- raw transcript evidence was not copied wholesale from Linear into the repo;
- no prompt bodies, aliases, runtime code, tool metadata, tests, or golden
  fixtures changed because no accepted finding justified those changes.

Follow-up docs needed:

- PL-127 / M5.QA should verify that this findings summary, the trial log
  pointer, the walkthrough, tool reference, prompt docs, and current-state docs
  are sufficient for a readiness recommendation.
