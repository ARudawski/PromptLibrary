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

Slice 0 was accepted with caveats through recorded Linear gate evidence, Slice 1 fixture-backed invocation has been approved as the implementation baseline, M2 has been approved through Slice 2.7, M3 inspect work has been approved through Slice 3.2, M3 list work has been approved through Slice 3.4, and Slice 3.5 inspect/list golden tests and tool reference work has been approved through PL-78 / PR #45. PL-79 QA and PL-80 Coordinator completion/readiness gates remain explicit before any later product lane.

## Current focus

This repository currently supports Slice 1 fixture-backed invocation, M2 source/cache/validation behavior, M3 inspect behavior through the core use case/projection and MCP adapter, M3 list behavior through the core use case/projection and MCP adapter, and Slice 3.5 read-only API golden/tool-reference coverage. Real prompt files, hosted deployment, private suites, auth, and DB behavior are still later-slice work.

## Future full document

The generated full implementation roadmap should be stored here as:

```text
project-prompt-library-roadmap.md
```
