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
- runtime cache with 5-minute TTL, stale-while-revalidate / last-known-good behavior, partial-valid/cold-failure behavior, local validation tooling, and source/cache contract/golden coverage through M2.

## Hard boundary

The connector retrieves prompt definitions. The prompt text defines behavior. The connector does not execute workflows, manage conversation state, or decide when a prompt should be used.

## Proof-first rule

Before implementing the real architecture, Slice 0 must validate that ChatGPT can route `@pl proof` into a local MCP tool and apply the returned hardcoded prompt.

Slice 0 was accepted with caveats through recorded Linear gate evidence, Slice 1 fixture-backed invocation has been approved as the baseline, and M2 has been approved through Slice 2.7: `PromptSource`, public GitHub source adapter infrastructure, runtime cache TTL, stale/LKG cache behavior, partial-valid/cold-failure behavior, local `validate-prompts`, and source/cache contract/golden coverage. Inspect/list implementation, real prompt files, hosted deployment, private suites, auth, and DB behavior remain later-slice work until explicitly approved.

## Future full document

The generated full architecture plan should be stored here as:

```text
project-prompt-library-architecture-plan.md
```
