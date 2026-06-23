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

M4 / the local MVP is complete after PL-111 accepted the gate following PL-110 QA. The next allowed product lane is **Slice 5.1 — personal-use trial protocol and results log**.

Use the M5 plan before creating or executing trial work:

```text
project-prompt-library-m5-plan.md
```

Do not start M5.2, M5.3, M5.4, hosted deployment, private suites, auth/OAuth, DB behavior, additional real prompt files, or broader runtime work without an explicit issue and coordinator path.

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
- M5.1 personal-use trial planning must define the protocol and results log.
- M5.2 trial execution, M5.3 evidence triage, M5.4 hardening, and M5.5 retesting must stay blocked until their predecessor gates pass.
- All M5 agents must include documentation scope, documentation acceptance, and a documentation change log in their reports.

Before hosted deployment:
- M4 local MVP must be accepted.
- M5 personal-use trial must justify hosting.
