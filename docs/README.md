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

The repository has passed the Slice 0 proof gate, Slice 1 invocation gate, Slice 2.1 source-boundary gate, and Slice 2.2 public GitHub source gate through recorded Linear evidence and is currently implementing Slice 2.3: runtime cache with TTL.

Current Slice 2.3 source/cache references:

- `../src/prompt-source/README.md`
- `../src/cache/README.md`

Do not treat stale-while-revalidate, last-known-good preservation, partial-valid/cold-failure cache policy, inspect/list, real prompt, or hosted behavior as implemented code. The public GitHub source adapter and TTL cache are infrastructure only until later slices wire broader runtime behavior.
