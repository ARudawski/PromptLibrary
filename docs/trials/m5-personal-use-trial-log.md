# M5 Personal-Use Trial Log

Status: evidence recorded in Linear and summarized by PL-124
Protocol: [`m5-personal-use-trial-protocol.md`](m5-personal-use-trial-protocol.md)
Scope: evidence log for the M5 personal-use trial after M5.QA.1 approval

PL-123 recorded the M5.2 trial evidence in Linear comments instead of this repo
log. PL-124 summarized and classified the accepted evidence in
[`m5-trial-findings.md`](m5-trial-findings.md). Do not add fabricated evidence
or copy private transcript details into this file.

## Trial Summary

| Field | Value |
|---|---|
| Trial status | Complete; accepted via PL-123 |
| Trial start | 2026-06-24 |
| Trial end | 2026-06-24 |
| Trial runner | Human/coordinator-supported trial |
| Trial surface | Local MCP sanity plus ChatGPT app/connector trial evidence |
| Repository branch | `main` |
| Repository commit | `137c9102b78afcc12e43f80e0e363665b7229cf4` |
| Work sessions completed | At least 5 recorded PL-123 work-session ids |
| Local validation result | Passed; 3 files valid and active |
| Overall verdict | Sufficient for M5.3 triage |

## Minimum Usage Tracker

| Prompt | Required command | Minimum target | Completed uses | Substitute/skipped uses | Substitute/skip reason | Status |
|---|---|---:|---:|---:|---|---|
| Handoff | `handoff` | 2 | 2 | 0 | Not applicable | Complete |
| Grill Me | `grill-me` | 2 | 2 | 0 | Not applicable | Complete |
| Spec & Prompt Creator | `spec-prompt-creator` | 2 | 2 | 0 | Not applicable | Complete |

Allowed substitute: record at least 1 real use per prompt plus a reason why
additional use was not useful, not available, or not safe during the trial
window.

## Work Session Tracker

Use one session id for each distinct work session. PL-123 recorded the raw
session evidence in Linear comments; this repo log preserves the accepted
summary only.

| Work session id | Date/time and timezone | Real work context | Trial entries | Repository commit | Notes |
|---|---|---|---|---|---|
| WS-001 | 2026-06-24 | Initial handoff/proof-surface friction plus local baseline evidence | M5-TRIAL-001 and setup comments | `137c9102b78afcc12e43f80e0e363665b7229cf4` final baseline | Old proof-only surface did not count as a successful use; later resolved. |
| WS-002..WS-005 | 2026-06-24 | Accepted real work uses across the three approved prompts | M5-TRIAL-002 through M5-TRIAL-006 | `137c9102b78afcc12e43f80e0e363665b7229cf4` | See PL-123 comments and `m5-trial-findings.md`. |

## Local Validation Record

Complete this before the first trial use.

| Check | Result | Evidence |
|---|---|---|
| `git status --short --branch` | Passed | `## main...origin/main`; no dirty files shown in PL-123 evidence. |
| `git rev-parse HEAD` | Passed | `137c9102b78afcc12e43f80e0e363665b7229cf4`. |
| `npm run validate-prompts` | Passed | `files: 3`, `valid: 3`, `active: 3`, `drafts: 0`, `statusless: 0`. |
| Local MCP walkthrough server start | Passed | Local MCP sanity comment recorded `npm.cmd run dev` plus `StdioClientTransport`. |
| `invoke_prompt_library_command` sanity check | Passed | `handoff`, `grill-me`, `grill`, `spec-prompt-creator`, `spec-creator`, and `prompt-creator` resolved. |
| `inspect_prompt_library_command` sanity check | Passed | Inspection returned active prompt metadata with `no_prompt_invoked: true`. |
| `list_prompt_library_commands` sanity check | Passed | Listed `grill-me`, `handoff`, and `spec-prompt-creator`; aliases were metadata. |

## Trial Entries

Raw trial entries are stored in Linear comments on PL-123. The accepted summary
is:

| Entry | Prompt | Command or alias | Verdict | Usefulness | Friction | Follow-up |
|---|---|---|---|---:|---:|---|
| M5-TRIAL-001 | `handoff` intended | stale proof-only surface | Hold/fail for that surface | N/A | N/A | Resolved by PL-132; no new issue. |
| Handoff smoke | `handoff` | `handoff` | Pass | 4/5 inferred | 1/5 inferred | None |
| M5-TRIAL-004 | `handoff` | `handoff` | Pass | 5/5 inferred | 2/5 inferred | None |
| M5-TRIAL-002 | `grill-me` | `grill` | Pass | 5/5 inferred | 1/5 inferred | None |
| M5-TRIAL-005 | `grill-me` | `grill` | Pass | 4/5 inferred | 1/5 inferred | None |
| M5-TRIAL-003 | `spec-prompt-creator` | `spec-creator` | Pass | 5/5 inferred | 2/5 inferred | None |
| M5-TRIAL-006 | `spec-prompt-creator` | `prompt-creator` | Pass | 5/5 inferred | 1/5 inferred | None |

## Prompt-Level Findings

Use this section during M5.2 and M5.3 to summarize patterns. Do not complete it
from expectation alone.

| Prompt | Useful outcomes | Friction/failures | Follow-up issue links | Triage status |
|---|---|---|---|---|
| `handoff` | Produced useful handoff artifacts in real work contexts. | One accepted artifact omitted a raw tool-call block; old proof-only surface failed before PL-132. | None | Triaged; no fix |
| `grill-me` | Supported one-question-at-a-time clarification and stopped on request. | No material current friction. | None | Triaged; no fix |
| `spec-prompt-creator` | Produced scoped specs and coding-agent prompts from rough requests. | No material current friction. | None | Triaged; no fix |

## Follow-Up Issue Register

| Issue | Trial entry | Finding type | Why it matters | Status |
|---|---|---|---|---|
| None | PL-123 accepted evidence window | No evidence-backed fix needed | Current findings do not justify M5.4 hardening | Closed by PL-124 |

## Final Trial Verdict

Complete this only after the trial window closes.

Verdict:

```text
Pass for M5.3 triage with evidence caveats carried forward.
```

Rationale:

```text
The accepted evidence satisfies the usage minimum and shows high usefulness with
low friction. Caveats are documented in `m5-trial-findings.md`.
```

Recommended next action:

```text
Proceed to PL-127 / M5.QA readiness audit after PL-124 review and closeout,
unless review identifies a material evidence-backed hardening need.
```

## Documentation Change Log

Use this section in the M5.2 report.

```text
Documentation change log:
- Updated: this log with the accepted PL-123 summary and a link to
  `m5-trial-findings.md`.
- Verified unchanged: prompt files, aliases, runtime code, tool schemas, and
  tool metadata.
- Intentionally not updated: raw transcript evidence is kept in Linear comments
  instead of being copied wholesale into the repo.
- Follow-up docs needed: PL-127 should audit trial docs and current-state docs.
```
