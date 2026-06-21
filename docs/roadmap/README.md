# Roadmap Notes

This directory will hold the implementation roadmap.

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

## Hard gate

If Slice 0 fails, do not proceed to parser/cache/GitHub implementation.

Slice 0 was accepted with caveats through recorded Linear gate evidence, Slice 1 fixture-backed invocation has been approved as the implementation baseline, and M2 has been approved through Slice 2.7. The next product lane is M3 / Slice 3.1 inspect/list work, but only after an explicit issue is created, promoted, or targeted by coordinator/human workflow.

## Current focus

This repository currently supports Slice 1 fixture-backed invocation plus M2 source/cache/validation behavior: the `PromptSource` boundary, public GitHub source adapter infrastructure, runtime cache TTL, stale-while-revalidate and last-known-good preservation, partial-valid/cold-failure behavior, local `validate-prompts`, and source/cache contract/golden coverage. Inspect/list implementation, real prompt files, hosted deployment, private suites, auth, and DB behavior are still later-slice work.

## Future full document

The generated full implementation roadmap should be stored here as:

```text
project-prompt-library-roadmap.md
```
