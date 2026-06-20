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

Slice 0 was accepted with caveats through recorded Linear gate evidence, and Slice 1 fixture-backed invocation has been approved as the implementation baseline. The current approved work is Slice 2.1: the `PromptSource` boundary and fake source seam.

## Current focus

This repository currently supports Slice 1 fixture-backed invocation plus the initial Slice 2.1 `PromptSource` boundary and fake source seam. Public GitHub source, runtime cache behavior, inspect/list tools, real prompt files, and hosted deployment are still later-slice work.

## Future full document

The generated full implementation roadmap should be stored here as:

```text
project-prompt-library-roadmap.md
```
