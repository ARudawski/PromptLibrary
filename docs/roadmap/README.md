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

M3 / the read-only API is complete. The next allowed product lane is **Slice 4.1 — prompt authoring baseline and metadata conventions**.

Use the M4 plan before creating or executing real-prompt work:

```text
project-prompt-library-m4-plan.md
```

Do not add real prompt files, runtime-source changes, hosted deployment, private suites, auth/OAuth, DB behavior, or broader Slice 4 runtime work without an explicit issue and coordinator path.

## Roadmap documents

- [`project-prompt-library-roadmap.md`](project-prompt-library-roadmap.md) — full implementation roadmap.
- [`project-prompt-library-m4-plan.md`](project-prompt-library-m4-plan.md) — M4 local-MVP planning and task outlines.

## Hard gates

If Slice 0 fails, do not proceed to parser/cache/GitHub implementation.

Before M4 real prompt files:
- Slice 4.1 authoring baseline must be approved.
- Runtime loading must be checked; if the local server is still fixture-backed, use the M4.1b task before claiming a local MVP.

Before hosted deployment:
- M4 local MVP must be accepted.
- M5 personal-use trial must justify hosting.
