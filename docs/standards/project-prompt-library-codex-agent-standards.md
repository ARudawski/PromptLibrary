# Project Prompt Library — Codex Agent Architecture & Code Standards

Status: Standards v1.0  
Date: 2026-06-18  
Companion document: `project-prompt-library-architecture-plan.md`  
Primary audience: Codex coding agents, Codex prompt generator, QA agents, roadmap planner, architecture reviewer

---

## 1. Purpose

This document defines the architecture and code standards Codex agents must follow when implementing **Project Prompt Library**.

The goal is to make implementation boring, bounded, testable, and hard to misinterpret.

Codex agents should use this document as the repository-level engineering guide. It is intentionally stricter than a normal README because this project is small but drift-sensitive: the failure mode is not only broken code, but subtly wrong prompt invocation behavior.

---

## 2. Research basis and standards sources

This document is based on the project architecture plan and current public guidance for Codex, ChatGPT Apps/MCP, TypeScript, validation, testing, and security.

Relevant external guidance:

- OpenAI Codex best practices recommend planning first for complex work and encoding reusable repository expectations in `AGENTS.md`, including repo layout, run commands, engineering conventions, constraints, and done criteria: <https://developers.openai.com/codex/learn/best-practices>
- OpenAI Codex `AGENTS.md` guidance says Codex reads `AGENTS.md` files before doing work and supports layered repository/project instructions: <https://developers.openai.com/codex/guides/agents-md>
- OpenAI Apps SDK server guidance frames the MCP server as the handler that fetches authoritative data and returns tool results to ChatGPT: <https://developers.openai.com/apps-sdk/build/mcp-server>
- OpenAI Apps SDK reference says tools returning `structuredContent` should declare an `outputSchema`, and tool results use `structuredContent`, `content`, and `_meta`: <https://developers.openai.com/apps-sdk/reference>
- Model Context Protocol TypeScript SDK documents the TypeScript SDK as the official MCP SDK for building servers and tool handlers: <https://github.com/modelcontextprotocol/typescript-sdk>
- TypeScript `strict` mode enables stronger type checking guarantees: <https://www.typescriptlang.org/tsconfig/strict.html>
- Zod provides TypeScript-first runtime schema validation: <https://zod.dev/>
- OWASP input-validation guidance recommends allowlist validation for user-provided fields: <https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html>
- OWASP logging guidance emphasizes purposeful, security-aware logging: <https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html>
- OWASP secrets-management guidance recommends proper handling and isolation of secrets: <https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html>
- Vitest provides a modern TypeScript-friendly test runner with snapshot/golden-style testing support: <https://vitest.dev/>
- Biome and typescript-eslint are acceptable quality tooling paths; do not mix tools casually: <https://biomejs.dev/> and <https://typescript-eslint.io/>

---

## 3. Non-negotiable project boundaries

Codex agents must preserve the following boundaries.

### 3.1 The connector retrieves prompts; it does not run workflows

The connector may:

- resolve commands and aliases;
- load prompt definitions;
- validate prompt files;
- build a runtime lookup cache;
- return model-visible prompt content for invocation;
- return inspection/list data for active prompts.

The connector must not:

- execute prompt workflows externally;
- manage conversation state;
- decide when a prompt is appropriate without explicit user command intent;
- compose multiple prompts;
- perform semantic routing;
- orchestrate coding agents;
- become a prompt editor;
- manage drafts in ChatGPT;
- expose cache/admin controls through ChatGPT.

### 3.2 ChatGPT-facing API is runtime-only

The ChatGPT-facing MCP API exposes only:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

The API must not expose:

```text
refresh_prompt_library_cache
create_prompt
update_prompt
delete_prompt
list_drafts
inspect_draft
validate_repository
admin/cache/debug tools
```

Developer validation and diagnostics belong in local scripts, CI, logs, and tests — not in the ChatGPT textbox.

### 3.3 V1 has no private suites

V1 uses a public command suite.

Do not implement:

- user accounts;
- OAuth;
- private prompt records;
- encrypted DB storage;
- private/public merge order;
- personal spaces;
- team spaces;
- permission checks.

Future private suites are a future architectural pressure only. Preserve seams; do not build the tunnel before there is a door.

---

## 4. Required Codex operating model

Codex agents must follow this workflow for every non-trivial task.

### 4.1 Before editing

