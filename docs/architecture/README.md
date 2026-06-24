# Architecture Notes

This directory will hold the full architecture plan and ADRs.

## Current accepted architecture summary

Project Prompt Library is a small TypeScript/Node ChatGPT Apps / MCP connector.

The V1 product is retrieval-focused:

- explicit command-style invocation, targeting `@pl <command>`;
- tool-only app, no UI widget in V1;
- public command suite;
- public GitHub as canonical prompt source after Slice 2;
- Markdown prompt files with YAML frontmatter;
- no database in V1;
- no private prompt suites in V1;
- thin MCP adapter over framework-independent core;
- runtime cache with 5-minute TTL, stale-while-revalidate / last-known-good behavior, partial-valid/cold-failure behavior, local validation tooling, and source/cache contract/golden coverage through M2;
- inspect use case/projection and MCP adapter behavior through M3 Slice 3.2;
- list use case, summary projection, and MCP adapter behavior through M3 Slice 3.4;
- inspect/list golden tests and tool-reference coverage through Slice 3.5.
- prompt authoring baseline, local runtime source alignment, three active local MVP prompt files (`handoff`, `grill-me`, and `spec-prompt-creator`), real-prompt validation, local MVP golden/contract coverage, and local walkthrough through M4.

## Hard boundary

The connector retrieves prompt definitions. The prompt text defines behavior. The connector does not execute workflows, manage conversation state, or decide when a prompt should be used.

## Proof-first rule

Before implementing the real architecture, Slice 0 must validate that ChatGPT can route `@pl proof` into a local MCP tool and apply the returned hardcoded prompt.

Slice 0 was accepted with caveats through recorded Linear gate evidence, Slice 1 fixture-backed invocation has been approved as the baseline, M2 has been approved through Slice 2.7, M3 read-only API completion/readiness was accepted through PL-80 after PL-79 QA, and M4 local MVP completion/readiness was accepted through PL-111 after PL-110 QA. M5.1 personal-use trial planning is complete through PL-121 / PR #67, and M5.QA.1 approved the protocol through PL-122. PL-123 / M5.2 personal-use trial evidence recording is the next allowed lane after the PL-130 State Checkpoint is durable. Hosted deployment, private suites, auth, DB behavior, additional real prompt files beyond the approved three-prompt M4 MVP set, and broader runtime behavior remain later-slice work until explicitly approved.

## Future full document

The generated full architecture plan should be stored here as:

```text
project-prompt-library-architecture-plan.md
```
