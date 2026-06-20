# Tests

This directory contains the deterministic test assets for Project Prompt Library.

The full QA strategy lives in [`docs/qa/test-strategy.md`](../docs/qa/test-strategy.md). This file explains how the `test/` directory should evolve as implementation slices land.

## Current phase

The repository has passed Slice 1 fixture-backed invocation and Slice 2.1
source-boundary work and is now in Slice 2.2: public GitHub source adapter.

Slice 0 was validated manually through Linear gate evidence. The local
[`docs/slice-0-proof.md`](../docs/slice-0-proof.md) remains the proof checklist
and template because the important Slice 0 behavior was ChatGPT platform behavior:

- can ChatGPT route `@pl proof` into the local connector tool;
- can it receive a hardcoded model-visible prompt;
- can it apply that prompt as behavior;
- can this be reproduced in three cooperative fresh chats.

Automated core tests started in Slice 1 and now include the Slice 2.1 source
boundary, fake source helper, and Slice 2.2 public GitHub source adapter tests.
They must remain deterministic.

## Required deterministic test categories

Eventually this directory should contain:

```text
test/
  fixtures/
    prompts-valid/
    prompts-invalid/
    prompts-conflicts/
  unit/
  contract/
  golden/
```

## Unit tests

Unit tests cover pure deterministic core behavior:

- source boundary, fake source behavior, and public GitHub source adapter behavior with mocked fetch;
- Markdown/frontmatter parsing;
- exact prompt body preservation;
- metadata schema validation;
- lifecycle/input/status enum validation;
- slug and alias format validation;
- duplicate slug detection;
- alias/slug conflict detection;
- duplicate alias detection;
- active-only indexing;
- draft exclusion;
- reduced invocation projection;
- unknown command failure;
- non-executing suggestions;
- cache TTL behavior;
- stale-while-revalidate behavior;
- last-known-good preservation.

Unit tests must not hit GitHub, ChatGPT, a tunnel, or a hosted MCP endpoint.

## Contract tests

Contract tests cover MCP-facing tool shapes without real ChatGPT:

- approved tool names;
- input schemas;
- output schemas;
- success response shapes;
- failure response shapes;
- model-visible `prompt_body` in invocation results;
- compact visible receipt text;
- no `_meta` dependency for model-needed prompt content;
- `no_prompt_invoked: true` on failed invocation-like responses.

## Golden tests

Golden tests freeze exact payload contracts and absence of forbidden keys.

Required golden scenarios:

- valid active prompt invocation;
- alias invocation;
- unknown command with optional suggestion;
- draft prompt not invokable;
- invalid prompt excluded;
- duplicate slug conflict;
- alias conflict;
- inspect success/failure;
- list success/failure;
- no prompt bodies in list output;
- cold cache failure;
- partial valid cache behavior;
- failed refresh preserving last-known-good.

Golden tests must assert that normal invocation payload contains only:

```text
title
lifecycle
input_mode
prompt_body
```

Golden tests must also assert absence of forbidden invocation metadata:

```text
slug
aliases
description
status
hash
source_path
repo_commit
indexed_at
validation diagnostics
cache diagnostics
debug_marker
prompt_version
created_at
updated_at
```

## Fixture strategy

Minimum Slice 1 fixtures:

- one valid active prompt;
- one valid active prompt with alias;
- one draft prompt;
- one invalid prompt missing a required field;
- one invalid prompt with malformed YAML;
- one invalid prompt with empty body;
- one duplicate slug conflict;
- one alias equal to another active prompt slug;
- one duplicate alias conflict;
- one unknown command suggestion case.

Later source/cache fixtures should use fake sources and fake clocks. Default deterministic tests must remain no-network.

The current fake source helper lives at `test/helpers/FakePromptSource.ts`. It
is test-only and must not become a production source implementation.

`test/unit/prompt-source/PublicGitHubPromptSource.test.ts` verifies the public
source adapter with an injected fetch stub. It must not be converted into a live
GitHub smoke test.

## Local commands

The repository already declares these scripts in `package.json`:

```text
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:unit
npm run test:contract
npm run test:golden
npm run validate-prompts
```

Some commands may still be placeholders while their later-slice behavior is not implemented. Agents must report that honestly. Do not pretend green checks happened.

## Slice gates

| Slice / milestone | Required test posture |
|---|---|
| Slice 0 | Manual proof checklist; optional tiny smoke only if cheap |
| Milestone 1 | Unit + contract + golden coverage for invocation path |
| Milestone 2 | Source/cache tests with fake source/fake clock; no-network default gate |
| Milestone 3 | Inspect/list contract and golden tests |
| Milestone 4 | Real MVP prompt validation and golden coverage |
| Milestone 5 | Trial evidence review; not primarily automated |
| Milestone 6 | Hosted smoke checks; not part of default deterministic gate |

## Hard rule

Core tests must not require network access.

Live GitHub, ChatGPT, tunnel, and hosted-endpoint checks belong to explicit smoke/readiness workflows, not unit, contract, or golden tests.