1. Read this standards document.
2. Read the architecture plan.
3. Identify the implementation slice.
4. Restate the task scope in one paragraph.
5. Identify explicit non-goals.
6. Identify files/modules expected to change.
7. Identify tests to write or update first.
8. Stop and ask for clarification if the request conflicts with a locked architecture decision.

### 4.2 During implementation

1. Keep changes inside the slice boundary.
2. Prefer the smallest coherent change.
3. Write unit tests first for deterministic core logic.
4. Keep MCP adapter code thin.
5. Do not add dependencies without justification.
6. Do not add UI, DB, auth, refresh tools, draft management, or admin behavior.
7. Do not “improve” the product scope while implementing infrastructure.
8. Do not silently update golden snapshots without explaining the semantic reason.

### 4.3 Before reporting done

Run the deterministic local gate available in the repository, typically:

```bash
npm run typecheck
npm run lint
npm run test
npm run validate-prompts
```

or the equivalent scripts configured by the repo.

The final report must include:

- changed files;
- tests added/updated;
- commands run;
- any commands that failed and why;
- scope intentionally not implemented;
- any architecture concerns discovered.

---

## 5. Repository and module structure

Use the architecture plan’s intended structure unless the repository already has an approved equivalent.

```text
src/
  mcp/
    server.ts
    tools/
      invokePromptLibraryCommandTool.ts
      inspectPromptLibraryCommandTool.ts
      listPromptLibraryCommandsTool.ts
    schemas/
      toolInputSchemas.ts
      toolOutputSchemas.ts

  application/
    InvokePromptUseCase.ts
    InspectPromptUseCase.ts
    ListPromptsUseCase.ts

  domain/
    PromptDefinition.ts
    PromptMetadata.ts
    PromptLifecycle.ts
    InputMode.ts
    PromptStatus.ts
    PromptErrors.ts
    PromptResult.ts

  prompt-source/
    PromptSource.ts
    PublicGitHubPromptSource.ts
    LoadedPromptFile.ts

  prompt-parser/
    parsePromptMarkdown.ts
    frontmatterSchema.ts

  validation/
    validatePromptDefinition.ts
    validatePromptCollection.ts
    ValidationError.ts

  cache/
    PromptCache.ts
    PromptIndex.ts
    StaleWhileRevalidateCache.ts

  projection/
    toInvocationPayload.ts
    toPromptInspection.ts
    toPromptSummary.ts

  suggestions/
    suggestCommands.ts

  config/
    appConfig.ts

scripts/
  validate-prompts.ts

prompts/
  grill-me.md
  handoff.md
  spec-prompt-creator.md

test/
  fixtures/
    prompts-valid/
    prompts-invalid/
    prompts-conflicts/
  unit/
  contract/
  golden/
```

### 5.1 Dependency direction

Allowed direction:

```text
mcp adapter
  -> application use cases
    -> domain
    -> cache/index
    -> prompt source
    -> parser/validator/projection
```

Do not invert this.

### 5.2 Boundary rules

| Module | May do | Must not do |
|---|---|---|
| `mcp/` | Register tools, validate tool I/O, map use-case results to MCP-native responses | Fetch GitHub, parse Markdown, resolve aliases, inspect cache internals |
| `application/` | Orchestrate use cases and domain outcomes | Know MCP transport details, parse raw chat text, perform network calls directly |
| `domain/` | Define types, result shapes, errors, invariants | Import infrastructure, import MCP SDK, read files/network |
| `prompt-source/` | Load raw prompt files from approved source | Validate business rules, decide invokability, know MCP response shapes |
| `prompt-parser/` | Parse Markdown/frontmatter into raw definitions | Resolve aliases, access network, mutate cache |
| `validation/` | Validate per-prompt and collection-wide rules | Fetch prompt files, format MCP responses |
| `cache/` | Hold valid runtime lookup state, TTL, last-known-good behavior | Become canonical, expose user-facing refresh, mutate prompt source |
| `projection/` | Convert definitions to invocation/inspection/list projections | Fetch, validate, log, or apply prompts |
| `suggestions/` | Return non-executing suggestions | Auto-execute suggestions or resolve ambiguity by ranking |

---

## 6. TypeScript and Node standards

### 6.1 TypeScript configuration

Use strict TypeScript.

