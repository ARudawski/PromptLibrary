# Project Prompt Library

Project Prompt Library is a small ChatGPT Apps / MCP connector for invoking exact, externally maintained prompt workflows from normal ChatGPT conversations using command-style requests such as `@pl grill-me`.

This repository has passed the Slice 0 proof gate, Slice 1 invocation gate, M2 source/cache/validation gates through Slice 2.7, M3 read-only API completion/readiness through PL-80 after PL-79 QA, and M4 local MVP completion/readiness through PL-111 after PL-110 QA. The next allowed product lane is Slice 5.1 personal-use trial planning only.

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
- Slice 3.5: inspect/list golden tests and tool reference, approved.
- M3: read-only API, complete with non-blocking follow-ups through PL-80 after PL-79 QA.
- Slice 4.1: prompt authoring baseline and metadata conventions, approved.
- Slice 4.1b: local runtime source alignment with real prompt files, approved.
- Slice 4.2: active `handoff` MVP prompt, approved.
- Slice 4.3: active `grill-me` MVP prompt, approved.
- Slice 4.4: active `spec-prompt-creator` MVP prompt, approved.
- Slice 4.5: real-prompt validation, golden tests, and local MVP walkthrough, approved.
- M4: local MVP, complete through PL-111 after PL-110 QA.

The compact current-state pointer for agents is [`docs/workflows/current-state-ledger.md`](./docs/workflows/current-state-ledger.md). If this README and the ledger disagree, use the ledger and raise a documentation drift finding.

The current local MCP server registers `invoke_prompt_library_command`, `inspect_prompt_library_command`, and `list_prompt_library_commands` against local `prompts/*.md` files through the PromptSource boundary. M2 added the public GitHub source adapter, runtime prompt cache TTL behavior, stale refresh and last-known-good preservation, partial-valid/cold-failure behavior, a real local `validate-prompts` script, and source/cache contract and golden coverage. M3 added active prompt inspection, command listing, inspect/list golden coverage, and tool-reference coverage. M4 added the three approved active local MVP prompts: `handoff`, `grill-me`, and `spec-prompt-creator`, plus coherent local MVP contract/golden coverage and the local walkthrough. M5.1 personal-use trial planning is the next allowed lane; hosted deployment, private suites, auth/OAuth, DB behavior, and broader runtime work are not implemented yet.

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
- [`docs/qa/static-analysis.md`](./docs/qa/static-analysis.md) — SonarQube Cloud advisory setup and first-scan triage.
- [`docs/slice-0-proof.md`](./docs/slice-0-proof.md) — Slice 0 proof checklist and result log template.
- [`docs/local-mvp-walkthrough.md`](./docs/local-mvp-walkthrough.md) — local walkthrough for validating the three-prompt M4 MVP.
- [`docs/trials/m5-personal-use-trial-protocol.md`](./docs/trials/m5-personal-use-trial-protocol.md) - M5 personal-use trial protocol.
- [`docs/trials/m5-personal-use-trial-log.md`](./docs/trials/m5-personal-use-trial-log.md) - M5 personal-use trial evidence log template.

## Local development status

The TypeScript/Node implementation currently supports local runtime loading from `prompts/*.md`, deterministic fixture-backed tests, the Slice 2.1 source boundary, the Slice 2.2 public GitHub source adapter behind that boundary, Slice 2.3 cache TTL behavior, Slice 2.4 stale/LKG behavior, Slice 2.5 partial-valid/cold-failure behavior, Slice 2.6 local prompt validation, Slice 2.7 source/cache contract and golden coverage, M3 inspect/list behavior and read-only API golden/tool-reference coverage, and the three active local M4 MVP prompts: `handoff`, `grill-me`, and `spec-prompt-creator`. PL-111 accepted M4 as complete after PL-110 QA approved the local MVP behavior.

## CI quality gate

Pull requests and pushes to `main` run `.github/workflows/ci.yml` on Node 22 using the repository lockfile with `npm ci`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test`, and `npm run validate-prompts`.

This is the deterministic default gate only. Live GitHub prompt-source checks, ChatGPT/tunnel checks, hosted endpoint checks, and deployment readiness smoke tests remain outside default CI.

## Non-goals for the current phase

Do not add outside the current Slice 5.1 personal-use trial planning lane:

- ChatGPT-facing cache refresh, cache diagnostics, or admin tools;
- real prompt files beyond the approved three-prompt M4 MVP set;
- additional inspect/list scope beyond the completed PL-78 / Slice 3.5 read-only API coverage;
- hosted deployment;
- private-suite/auth/database design;
- prompt editing, draft management in ChatGPT, semantic routing, or workflow/session state management.

Those belong to later slices after explicit coordinator or human selection.
