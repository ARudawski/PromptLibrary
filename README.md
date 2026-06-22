# Project Prompt Library

Project Prompt Library is a small ChatGPT Apps / MCP connector for invoking exact, externally maintained prompt workflows from normal ChatGPT conversations using command-style requests such as `@pl grill-me`.

This repository has passed the Slice 0 proof gate, Slice 1 invocation gate, M2 source/cache/validation gates through Slice 2.7, M3 inspect gates through Slice 3.2, and M3 list work through Slice 3.4. The current product implementation is in M3 with no active product slice; the next candidate is PL-78 / Slice 3.5 inspect/list golden tests and tool reference work only after explicit queue selection or promotion.

The Slice 0 premise was:

> ChatGPT can route `@pl proof` into the local connector, receive a hardcoded model-visible prompt, and apply that prompt as behavior.

## Current implementation stage

- Slice -1: minimal repository/workflow bootstrap.
- Slice 0: local hardcoded MCP premise proof, accepted with caveats in the Linear gate evidence referenced by [`docs/slices/slice-1-invocation-walking-skeleton.md`](./docs/slices/slice-1-invocation-walking-skeleton.md).
- Slice 1: fixture-backed invocation walking skeleton, approved with minor issues.
- Slice 2.1: PromptSource boundary and fake source seam, approved.
- Slice 2.2: public GitHub prompt source adapter, approved.
- Slice 2.3: runtime prompt cache with five-minute TTL, approved.
- Slice 2.4: stale-while-revalidate and last-known-good cache behavior, approved.
- Slice 2.5: partial valid cache and cold failure behavior, approved.
- Slice 2.6: local `validate-prompts` script, approved.
- Slice 2.7: source/cache contract and golden tests, approved.
- M2: public source, cache, and validation, complete with non-blocking follow-ups.
- Slice 3.1: inspect use case and projection, approved.
- Slice 3.2: inspect MCP adapter, approved.
- Slice 3.3: list use case and summary projection, approved.
- Slice 3.4: list MCP adapter, approved.

The compact current-state pointer for agents is [`docs/workflows/current-state-ledger.md`](./docs/workflows/current-state-ledger.md). If this README and the ledger disagree, use the ledger and raise a documentation drift finding.

The current local MCP server registers `invoke_prompt_library_command`, `inspect_prompt_library_command`, and `list_prompt_library_commands` against local fixture prompt files through the PromptSource boundary. M2 added the public GitHub source adapter, runtime prompt cache TTL behavior, stale refresh and last-known-good preservation, partial-valid/cold-failure behavior, a real local `validate-prompts` script, and source/cache contract and golden coverage. M3 Slice 3.1/3.2 added active prompt inspection through core and MCP adapter layers. M3 Slice 3.3 added framework-independent active command listing through `ListPromptsUseCase` and summary projection. M3 Slice 3.4 exposed active command listing through the MCP adapter. Slice 3.5 inspect/list golden tests and tool-reference coverage, real prompt files, hosted deployment, private suites, auth, and DB behavior are not implemented yet.

## Core V1 boundaries

V1 is retrieval-focused. It must not become a prompt editor, workflow engine, semantic router, prompt marketplace, private prompt suite, admin console, or cache-management UI.

Approved ChatGPT-facing tools for V1:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

There is deliberately no ChatGPT-facing cache refresh tool and no draft-management API.

## Documentation

Start here:

- [`AGENTS.md`](./AGENTS.md) — repository-level instructions for Codex agents.
- [`docs/workflows/current-state-ledger.md`](./docs/workflows/current-state-ledger.md) — current phase, queue, and caveat ledger.
- [`docs/agents/README.md`](./docs/agents/README.md) — role-specific Coding, Review, QA, and Coordinator agent specs.
- [`docs/idea-handoff.md`](./docs/idea-handoff.md) — original product handoff.
- [`docs/architecture/project-prompt-library-architecture-plan.md`](./docs/architecture/project-prompt-library-architecture-plan.md) — approved architecture plan.
- [`docs/roadmap/project-prompt-library-roadmap.md`](./docs/roadmap/project-prompt-library-roadmap.md) — implementation roadmap.
- [`docs/standards/project-prompt-library-codex-agent-standards.md`](./docs/standards/project-prompt-library-codex-agent-standards.md) — detailed architecture and code standards.
- [`docs/qa/test-strategy.md`](./docs/qa/test-strategy.md) — QA strategy.
- [`docs/qa/ci-evidence.md`](./docs/qa/ci-evidence.md) — CI/check evidence convention.
- [`docs/slice-0-proof.md`](./docs/slice-0-proof.md) — Slice 0 proof checklist and result log template.

## Local development status

The TypeScript/Node implementation currently supports deterministic local fixture invocation, the Slice 2.1 source boundary, the Slice 2.2 public GitHub source adapter behind that boundary, Slice 2.3 cache TTL behavior, Slice 2.4 stale/LKG behavior, Slice 2.5 partial-valid/cold-failure behavior, Slice 2.6 local prompt validation, Slice 2.7 source/cache contract and golden coverage, M3 inspect behavior through Slice 3.2, and M3 list behavior through Slice 3.4.

## CI quality gate

Pull requests and pushes to `main` run `.github/workflows/ci.yml` on Node 22 using the repository lockfile with `npm ci`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test`, and `npm run validate-prompts`.

This is the deterministic default gate only. Live GitHub prompt-source checks, ChatGPT/tunnel checks, hosted endpoint checks, and deployment readiness smoke tests remain outside default CI.

## Non-goals for the current phase

Do not add during the current M3 queue-selection phase:

- ChatGPT-facing cache refresh, cache diagnostics, or admin tools;
- real prompt files;
- Slice 3.5 inspect/list golden tests and tool-reference expansion unless PL-78 / Slice 3.5 is explicitly selected through the normal queue;
- hosted deployment;
- private-suite/auth/database design.

Those belong to later slices after explicit coordinator or human selection.