Minimum expectations:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true
  }
}
```

If the repo already has a stricter equivalent, preserve it.

### 6.2 Type rules

Codex agents must:

- avoid `any`;
- use `unknown` for untrusted data before validation;
- prefer discriminated unions for domain results;
- prefer string-literal unions for fixed enums;
- avoid broad `as` casts;
- avoid non-null assertions unless justified in a comment;
- avoid hidden global mutable state except approved singleton composition in the app entrypoint;
- keep domain types independent from SDK/runtime types.

### 6.3 Async and errors

Use `async`/`await` consistently.

Expected domain failures should be represented as typed result values, not thrown exceptions.

Throw only for:

- programmer errors;
- impossible states;
- unrecoverable infrastructure failures at adapter boundaries.

Use cases should return explicit success/failure results that the MCP adapter maps to structured tool responses.

### 6.4 Naming

Use clear domain names over abbreviations.

Preferred:

```text
PromptDefinition
PromptMetadata
PromptInvocationPayload
InvokePromptUseCase
PublicGitHubPromptSource
StaleWhileRevalidateCache
```

Avoid:

```text
Data
Thing
PromptManager
HandlerUtils
MagicRouter
WorkflowEngine
```

Never introduce names that imply unsupported V1 concepts, such as:

```text
UserPromptRepository
PrivatePromptService
TenantPromptSource
PromptOrchestrator
PromptComposer
WorkflowSessionManager
```

---

## 7. MCP/App SDK standards

### 7.1 MCP adapter responsibilities

The MCP adapter is a transport layer. It should:

- define tool names;
- define input schemas;
- define output schemas;
- call application use cases;
- map domain results to MCP-native `structuredContent` and `content`;
- keep user-facing receipt text compact.

It should not contain business logic.

### 7.2 Tool names

The approved ChatGPT-facing tool names are:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

Do not rename these without an architecture decision.

### 7.3 Tool descriptions

Tool descriptions must be clear and model-facing.

The invocation tool description should explicitly mention command-style use, for example:

```text
Use this tool when the user asks to invoke a Project Prompt Library command, especially messages like '@pl <command>'. It resolves a known command or alias and returns the stored prompt content for ChatGPT to apply.
```

Do not describe unsupported behavior such as prompt editing, draft browsing, cache refresh, semantic search, or automatic prompt selection.

### 7.4 Input schemas

`invoke_prompt_library_command` input:

```ts
interface InvokePromptInput {
  command: string;
  attached_input?: string;
}
```

`inspect_prompt_library_command` input:

```ts
interface InspectPromptInput {
  command: string;
}
```

`list_prompt_library_commands` input:

```ts
interface ListPromptLibraryCommandsInput {}
```

Do not accept raw chat transcript fields.

Forbidden input fields:

```text
raw_text
conversation
messages
full_chat
system_prompt
user_profile
cache_control
include_drafts
refresh
```

### 7.5 Output schemas

Every tool returning `structuredContent` must have an output schema.

The output schema must match the exact result shape. Do not let the implementation and schema drift.

### 7.6 Model-visible prompt body

For invocation to work, `prompt_body` must be model-visible in `structuredContent` or `content`.

Do not put invocation `prompt_body` only in `_meta`.

`_meta` is not a safe place for data the model must apply. Hidden-from-model is equivalent to useless-for-invocation.

### 7.7 Normal invocation response

Success:

```json
{
  "structuredContent": {
    "ok": true,
    "type": "prompt_invocation",
    "payload": {
      "title": "Grill Me",
      "lifecycle": "interactive_workflow",
      "input_mode": "either",
      "prompt_body": "..."
    }
  },
  "content": [
    {
      "type": "text",
      "text": "Prompt loaded and applied."
    }
  ]
}
```

Failure:

```json
{
  "structuredContent": {
    "ok": false,
    "type": "prompt_invocation_error",
    "error_code": "PROMPT_NOT_FOUND",
    "message": "No active prompt matched the requested command.",
    "no_prompt_invoked": true,
    "suggestions": ["grill-me"]
  },
  "content": [
    {
      "type": "text",
      "text": "No prompt was invoked. No active prompt matched the requested command."
    }
  ]
}
```

### 7.8 Invocation payload context hygiene

`invoke_prompt_library_command.structuredContent.payload` may contain only:

```text
title
lifecycle
input_mode
prompt_body
```

Forbidden in invocation payload:

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

Golden tests must assert the absence of forbidden keys.

---

## 8. Prompt file standards

### 8.1 File format

Prompt definitions are Markdown files with YAML frontmatter.

Example:

```markdown
---
schema_version: "1"
slug: grill-me
title: Grill Me
description: Interview the user one question at a time until intent and constraints are clear.
aliases:
  - grill
