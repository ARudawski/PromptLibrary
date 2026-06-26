# Roadmap Notes

This directory holds the implementation roadmap and milestone planning artifacts.

## Current roadmap sequence

Implementation is premise-first and invocation-first:

```text
Slice -1: Minimal repository/workflow bootstrap
Slice 0: Local hardcoded MCP premise proof
Slice 1: Fixture-backed invocation walking skeleton
Slice 2: Public GitHub prompt source and cache/index behavior
Slice 3: Inspect/list tools
Slice 4: Local MVP with three real prompts
Slice 5: Personal-use trial
Slice 6: Hosted deployment, only after local MVP proves useful
```

## Current focus

M5 / the personal-use trial is complete after PL-128 accepted M6 readiness
following PL-127 QA. Detailed current phase, active lane, next lane, queue
exposure, and caveats live in
[`../workflows/current-state-ledger.md`](../workflows/current-state-ledger.md).
Use the ledger, not this index, to decide which M6 planning issue or gate is
executable.

Use the M5 plan for historical M5 closeout context:

```text
project-prompt-library-m5-plan.md
```

M5.1 trial documents:

```text
../trials/m5-personal-use-trial-protocol.md
../trials/m5-personal-use-trial-log.md
../trials/m5-trial-findings.md
```

Use the full roadmap's M6 section before creating or executing hosted
deployment planning work. Do not start hosted deployment implementation,
private suites, auth/OAuth, DB behavior, additional real prompt files, prompt
or alias changes, tool metadata changes, or broader runtime work without an
explicit issue and coordinator path.

## Roadmap documents

- [`project-prompt-library-roadmap.md`](project-prompt-library-roadmap.md) — full implementation roadmap.
- [`project-prompt-library-m4-plan.md`](project-prompt-library-m4-plan.md) — M4 local-MVP planning and task outlines.
- [`project-prompt-library-m5-plan.md`](project-prompt-library-m5-plan.md) — M5 personal-use trial planning and task outlines.

## Hard gates

If Slice 0 fails, do not proceed to parser/cache/GitHub implementation.

Before M4 real prompt files:
- Slice 4.1 authoring baseline was approved.
- Runtime loading was aligned through M4.1b before the local MVP was accepted.

Before M5 implementation beyond planning:
- M5.1 personal-use trial planning defined the protocol and results log through PL-121 / PR #67.
- M5.QA.1 approved the protocol through PL-122 before trial execution.
- M5.2 trial execution and evidence recording followed the approved protocol.
  Use the current-state ledger for current M5 lane exposure and conditional
  M5.4/M5.5/M5.QA/M5.Gate routing.
- All M5 agents must include documentation scope, documentation acceptance, and a documentation change log in their reports.

Before hosted deployment:
- M4 local MVP must be accepted.
- M5 personal-use trial must justify hosting; PL-128 accepted M6 hosted
  deployment planning readiness.
- Hosted implementation still requires explicit M6 issues, review, QA, and
  release/readiness evidence in roadmap order.
