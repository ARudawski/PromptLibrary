# Project Documentation

This directory contains architecture, roadmap, standards, and proof documentation for Project Prompt Library.

Start with:

1. `../AGENTS.md`
2. `architecture/README.md`
3. `roadmap/README.md`
4. `standards/README.md`
5. `slice-0-proof.md`

Slice implementation baselines:

- `slices/slice-1-invocation-walking-skeleton.md`

Authoritative Slice 1 contract docs:

- `invocation-contract.md`
- `prompt-schema.md`

The repository has passed the Slice 0 proof gate, Slice 1 invocation gate, and Slice 2.1 source-boundary gate through recorded Linear evidence and is currently implementing Slice 2.2: the public GitHub prompt source adapter.

Current Slice 2.2 source-boundary reference:

- `../src/prompt-source/README.md`

Do not treat runtime cache, inspect/list, real prompt, or hosted behavior as implemented code. The public GitHub source adapter is infrastructure only until a later slice wires cache/runtime behavior.