lifecycle: interactive_workflow
input_mode: either
status: active
---

You are my Grill Me interviewer...
```

### 8.2 Required frontmatter fields

```text
schema_version
slug
title
description
aliases
lifecycle
input_mode
```

### 8.3 Optional frontmatter fields

```text
status
tags
notes
debug_marker
prompt_version
created_at
updated_at
```

Optional fields may support authoring and validation, but must not leak into normal invocation payload.

### 8.4 Enums

```ts
type PromptLifecycle =
  | "persistent_mode"
  | "interactive_workflow"
  | "one_shot";

type InputMode =
  | "attached_input"
  | "conversation_context"
  | "either";

type PromptStatus =
  | "active"
  | "draft";
```

Only `active` prompts are invokable, inspectable, and listable through ChatGPT-facing tools.

Drafts are allowed in GitHub but handled by local tooling/CI, not by the ChatGPT runtime API.

### 8.5 Slug and alias rules

- Slugs must be lowercase kebab-case.
- Aliases must be lowercase kebab-case.
- Slug must be globally unique.
- Alias must be globally unique among aliases.
- Alias must not equal another active prompt slug.
- No ranking, file-order precedence, or “first match wins.”
- Conflicts fail closed.

Recommended pattern:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

### 8.6 Prompt body rules

- Prompt body must not be empty.
- Prompt body is canonical exact prompt content.
- Do not modify prompt body text during parse/projection except normal line-ending normalization if explicitly tested.
- Do not append metadata to prompt body.
- Do not wrap prompt body in extra instructions in core projection unless approved by architecture decision.

---

## 9. Validation standards

### 9.1 Runtime validation

All external/untrusted structured data must be validated at boundaries.

Use schema validation for:

- MCP tool inputs;
- MCP tool outputs;
- YAML frontmatter;
- parsed prompt metadata;
- configuration.

Use allowlist validation for enums, slugs, aliases, statuses, and tool commands.

### 9.2 Zod usage

Zod is the preferred runtime schema validation library unless the repository chooses a documented equivalent.

Expectations:

- schemas should be strict;
- parse untrusted data before using it;
- prefer `safeParse` where a typed domain error should be returned;
- do not let Zod errors leak directly to user-facing responses;
- map validation failures to stable domain errors.

### 9.3 Prompt collection validation

Validation has two levels.

Per-prompt validation:

- required fields present;
- enum values valid;
- slug format valid;
- alias format valid;
- aliases array present;
- prompt body non-empty;
- status valid if present.

Collection validation:

- duplicate slugs;
- alias equals another slug;
- duplicate aliases;
- active/draft command ambiguity;
- invalid prompt exclusion;
- conflict exclusion.

No unsafe collection state may be resolved by guessing.

---

## 10. Cache and source standards

### 10.1 Source boundary

Approved V1 source interface:

```ts
interface PromptSource {
  loadAllPrompts(): Promise<LoadedPromptFile[]>;
}
```

V1 implementation:

```text
PublicGitHubPromptSource
```

Do not add DB/private source implementations in V1.

### 10.2 Cache behavior

The runtime cache is derived and disposable.

Rules:

- GitHub is canonical for public prompts.
- Cache is never editable.
- Cache TTL is 5 minutes.
- Cache supports stale-while-revalidate.
- Last-known-good cache remains usable during refresh.
- Failed refresh must not replace last-known-good cache.
- A refresh result with unsafe lookup conflicts must not replace a safer cache.

### 10.3 Cache API boundary

No ChatGPT-facing cache refresh.

Internal or local-dev refresh mechanisms may exist only if needed, but must not be exposed as runtime MCP tools.

### 10.4 Network isolation in tests

Core tests must not require network access.

Use fake `PromptSource` implementations for unit and contract tests.

Network/live GitHub checks belong in integration smoke, not deterministic unit tests.

---

## 11. Error-handling standards

### 11.1 Stable error codes

Use stable error codes for known failure modes:

```text
PROMPT_NOT_FOUND
PROMPT_AMBIGUOUS
PROMPT_INVALID
PROMPT_NOT_INVOKABLE
PROMPT_SOURCE_UNAVAILABLE
PROMPT_CACHE_UNAVAILABLE
PROMPT_SCHEMA_ERROR
INTERNAL_ERROR
```

Do not invent new error codes casually. Add tests when adding codes.

### 11.2 Fail closed

Fail closed when:

- command is unknown;
- command is ambiguous;
- prompt is invalid;
- prompt is draft/not invokable;
- no valid cache exists;
- source cannot be loaded and no last-known-good cache exists;
- alias conflict exists;
- schema validation fails.

### 11.3 Suggestions

Unknown command suggestions are allowed, but must be non-executing.

Rules:

- suggestions may only reference active commands;
- suggestions must not trigger invocation;
- failure response must include `no_prompt_invoked: true`;
- suggestions are omitted if confidence is low or no safe candidate exists.

---

## 12. Logging and observability standards

V1 logging should be useful but conservative.

Log:

- server startup;
- tool invocation type, not full attached input;
- command slug requested;
- validation summary counts;
- cache refresh success/failure;
- cold-cache failure;
- source fetch failures;
- unexpected internal errors.

Do not log by default:

- `attached_input`;
- full `prompt_body`;
- full tool result payload;
- raw ChatGPT conversation text;
- secrets/tokens;
- future private prompt content.

Even though V1 prompts are public, build the habit now. Future-you will otherwise inherit a lovely data-leaking bonsai tree.

---

## 13. Security standards

### 13.1 Data minimization

Request only the data needed by the tool.

For invocation:

```text
command
attached_input optional
```

Do not request raw transcripts or broad context fields.

### 13.2 Secrets

V1 public GitHub should not require a GitHub token. If a token is later introduced for rate limits or deployment constraints:

- store it in environment variables or managed secret storage;
- do not commit it;
- do not print it;
- do not include it in test fixtures;
- do not expose it to ChatGPT-facing responses.

### 13.3 Dependency risk

Codex agents must not add dependencies casually.

Before adding a dependency, state:

- why native code or an existing dependency is insufficient;
- whether it is runtime or dev-only;
- maintenance/activity signal;
- security considerations;
- whether it affects hosted deployment.

Small utilities should often be implemented locally rather than pulling a package.

---

## 14. Testing standards

### 14.1 Test categories

Required categories:

```text
unit
contract
golden
integration smoke/manual
```

Unit tests cover pure/core behavior.

Contract tests cover MCP-facing schemas and response shapes.

Golden tests assert exact payloads and absence of forbidden keys.

Integration smoke validates live platform behavior and should not be the default deterministic gate.

### 14.2 TDD requirements

Use TDD for deterministic core behavior, especially:

- frontmatter parsing;
- schema validation;
- enum validation;
- slug/alias validation;
- duplicate slug detection;
- alias conflict detection;
- active-only invocation;
- draft exclusion;
- reduced projection;
- no metadata leakage;
- unknown command failure;
- suggestions non-execution;
- stale-while-revalidate cache;
- last-known-good preservation.

### 14.3 Golden test rules

Golden snapshots are contracts, not decorative screenshots.

Do not update golden files unless:

- the contract intentionally changed;
- the architecture/standards document permits the change;
- the final report explains the semantic reason.

Golden tests must assert absence of forbidden keys in invocation payload.

### 14.4 Test fixture standards

Use clear fixture directories:

```text
test/fixtures/prompts-valid/
test/fixtures/prompts-invalid/
test/fixtures/prompts-conflicts/
```

Minimum Slice 1 fixture set:

- one valid active prompt;
- one draft prompt;
- one invalid prompt missing a required field;
- one unknown command case;
- one alias case;
- one alias conflict case.

### 14.5 No-network core test rule

Core unit/contract/golden tests must not hit:

- GitHub;
- ChatGPT;
- hosted MCP endpoint;
- live tunnel;
- internet.

Use fakes/mocks.

---

## 15. CI and quality gate standards

### 15.1 Blocking deterministic gate

Every implementation PR should pass:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:unit
npm run test:contract
npm run test:golden
npm run validate-prompts
```

