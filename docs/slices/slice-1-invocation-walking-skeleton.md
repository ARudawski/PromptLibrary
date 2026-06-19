# Slice 1 - Fixture-Backed Invocation Walking Skeleton

Status: implementation baseline for ALJ-14 and later Slice 1 work

Source handoff:

- ALJ-28, Slice 1 GitHub documentation baseline
- ALJ-13, Slice 1 design report and accepted review amendment
- `docs/architecture/project-prompt-library-architecture-plan.md`
- `docs/roadmap/project-prompt-library-roadmap.md`
- `docs/standards/project-prompt-library-codex-agent-standards.md`
- `docs/qa/test-strategy.md`

## Slice 0 Gate Evidence

Slice 1 work is allowed only because Slice 0 was accepted through recorded
Linear gate evidence.

The repository-local `docs/slice-0-proof.md` still reads as a checklist and
template. It is not the final proof evidence record at the time this baseline
was written. ALJ-14 and later agents must treat the following Linear records as
the current Slice 0 gate evidence unless a newer GitHub document or coordinator
decision supersedes them:

- [ALJ-12](https://linear.app/aljoscha-rudawski/issue/ALJ-12/004-slice-0-human-gate-run-manual-pl-proof-validation):
  human manual proof result recorded as PASS WITH CAVEATS. It records an
  explicit invocation sanity check, three passing cooperative fresh-chat
  command-style proof runs when counting Run 4 as the replacement for failed Run
  2, and the connector-name / blocked-call caveats.
- [ALJ-10](https://linear.app/aljoscha-rudawski/issue/ALJ-10/005-slice-0-qa-agent-validate-pl-proof-premise):
  QA verdict recorded as PASS WITH MINOR ISSUES after reviewing the ALJ-12
  evidence.
- [ALJ-11](https://linear.app/aljoscha-rudawski/issue/ALJ-11/006-slice-0-humancoordinator-gate-decide-proceed-or-stop):
  Human/Coordinator decision recorded as proceed to Slice 1, carrying forward
  formatting/lint, outputSchema, and connector-name caveats.
- [ALJ-26](https://linear.app/aljoscha-rudawski/issue/ALJ-26/005a-slice-0-qacoordinator-gate-review-validation-evidence-and-approve):
  explicit process-correction gate recorded as approved with caveats.

If these Linear records are unavailable, are contradicted by a newer coordinator
decision, or are revised to a non-passing outcome, stop before parser, schema,
cache, GitHub source, or real prompt implementation. This baseline does not
bypass the Slice 0 hard gate.

## Goal

Build the first real `invoke_prompt_library_command` path from local fixture
prompt definitions to MCP-native responses.

Slice 1 proves the deterministic invocation contract without GitHub source,
runtime cache refresh, real prompt files, inspect/list tools, or hosted
deployment.

## Scope

Included:

- domain types for prompt metadata, lifecycle, input mode, status, errors, and
  use-case results;
- local fixture prompt source only;
- Markdown/frontmatter parsing;
- single-prompt and collection validation;
- active command index by slug and alias;
- invocation projection that returns only `title`, `lifecycle`, `input_mode`,
  and `prompt_body`;
- `InvokePromptUseCase`;
- MCP adapter for `invoke_prompt_library_command`;
- output schemas for tool `structuredContent`;
- deterministic unit, contract, and golden tests;
- documentation for the invocation contract and known Slice 1 limitations.

## Non-Goals

Excluded from Slice 1:

- public GitHub prompt source;
- runtime cache TTL, stale-while-revalidate, or last-known-good behavior;
- real MVP prompt files;
- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- prompt editing, draft management, admin/debug/cache tools, auth, user
  accounts, private suites, database storage, UI widgets, semantic routing,
  workflow execution, or conversation/session state;
- raw `@pl` chat parsing inside connector logic.

GitHub source and cache start in Slice 2. Inspect/list tools start in Slice 3.
Real prompts start in Slice 4.

## Module Boundaries

| Area | Owns | Must not do |
|---|---|---|
| `src/mcp/` | tool registration, input/output schemas, mapping use-case results to MCP `structuredContent` and `content` | parse Markdown, fetch prompt files, resolve aliases directly, import business rules |
| `src/application/` | use-case orchestration and typed success/failure results | import MCP SDK types, parse raw chat text, perform network calls |
| `src/domain/` | pure types, enums, result shapes, and domain errors | import infrastructure, MCP SDK, filesystem, or network code |
| `src/prompt-source/` | load raw local fixture prompt files | validate prompts, decide invokability, format MCP responses |
| `src/prompt-parser/` | parse Markdown/frontmatter and preserve prompt body | resolve aliases, access network, mutate index/cache |
| `src/validation/` | validate prompt metadata/body and collection conflicts | fetch files or format MCP responses |
| `src/cache/` | Slice 1 derived active command index only | implement TTL, refresh, or last-known-good cache behavior |
| `src/projection/` | create reduced invocation payloads | expose operational metadata |
| `src/suggestions/` | non-executing active-command suggestions | execute or auto-select prompts |

## Implementation Order

1. ALJ-14: restore the deterministic quality gate and prove the outputSchema
   strategy before functional Slice 1 work expands.
2. ALJ-15: add domain model and fixture harness.
3. ALJ-16: implement Markdown/frontmatter parsing and single-prompt validation.
4. ALJ-17: implement collection validation, active index, invocation
   projection, and invoke use case.
5. ALJ-18: expose the fixture-backed invoke path through the MCP adapter.
6. ALJ-27: add deterministic GitHub Actions quality gate after the invoke
   adapter exists.
7. ALJ-19: document the invocation contract and prompt schema draft.
8. ALJ-20: run QA audit for fixture-backed invocation.
9. ALJ-21 and ALJ-22: complete QA Coordinator and Human/Coordinator approval
   before proceeding beyond Slice 1.

Each implementation branch should start from current `main`, keep changes scoped
to its issue, and move Linear to `In Review` after the agent report. The review
agent owns the final close.

## OutputSchema Strategy

Successful invocation `structuredContent` must be exactly the reduced invocation
payload:

```json
{
  "title": "Grill Me",
  "lifecycle": "interactive_workflow",
  "input_mode": "either",
  "prompt_body": "..."
}
```

Do not add success wrapper fields such as `ok`, `type`, or `payload`.

Failure responses may use a distinct fail-closed shape:

```json
{
  "no_prompt_invoked": true,
  "error_code": "PROMPT_NOT_FOUND",
  "message": "No active prompt matched the requested command.",
  "suggestions": []
}
```

Failure responses must not include `prompt_body`. Suggestions, when present,
must be non-executing.

The MCP `outputSchema` must describe the actual `structuredContent` shape. If
the SDK cannot cleanly model both the success and failure shapes without adding
success wrapper metadata, stop for a technical spike or architecture
clarification before hardening the contract.

ALJ-14 technical preflight result: the current MCP SDK accepts a strict Zod
object `outputSchema` for the unwrapped success `structuredContent` payload. The
registered server publishes that schema through `listTools`, and SDK tool calls
validate successful non-`isError` results against it. The current SDK skips
output validation for `isError` tool results, so Slice 1 failure-shape hardening
must either model ordinary domain failures as non-`isError` structured results
that fit an approved schema, or stop for a small technical spike if the SDK
cannot model success and failure cleanly without success wrapper metadata.

Note: the accepted ALJ-13 review amendment supersedes earlier wrapper-style
success examples. Future standards cleanup may remove those stale examples, but
Slice 1 agents should follow the shape above.

## Fixture Plan

Use local fixture files only:

- `test/fixtures/prompts-valid/active-basic.md`
- `test/fixtures/prompts-valid/active-with-alias.md`
- `test/fixtures/prompts-valid/draft-valid.md`
- `test/fixtures/prompts-invalid/missing-required-field.md`
- `test/fixtures/prompts-invalid/malformed-frontmatter.md`
- `test/fixtures/prompts-invalid/empty-body.md`
- `test/fixtures/prompts-conflicts/duplicate-slug-a.md`
- `test/fixtures/prompts-conflicts/duplicate-slug-b.md`
- `test/fixtures/prompts-conflicts/alias-slug-conflict-a.md`
- `test/fixtures/prompts-conflicts/alias-slug-conflict-b.md`
- `test/fixtures/prompts-conflicts/duplicate-alias-a.md`
- `test/fixtures/prompts-conflicts/duplicate-alias-b.md`

Unknown-command and suggestion tests can use a valid fixture set plus a missing
command string.

## Test Expectations

Use deterministic tests only. Unit, contract, and golden tests must not hit
GitHub, ChatGPT, a tunnel, a hosted endpoint, or the internet.

Unit tests should cover:

- Markdown/frontmatter parsing;
- exact prompt body preservation;
- required metadata validation;
- lifecycle, input mode, and status enum validation;
- slug and alias format validation;
- empty prompt body rejection;
- duplicate slug detection;
- alias/slug conflict detection;
- duplicate alias detection;
- active-only index construction;
- draft exclusion;
- invocation projection;
- unknown command failure;
- suggestions as non-executing results.

Contract tests should cover:

- approved tool name;
- input schema containing only `command` and optional `attached_input`;
- output schema declaration;
- success response shape;
- failure response shape;
- model-visible `prompt_body`;
- compact visible receipt;
- `_meta` not being required for prompt application.

Golden tests should assert exact payloads and the absence of forbidden
invocation metadata, including `slug`, `aliases`, `description`, `status`,
`hash`, `source_path`, `repo_commit`, `indexed_at`, validation diagnostics,
cache diagnostics, debug markers, prompt versions, and timestamps.

## Slice 0 Caveats Carried Forward

- Formatting and lint gate: ALJ-13 found the local gate needed line-ending /
  formatting restoration before functional Slice 1 implementation expands.
  ALJ-14 owns that preflight.
- Output schema: tools returning `structuredContent` need output schemas; Slice
  1 must prove this through the registered MCP server before treating the invoke
  contract as stable.
- Command UX: Slice 0 proved the platform premise with recorded caveats around
  command-style routing and connector naming in the Linear gate evidence listed
  above. Slice 1 does not re-prove ChatGPT routing behavior.
- Process states: implementation complete, automated tests, manual/platform
  validation, QA review, QA Coordinator review, and coordinator approval remain
  separate states.

## Documentation Expectations

Coding agents should update docs only when their slice changes behavior,
schemas, fixtures, validation rules, or tool contracts.

Do not document future behavior as implemented. In particular, do not claim that
GitHub source/cache, inspect/list tools, or real prompts are available during
Slice 1.

ALJ-19 should add the detailed invocation contract and prompt schema draft after
the fixture-backed MCP adapter exists.

## QA Gates

Manual/human gate for Slice 1: not required.

Reason: Slice 1 is a deterministic local implementation milestone. It can be
verified through typecheck, lint/format, unit tests, contract tests, golden
tests, no-network checks, code review, QA agent audit, and QA Coordinator /
coordinator approval. The ChatGPT platform premise was handled by the recorded
Slice 0 Linear gate evidence above, not by this Slice 1 baseline alone.

Required gates remain:

- implementation review for each PR;
- deterministic checks relevant to the slice;
- QA agent audit after the fixture-backed invocation contract is implemented;
- QA Coordinator review;
- Human/Coordinator approval before Slice 2 source/cache work begins.