or equivalent configured commands.

### 15.2 Failure policy

CI must fail if:

- invocation payload contains forbidden metadata;
- draft prompt appears in invoke/list/inspect;
- unknown command auto-executes a suggestion;
- alias conflict is resolved by order/priority;
- invalid prompt is served;
- prompt body is hidden only in `_meta` for invocation;
- golden response shape changes without intentional update;
- tests require network access unexpectedly.

### 15.3 Deployment/readiness smoke

Live smoke checks are required before hosted deployment, but not as normal commit gates.

They should verify:

- local MCP server smoke;
- live public source smoke;
- ChatGPT/developer-tooling smoke if available;
- `@pl` routing still works;
- hosted HTTPS endpoint works.

---

## 16. Tooling standards

### 16.1 Package manager

Use the package manager already present in the repository.

Rules:

- do not introduce a second lockfile;
- do not switch package manager without approval;
- if the repository is not initialized, propose `npm` or `pnpm` explicitly before committing to one.

### 16.2 Lint/format

Use one coherent lint/format stack.

Acceptable paths:

- Biome for format/lint plus `tsc --noEmit` for typechecking;
- ESLint/typescript-eslint plus Prettier;
- an existing repository-approved equivalent.

Do not mix Biome, ESLint, and Prettier casually.

### 16.3 Recommended script capabilities

The repository should eventually expose these capabilities, even if exact script names differ:

```json
{
  "dev": "run local MCP server",
  "typecheck": "TypeScript compile check without emit",
  "lint": "lint code",
  "format:check": "verify formatting",
  "test": "run all deterministic tests",
  "test:unit": "run unit tests",
  "test:contract": "run MCP/tool contract tests",
  "test:golden": "run golden fixture tests",
  "validate-prompts": "validate prompt files"
}
```

---

## 17. Documentation standards

### 17.1 Required updates

Update documentation when changing:

- tool names;
- tool input/output schemas;
- prompt frontmatter schema;
- module boundaries;
- cache behavior;
- validation rules;
- lifecycle/input-mode/status enums;
- roadmap slice scope;
- non-goals.

### 17.2 Comments

Use comments to explain why, not to narrate obvious code.

Good:

```ts
// Prompt body must be model-visible; hiding it in _meta prevents ChatGPT from applying it.
```

Bad:

```ts
// Set ok to true.
```

### 17.3 ADRs

Major architecture changes require an ADR or explicit architecture-plan update.

Examples requiring ADR/update:

- adding a DB;
- adding private suites;
- adding auth;
- adding UI widgets;
- changing cache strategy;
- adding/removing ChatGPT-facing tools;
- changing normal invocation payload fields;
- replacing TypeScript/Node stack.

---

## 18. Slice-specific standards

### 18.1 Slice 0 — premise spike

Slice 0 is disposable and intentionally not representative of final architecture.

Scope:

- local TypeScript/Node MCP server;
- one hardcoded `proof` command;
- hardcoded proof prompt;
- local tunnel/developer setup;
- manual validation checklist.

Non-goals:

- GitHub;
- parser;
- YAML;
- cache;
- real prompts;
- inspect/list tools;
- hosting;
- private suites.

Done only when:

- explicit tool invocation works as sanity check;
- `@pl proof` works as product gate;
- three cooperative fresh chats show the proof behavior;
- proof behavior asks exactly one clarifying question;
- proof behavior does not answer the topic yet;
- proof behavior ends with `PPL-PROOF-001`.

If Slice 0 fails, do not continue to Slice 1 without an architecture decision.

### 18.2 Slice 1 — walking skeleton

Slice 1 builds the first real `invoke_prompt_library_command` path.

Scope:

- local fixture source;
- parser;
- schema validation;
- alias resolution;
- active-only invocation;
- reduced projection;
- MCP-native response;
- TDD unit tests;
- contract/golden tests.

Non-goals:

- live GitHub source;
- cache TTL/stale refresh unless needed for scaffolding;
- inspect/list tools;
- hosting;
- private suites.

### 18.3 Slice 2 — source/cache/index

Add public GitHub source and runtime cache behavior.

Keep source/cache code behind interfaces and fakes.

### 18.4 Slice 3 — inspect/list tools

Add only the two remaining ChatGPT-facing tools:

```text
inspect_prompt_library_command
list_prompt_library_commands
```

Do not add refresh/admin/draft tools.

### 18.5 Slice 4 — local MVP

Add the first three real prompts:

```yaml
handoff:
  lifecycle: one_shot
  input_mode: conversation_context

grill-me:
  lifecycle: interactive_workflow
  input_mode: either

spec-prompt-creator:
  lifecycle: persistent_mode
  input_mode: either
```

### 18.6 Slice 5 and beyond

Use locally before hosting.

Do not deploy simply because the server can start. Deploy only when the local connector is personally useful.

---

## 19. Anti-patterns Codex must avoid

Do not introduce:

- a prompt manager service;
- a workflow engine;
- a semantic router;
- prompt composition;
- session state;
- prompt editing in ChatGPT;
- draft listing/inspection in ChatGPT;
- cache refresh tools;
- auth/user code in V1;
- DB schema in V1;
- private source implementation in V1;
- UI widgets in V1;
- Elasticsearch;
- Vaadin;
- Java/Spring backend;
- raw transcript tool inputs;
- `any`-heavy TypeScript;
- order-dependent alias resolution;
- hidden model-required data in `_meta`;
- network-dependent unit tests;
- unreviewed golden snapshot changes.

If a user or task asks for one of these, stop and call out the architecture conflict.

---

## 20. Codex task prompt template

Use this structure when prompting a coding agent.

```text
You are implementing [slice/task] for Project Prompt Library.

Required reading:
- project-prompt-library-architecture-plan.md
- project-prompt-library-codex-agent-standards.md

Goal:
[One-paragraph goal]

Scope:
[Allowed implementation scope]

Non-goals:
[Explicit exclusions]

Architecture constraints:
- TypeScript/Node.
- Thin MCP adapter over framework-independent core.
- Keep MCP transport separate from domain/application logic.
- Preserve reduced invocation payload boundary.
- No ChatGPT-facing admin/draft/cache-refresh behavior.

Files/modules likely involved:
[List expected files]

Testing requirements:
- TDD for deterministic core logic.
- Add/update unit tests.
- Add/update contract tests if MCP shape changes.
- Add/update golden tests if response payload changes.
- Do not use network in core tests.

Acceptance criteria:
[Concrete pass/fail list]

Report back with:
- changed files;
- tests added/updated;
- commands run;
- failures or skipped checks;
- architecture concerns;
- what remains out of scope.
```

---

## 21. Codex final-report checklist

Every coding-agent report must answer:

```text
Scope completed:
- ...

Changed files:
- ...

Tests added/updated:
- ...

Commands run:
- ...

Results:
- ...

Architecture boundaries preserved:
- MCP adapter remains thin: yes/no
- No raw @pl parsing in connector: yes/no
- No forbidden invocation metadata: yes/no
- No draft/runtime admin exposure: yes/no
- No network in core tests: yes/no

Known issues:
- ...

Not implemented by design:
- ...
```

If the agent cannot run checks, it must say so plainly and explain why.

---

## 22. QA review checklist

QA agents should verify:

### Architecture boundary

- MCP adapter does not contain business logic.
- Use cases do not import MCP SDK types.
- Domain does not import infrastructure.
- Source adapter is the only GitHub/network-aware module.
- Cache is not canonical.

### Runtime API

- Only approved tools exist.
- Tool input schemas are minimal.
- Tool output schemas are declared.
- Invocation prompt body is model-visible.
- Prompt body is not hidden only in `_meta`.
- Normal invocation receipt is compact.

### Prompt behavior

- Only active prompts invoke/list/inspect.
- Drafts are not exposed through ChatGPT.
- Invalid prompts are excluded.
- Alias conflicts fail closed.
- Unknown suggestions do not invoke.

### Tests

- Unit tests cover deterministic core behavior.
- Contract tests cover MCP tool shapes.
- Golden tests cover success/failure payloads.
- Golden tests assert forbidden keys are absent.
- Core tests do not hit network.

### Drift

- No prompt editing/admin feature introduced.
- No private-suite implementation introduced.
- No cache refresh tool introduced.
- No semantic routing introduced.
- No workflow orchestration introduced.

---

## 23. Change-control rule

This document is allowed to evolve, but not casually.

A Codex agent may update this document only when:

- the task explicitly asks for standards updates;
- an accepted architecture decision changes;
- a test/implementation reveals a real contradiction;
- the update tightens clarity without changing scope.

A Codex agent must not weaken these standards merely to make its current implementation easier.

That is the exact moment the standards document is supposed to be annoying.
