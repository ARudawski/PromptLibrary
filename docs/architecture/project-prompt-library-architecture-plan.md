# Project Prompt Library — Architecture Plan

Status: Architecture plan v1.0  
Date: 2026-06-18  
Primary audience: roadmap planner, coding-agent prompt generator, QA-agent prompt generator, future architecture review  

---

## 1. Executive summary

Project Prompt Library is a small ChatGPT Apps / MCP connector that lets a user invoke exact, externally maintained prompt workflows from inside a normal ChatGPT conversation using short command-style requests such as:

```text
@pl grill-me

I want to build a small app that...
```

The V1 product is **not** a prompt editor, note app, workflow engine, semantic router, custom GPT replacement, marketplace, or multi-user SaaS. It is a retrieval-focused prompt invocation layer.

The central product promise is:

> Given a known command, retrieve the exact stored prompt definition and make it available to ChatGPT as behavior-shaping instruction for the current conversation or attached input.

The architecture is intentionally boring:

- TypeScript/Node MCP/App connector.
- Tool-only ChatGPT app; no UI widget in V1.
- Public GitHub command suite as V1 canonical source of truth.
- Markdown prompt files with YAML frontmatter.
- Runtime in-memory cache with 5-minute TTL and stale-while-revalidate / last-known-good behavior.
- No database in V1.
- No private prompt suites in V1.
- Thin MCP adapter over a framework-independent prompt-library core.
- Strong TDD/unit tests, contract tests, and fixture-based golden tests.
- Slice 0 premise validation before real implementation work.

The most important sequencing decision is that **Slice 0 comes before the architecture is implemented**: first prove that ChatGPT can call a local connector tool using `@pl proof`, receive a hardcoded prompt, and apply that prompt as behavior. If that premise fails, the product must be redesigned before building parser/cache/schema infrastructure.

---

## 2. Product and technical goal

### Product goal

Enable exact reusable prompt workflows to be invoked from normal ChatGPT conversations without relying on memory, vague recollection, copy/paste, local text expanders, or per-device notes.

The user should be able to write a short command and have ChatGPT apply the corresponding stored prompt workflow:

```text
@pl handoff
```

or:

```text
@pl grill-me

Here is my rough idea...
```

### Technical goal

Build a small ChatGPT Apps / MCP connector that exposes a small read-only tool API for prompt lookup and inspection:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

The connector should:

- resolve commands and aliases;
- load prompt definitions from the public command suite;
- validate prompt definitions;
- exclude drafts and invalid prompts from invocation;
- return a reduced behavior-facing projection for invocation;
- avoid leaking operational/debug metadata into normal invocation;
- fail closed when a command cannot be resolved safely;
- remain testable without ChatGPT, GitHub, or network access for core logic.

### Key platform constraint

For ChatGPT to apply a returned prompt, the prompt body must be **model-visible** in the tool result, for example in `structuredContent` or `content`. It must not be placed only in hidden `_meta`, because then the model cannot use it.

Therefore, “compact invocation” means:

> The assistant should not visibly print/narrate the full prompt to the user during normal invocation, but the full prompt body must still be returned in model-visible tool result data so the model can apply it.

This is acceptable for V1 because the command suite is public and transparent. Future private suites require a separate security/product design.

---

## 3. V1 scope

### Included in V1

- ChatGPT-facing MCP/App connector.
- Explicit command-style prompt invocation, targeting `@pl <command>`.
- Tool-only app; no UI widget/component initially.
- Public command suite.
- Public GitHub as canonical source for prompt definitions.
- Flat prompt repository layout:

```text
prompts/*.md
```

- Markdown files with YAML frontmatter.
- Runtime in-memory prompt cache.
- 5-minute cache TTL.
- Stale-while-revalidate / last-known-good cache behavior.
- Strict prompt validation.
- Global slug/alias conflict checks.
- Active-only invocation.
- Draft prompts may exist in GitHub, but are not exposed through the ChatGPT-facing API.
- Three ChatGPT-facing read-only tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

- Local developer prompt-validation scripts.
- Deterministic CI for local/dev quality gates.
- Live integration smoke checks only for deployment/readiness, not as default commit gates.
- Initial local MVP prompt set:
  - `handoff`
  - `grill-me`
  - `spec-prompt-creator`

### Explicit V1 proof sequence

V1 work must start with Slice 0:

> Hardcoded local proof prompt returned by a local MCP tool. Validate that ChatGPT can route `@pl proof` into the connector and apply the returned prompt.

Only after Slice 0 passes should the actual prompt-library implementation begin.

---

## 4. Non-goals

V1 must not build:

- prompt editing in ChatGPT;
- draft management in ChatGPT;
- cache refresh/invalidation exposed to ChatGPT users;
- private prompt suites;
- user accounts;
- OAuth/user-token flows;
- encrypted private prompt storage;
- DB-backed private prompt records;
- multi-source prompt merging;
- team/shared spaces;
- prompt marketplace;
- billing;
- analytics dashboard;
- semantic search;
- automatic prompt selection;
- bare-command recognition without explicit `@pl` intent;
- workflow/session state management outside ChatGPT;
- external agent orchestration;
- prompt composition engine;
- complex UI/admin panel;
- Elasticsearch;
- Vaadin;
- Java/Spring backend for V1.

Important boundary:

> The connector retrieves prompt definitions. The prompt text defines behavior. The connector does not execute workflows, manage conversation state, or decide when a prompt should be used.

---

## 5. Locked decisions

### Product behavior

1. **Prompt invocation style** — explicit command-style invocation such as `@pl grill-me`.
2. **Invocation return shape** — standardized apply-wrapper/result with exact prompt body.
3. **Normal invocation visibility** — compact visible receipt only; full prompt is not printed by default.
4. **Inspectability** — full prompt text is available through explicit inspect tool.
5. **Context hygiene** — normal invocation sends only behavior-shaping data.
6. **Lifecycle ownership** — prompt lifecycle is defined by prompt wording and metadata; connector does not manage workflow state.

### Prompt model

7. **Prompt artifact** — single Markdown file with YAML frontmatter.
8. **Canonical public source** — public GitHub command suite.
9. **Repository layout** — flat `prompts/*.md`.
10. **Full schema vs runtime projection** — GitHub files may contain richer metadata; invocation uses reduced behavior projection.
11. **Lifecycle enum** — `persistent_mode`, `interactive_workflow`, `one_shot`.
12. **Input mode enum** — `attached_input`, `conversation_context`, `either`.
13. **Status enum** — `active`, `draft`; only `active` is invokable.

### Storage and sync

14. **No DB in V1** — runtime cache only.
15. **Cache TTL** — 5 minutes.
16. **Cache refresh behavior** — stale-while-revalidate / last-known-good.
17. **Cache population** — load and parse all `prompts/*.md` into in-memory slug/alias map.
18. **Partial valid cache** — valid prompts can be served even if some files are invalid.
19. **Total cold failure** — if no valid cache can be built, all invocations fail closed.
20. **Cache refresh is not ChatGPT-facing** — no `refresh_prompt_library_cache` tool.

### API and connector

21. **ChatGPT-facing tool set**:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

22. **No raw command parsing inside connector** — connector receives structured tool arguments, not raw `@pl` chat text.
23. **Invocation input schema** — `command` plus optional `attached_input`.
24. **Unknown commands** — fail closed with optional non-executing suggestions.
25. **Inspection** — active/invokable prompts only; inspection-only; no prompt invoked.
26. **Listing** — active/invokable commands only; no drafts.

### Security and future direction

27. **V1 auth** — public command suite; no private-suite auth implemented.
28. **Future private suites** — likely DB-backed and encrypted, not private-GitHub-based.
29. **Future private-suite support is a constraint, not a V1 feature**.

### Technology and architecture

30. **Implementation stack** — TypeScript/Node.
31. **Connector architecture** — thin MCP adapter over framework-independent prompt-library core.
32. **Prompt source boundary** — small `PromptSource` interface with only `PublicGitHubPromptSource` implementation in V1.
33. **Tool-only app** — no UI widget in V1.

### Testing and delivery

34. **Slice 0 premise validation** — hardcoded proof prompt before product implementation.
35. **Testing strategy** — unit tests, MCP/tool contract tests, fixture-based golden tests.
36. **TDD** — unit-testable core behavior developed test-first.
37. **CI** — deterministic strict CI for local/dev; live smoke for deployment.
38. **Implementation roadmap** — invocation-first.
39. **Hosting** — deferred until local MVP proves useful.

---

## 6. Assumptions

1. ChatGPT Apps/MCP can expose tool-only connectors without a custom UI component.
2. ChatGPT can route `@pl <command>`-style user intent into the appropriate MCP tool if tool metadata is clear enough.
3. The model can apply prompt content returned in model-visible tool result fields.
4. V1 command suite can be public and transparent.
5. GitHub fetch/parsing is not the unique risk; ChatGPT tool invocation and returned-prompt application are the unique risks.
6. Prompt edits can tolerate up to 5 minutes of staleness in normal runtime.
7. Local development can initially use a tunnel; hosted deployment is not required until local MVP is personally useful.
8. Future private prompt suites will likely require user identity, DB-backed storage, and encryption, but none of that should be built now.
9. Prompt files are authored/reviewed in GitHub; ChatGPT is not a prompt-authoring UI.
10. Coding agents will be used, so boundaries, tests, and response contracts must be explicit enough to prevent implementation drift.

---

## 7. System boundaries

### Inside the system

- MCP/App server.
- Tool definitions and tool handlers.
- Prompt-source adapter for public GitHub.
- Markdown/frontmatter parsing.
- Schema validation.
- Runtime prompt cache.
- Slug/alias index.
- Use cases for invoke, inspect, and list.
- Reduced behavior projection for invocation.
- Structured success/error responses.
- Local validation scripts.
- Tests and fixtures.

### Outside the system

- ChatGPT conversation state.
- ChatGPT model behavior after receiving the prompt.
- Prompt authoring/editing workflow in GitHub.
- Future private prompt storage.
- User account system.
- Encryption/key management.
- Hosted deployment provider, until local MVP passes.

### Explicit boundary rule

The connector may retrieve and package prompt definitions. It must not:

- decide which prompt the user needs without explicit command intent;
- compose multiple prompts;
- execute workflow steps externally;
- maintain per-conversation state;
- manage drafts through ChatGPT;
- expose cache/admin controls through ChatGPT.

---

## 8. User workflow

### Normal invocation workflow

User writes:

```text
@pl grill-me

I want to build a small app that helps me organize reusable prompts.
```

Expected platform behavior:

1. ChatGPT recognizes the user wants to invoke a Prompt Library command.
2. ChatGPT calls:

```json
{
  "tool": "invoke_prompt_library_command",
  "arguments": {
    "command": "grill-me",
    "attached_input": "I want to build a small app that helps me organize reusable prompts."
  }
}
```

3. Connector resolves `grill-me` against active command slugs/aliases.
4. Connector returns a model-visible invocation payload containing:
   - `title`
   - `lifecycle`
   - `input_mode`
   - `prompt_body`
5. ChatGPT applies the returned prompt to the attached input/current conversation as appropriate.
6. User sees only a compact receipt/normal assistant behavior, not a full prompt dump.

### Inspect workflow

User asks:

```text
Inspect @pl grill-me
```

Expected behavior:

1. ChatGPT calls `inspect_prompt_library_command` with `command: "grill-me"`.
2. Connector returns full prompt body and metadata for active prompt only.
3. Response is explicitly marked:
   - `inspection_only: true`
   - `no_prompt_invoked: true`
4. ChatGPT must not apply the inspected prompt as behavior.

### List workflow

User asks:

```text
What Prompt Library commands are available?
```

Expected behavior:

1. ChatGPT calls `list_prompt_library_commands`.
2. Connector returns summaries of active/invokable commands only.
3. No prompt bodies are returned.
4. Drafts are not exposed.

---

## 9. Domain model

### `PromptDefinition`

Canonical parsed prompt definition.

```ts
interface PromptDefinition {
  metadata: PromptMetadata;
  promptBody: string;
}
```

### `PromptMetadata`

Authoring metadata parsed from YAML frontmatter.

```ts
interface PromptMetadata {
  schema_version: string;
  slug: string;
  title: string;
  description: string;
  aliases: string[];
  lifecycle: PromptLifecycle;
  input_mode: InputMode;
  status?: PromptStatus;
  tags?: string[];
  notes?: string;
  debug_marker?: string;
  prompt_version?: string;
  created_at?: string;
  updated_at?: string;
}
```

### Enums

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

### `PromptInvocationPayload`

Reduced behavior-facing payload for normal invocation.

```ts
interface PromptInvocationPayload {
  title: string;
  lifecycle: PromptLifecycle;
  input_mode: InputMode;
  prompt_body: string;
}
```

This payload must not contain:

- `slug`
- `aliases`
- `description`
- `status`
- `hash`
- `source_path`
- `repo_commit`
- `indexed_at`
- validation diagnostics
- cache diagnostics

### `PromptSummary`

Used by `list_prompt_library_commands`.

```ts
interface PromptSummary {
  title: string;
  description: string;
  aliases: string[];
  lifecycle: PromptLifecycle;
  input_mode: InputMode;
}
```

The list response may include the command slug if needed for actual command discovery. Unlike invocation payload, list output is not behavior-shaping prompt content. A practical V1 summary should include `command`/`slug` so users know what to type:

```ts
interface PromptCommandSummary extends PromptSummary {
  command: string;
}
```

### `PromptInspection`

Used by `inspect_prompt_library_command`.

```ts
interface PromptInspection {
  ok: true;
  type: "prompt_inspection";
  inspection_only: true;
  no_prompt_invoked: true;
  metadata: PromptMetadata;
  prompt_body: string;
}
```

---

## 10. Source-of-truth strategy

### V1 canonical source

The V1 public command suite is stored in GitHub.

```text
prompts/
  grill-me.md
  handoff.md
  spec-prompt-creator.md
```

GitHub is canonical for public prompts because it provides:

- exact text;
- version history;
- review/diff workflow;
- rollback;
- portability;
- transparency;
- low vendor lock-in.

### Source-of-truth rule

> The runtime cache is derived from GitHub. It is never editable and never canonical.

### Future source direction

Future private prompt suites are expected to be application-owned DB records, likely encrypted. They are not part of V1 and should not be represented as fake V1 abstractions.

The V1 architecture should preserve only a small seam:

```ts
interface PromptSource {
  loadAllPrompts(): Promise<LoadedPromptFile[]>;
}
```

V1 implementation:

```text
PublicGitHubPromptSource
```

Future possible implementation:

```text
EncryptedDbPromptSource
```

But no future source merging, precedence, per-user filtering, or private-suite behavior is implemented now.

---

## 11. Storage, database, and cache strategy

### Database

No database in V1.

Reason:

- V1 has public prompts only.
- GitHub is canonical.
- There is no user state.
- There are no private records.
- There are no runtime writes.
- Query needs are limited to slug/alias lookup.

### Runtime cache

Use an in-memory cache containing:

- parsed prompt definitions;
- validation results;
- active prompt map by slug;
- active prompt map by alias;
- optional internal operational metadata.

### Cache TTL

5 minutes.

Normal behavior:

- if cache is fresh, use it;
- if cache is stale, trigger refresh;
- if last-known-good cache exists, continue serving it while refresh runs;
- failed refresh must not destroy last-known-good cache.

### Stale-while-revalidate

The cache should support stale-while-revalidate:

1. Request arrives.
2. Cache is stale but present.
3. Connector serves from current last-known-good cache.
4. Refresh is attempted asynchronously or in controlled background path.
5. If refresh succeeds, replace cache.
6. If refresh fails, keep current cache and log/report internally.

### Partial valid cache

If some prompt files are invalid:

- valid active prompts may still be served;
- invalid prompts are excluded;
- conflicting prompts are excluded/fail closed;
- validation diagnostics are visible in local tooling/logs/tests, not normal ChatGPT invocation.

### Cold start failure

If no valid cache can be built at all:

- `invoke_prompt_library_command` must fail closed;
- `inspect_prompt_library_command` must fail closed;
- `list_prompt_library_commands` should return empty/failure with clear source/cache error;
- no fallback prompt content is invented.

### No ChatGPT-facing cache control

There is no `refresh_prompt_library_cache` tool.

Cache refresh belongs to:

- TTL;
- startup load;
- restart;
- logs;
- local scripts;
- tests;
- deployment operations.

Not to the ChatGPT runtime API.

---

## 12. Sync/indexing strategy

### Indexing approach

On cache refresh:

1. `PublicGitHubPromptSource` loads all Markdown files from `prompts/*.md`.
2. Parser extracts YAML frontmatter and prompt body.
3. Validator validates each prompt definition.
4. Global indexer validates slug/alias uniqueness.
5. Active valid prompts are indexed by slug and aliases.
6. Draft prompts are excluded from runtime API.
7. Invalid/conflicting prompts are excluded.
8. If at least one valid active prompt exists, a partial cache may be accepted.
9. If no valid cache exists and no last-known-good cache exists, runtime fails closed.

### Alias rules

- Slug must be unique among all prompt files.
- Alias must not equal another active prompt slug.
- Alias must not be duplicated across active prompts.
- Alias conflicts are not resolved by priority, file order, status, or fuzzy matching.
- Conflicted commands fail closed.

### Unknown command suggestions

Unknown command handling may return suggestions based on simple similarity, but suggestions are non-executing.

Rules:

- never auto-execute suggested prompt;
- return `no_prompt_invoked: true`;
- suggestions are optional;
- suggestions should be based only on active invokable commands.

---

## 13. Connector/API design

### Platform contract

Use MCP/App-native tool result shape:

- `structuredContent` for structured model-visible data;
- `content` for user/model-visible text content;
- `_meta` only for hidden UI/component data, not prompt bodies needed by the model.

V1 has no custom UI component, so `_meta` should be minimal or unused.

### Tool 1: `invoke_prompt_library_command`

Purpose:

> Resolve and return a stored active prompt command so ChatGPT can apply it.

Input schema:

```ts
interface InvokePromptInput {
  command: string;
  attached_input?: string;
}
```

The connector does not parse raw `@pl` text. ChatGPT/tool routing is expected to map user intent to structured tool input.

Success result:

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

Failure result:

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

Important:

- `payload.prompt_body` is model-visible.
- `content.text` stays compact.
- Normal invocation does not return slug/hash/source/version/debug metadata.

### Tool 2: `inspect_prompt_library_command`

Purpose:

> Explicitly inspect full text and metadata for an active/invokable prompt without invoking it.

Input schema:

```ts
interface InspectPromptInput {
  command: string;
}
```

Success result:

```json
{
  "structuredContent": {
    "ok": true,
    "type": "prompt_inspection",
    "inspection_only": true,
    "no_prompt_invoked": true,
    "metadata": {
      "schema_version": "1",
      "slug": "grill-me",
      "title": "Grill Me",
      "description": "...",
      "aliases": ["grill"],
      "lifecycle": "interactive_workflow",
      "input_mode": "either",
      "status": "active"
    },
    "prompt_body": "..."
  },
  "content": [
    {
      "type": "text",
      "text": "Inspection only. No prompt was invoked."
    }
  ]
}
```

Rules:

- active prompts only;
- no drafts;
- no invocation;
- must include `inspection_only: true`;
- must include `no_prompt_invoked: true`.

### Tool 3: `list_prompt_library_commands`

Purpose:

> List active/invokable prompt commands for discovery.

Input schema:

```ts
interface ListPromptsInput {}
```

Success result:

```json
{
  "structuredContent": {
    "ok": true,
    "type": "prompt_command_list",
    "commands": [
      {
        "command": "grill-me",
        "title": "Grill Me",
        "description": "...",
        "aliases": ["grill"],
        "lifecycle": "interactive_workflow",
        "input_mode": "either"
      }
    ]
  },
  "content": [
    {
      "type": "text",
      "text": "Available active Prompt Library commands listed."
    }
  ]
}
```

Rules:

- active prompts only;
- no drafts;
- no prompt bodies;
- no cache diagnostics;
- no admin/debug inventory.

### Error codes

Initial stable error codes:

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

All failed `invoke_prompt_library_command` responses must include:

```json
{
  "no_prompt_invoked": true
}
```

---

## 14. Authentication and security model

### V1 security model

V1 uses a public command suite.

Therefore:

- no user login;
- no OAuth;
- no private GitHub token requirement for prompt access;
- no private prompts;
- no DB-backed personal storage;
- no encryption/key management;
- no write operations.

### Data minimization

Tool inputs should request only what is needed:

- `command`;
- optional `attached_input`.

The connector should not request:

- full raw chat transcript;
- arbitrary conversation dump;
- user profile;
- unrelated context.

### Fail-closed behavior

The connector must fail closed when:

- command cannot be resolved;
- command is ambiguous;
- prompt is invalid;
- prompt is draft/not invokable;
- no valid cache/source state exists;
- validation detects unsafe conflicts.

### Future private-suite note

Future private suites may require:

- user identity;
- user token/session model;
- encrypted DB prompt storage;
- per-user prompt ownership;
- access control;
- key management;
- private prompt non-leakage guarantees;
- careful treatment of model-visible prompt bodies.

These are explicitly not part of V1.

Important future warning:

> If private prompt bodies must be applied by ChatGPT, they will necessarily become model-visible to ChatGPT. Encryption at rest does not hide prompt content from the model at invocation time. Future private-suite design must treat this honestly.

---

## 15. Technology stack recommendation

### V1 stack

Use TypeScript/Node.

Recommended components:

```text
Runtime: Node.js
Language: TypeScript
Package manager: npm or pnpm
MCP/App SDK: TypeScript MCP SDK / OpenAI Apps SDK-compatible setup
Schema validation: zod
Testing: Vitest or Jest
Markdown/frontmatter parsing: gray-matter or equivalent
Lint/format: eslint + prettier or biome
HTTP server: minimal Node/Express/Hono-style server, depending on SDK examples
```

### Why not Java/Spring Boot for V1

Java/Spring Boot is viable technically, but not the best V1 choice because:

- V1’s main risk is ChatGPT Apps/MCP integration, not backend complexity;
- TypeScript has the smoother documented path for connector-style MCP work;
- the V1 server is small and tool-focused;
- using the platform-native/common SDK path reduces integration friction.

Java/Spring Boot remains a possible later backend choice if future private DB-backed encrypted suites become substantial enough to justify a larger service architecture.

### UI

No UI widget/component in V1.

The connector is tool-only.

---

## 16. Code architecture

### Architecture style

Use a thin MCP adapter over a framework-independent prompt-library core.

Do not build:

- a single-file blob;
- a full enterprise backend architecture;
- a plugin system;
- a multi-source orchestration framework.

### Proposed module layout

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

### Dependency direction

```text
MCP adapter
  -> application use cases
    -> domain
    -> cache/index
    -> prompt source
    -> parser/validator/projection
```

Core rules:

- MCP adapter contains no GitHub logic.
- MCP adapter contains no Markdown parsing.
- MCP adapter contains no alias conflict logic.
- Use cases do not know transport details.
- Parser/validator are pure/testable.
- Cache/index can be tested with fake `PromptSource`.
- `PublicGitHubPromptSource` is infrastructure only.

### Use cases

#### `InvokePromptUseCase`

Responsibilities:

- accept structured `command` and optional `attached_input`;
- resolve active prompt by slug/alias;
- fail closed for unknown/ambiguous/invalid/not-invokable commands;
- return `PromptInvocationPayload` on success;
- return structured domain error on failure.

Non-responsibilities:

- parse raw `@pl` text;
- execute prompt;
- summarize prompt;
- manage chat state;
- mutate prompts;
- refresh cache manually on user request.

#### `InspectPromptUseCase`

Responsibilities:

- resolve active prompt;
- return full metadata and body;
- mark inspection-only and no-prompt-invoked.

#### `ListPromptsUseCase`

Responsibilities:

- return active invokable prompt summaries;
- exclude drafts;
- exclude prompt bodies.

---

## 17. Testing strategy

### Testing principles

This project’s core risk is drift, not algorithmic complexity.

Tests must catch:

- wrong prompt invoked;
- draft prompt exposed;
- invalid prompt served;
- metadata leakage into invocation payload;
- full prompt body printed in normal visible receipt;
- alias collision resolved incorrectly;
- unknown command guessed/executed;
- stale refresh replacing a good cache with unsafe data;
- MCP contract shape drift.

### Unit tests: TDD required

Develop test-first for deterministic core behavior:

- frontmatter parsing;
- schema validation;
- lifecycle enum validation;
- input mode enum validation;
- status validation;
- empty prompt body rejection;
- slug format validation;
- alias format validation;
- duplicate slug detection;
- alias/slug conflict detection;
- duplicate alias detection;
- active-only invocation;
- draft exclusion;
- reduced projection;
- no metadata leakage in invocation payload;
- unknown command failure;
- suggestions non-execution;
- cache stale-while-revalidate behavior;
- last-known-good preservation.

### Contract tests

Test the MCP-facing tools without real ChatGPT:

- input schema validation;
- output schema validation;
- success response shape;
- failure response shape;
- `structuredContent` fields;
- `content` receipt text;
- no `_meta` dependency for prompt application;
- no unexpected fields in invocation payload.

### Golden tests

Use fixtures and snapshot/golden assertions for:

- valid active prompt invocation;
- alias invocation;
- unknown command with suggestion;
- draft prompt not invokable;
- invalid prompt excluded;
- duplicate slug conflict;
- alias conflict;
- inspection result;
- list result;
- cold cache failure;
- partial valid cache behavior.

Golden tests should intentionally assert exact keys and absence of forbidden keys.

### Slice 0 manual premise test

Before real implementation:

1. Run local hardcoded TypeScript MCP server.
2. Connect ChatGPT via local HTTPS tunnel/developer setup.
3. Test explicit tool invocation as platform sanity check.
4. Test `@pl proof` command-style invocation as product gate.
5. Run three cooperative fresh chats.
6. Optional messy/conflicting input run is diagnostic only.

Slice 0 proof prompt must require ChatGPT to:

- ask exactly one clarifying question;
- not answer the topic yet;
- append marker `PPL-PROOF-001`.

Slice 0 passes only if `@pl proof` reliably routes and the returned prompt is applied in the cooperative runs.

---

## 18. Tooling and developer workflow

### Local development commands

Recommended scripts:

```json
{
  "scripts": {
    "dev": "tsx src/mcp/server.ts",
    "build": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run test/unit",
    "test:contract": "vitest run test/contract",
    "test:golden": "vitest run test/golden",
    "validate-prompts": "tsx scripts/validate-prompts.ts"
  }
}
```

Exact tooling can use equivalent alternatives, but the capabilities should remain.

### Local prompt validation

`validate-prompts` should:

- read local `prompts/*.md`;
- parse frontmatter;
- validate schema;
- run global slug/alias checks;
- report drafts separately;
- fail non-zero for invalid active prompts or conflicts;
- not require ChatGPT or network access.

### Local tunnel

Slice 0 and early development may use a tunnel to expose the local MCP server over HTTPS.

The tunnel is development tooling, not production architecture.

### Coding-agent workflow

Each coding-agent task should specify:

- slice number;
- exact scope;
- non-goals;
- files/modules to touch;
- tests to write first;
- expected output contract;
- forbidden behavior;
- done criteria.

---

## 19. CI/quality gates

### Blocking deterministic gate

Run on every PR/commit:

- install;
- lint/format check;
- TypeScript typecheck;
- unit tests;
- contract tests;
- golden tests;
- local prompt schema validation;
- no-network tests for core logic.

### Deployment/readiness gate

Run before hosted deployment, not necessarily on every commit:

- deterministic CI gate;
- local MCP server smoke;
- live public source smoke;
- ChatGPT developer/tooling smoke if available;
- verify `@pl` routing still works;
- verify hosted HTTPS endpoint.

### CI failure policy

Fail CI if:

- invocation payload contains forbidden metadata;
- draft prompt appears in list/invoke/inspect;
- unknown command auto-executes suggestion;
- alias conflict is resolved by order/priority;
- invalid prompt is served;
- golden response shape changes without explicit review.

---

## 20. Implementation roadmap

### Roadmap overview

Use an invocation-first roadmap.

```text
Slice 0: Local hardcoded premise spike
Slice 1: Walking skeleton for invokePrompt with fixture source
Slice 2: Public prompt source + validation/cache/index
Slice 3: inspect/list tools
Slice 4: Local MVP with three real prompts
Slice 5: Personal-use trial
Slice 6: Hosted deployment, only if useful locally
```

### Slice 0 — premise validation spike

Goal:

> Prove ChatGPT can route `@pl proof` to the connector and apply a hardcoded returned prompt.

Scope:

- TypeScript local MCP server.
- One tool, likely named `invoke_prompt_library_command` or temporary proof equivalent.
- Hardcoded proof command: `proof`.
- Hardcoded prompt body.
- Local HTTPS tunnel.
- Three cooperative fresh-chat runs.

Proof prompt behavior:

```text
You are running the Project Prompt Library proof workflow.
Ask exactly one clarifying question about the user's input.
Do not answer or solve the user's topic yet.
End your response with: PPL-PROOF-001
```

Done when:

- explicit tool invocation works as sanity check;
- `@pl proof` command-style invocation works as product gate;
- ChatGPT asks exactly one clarifying question;
- ChatGPT does not answer the topic yet;
- ChatGPT appends `PPL-PROOF-001`;
- result is reproduced in three fresh cooperative chats.

Non-goals:

- GitHub;
- parsing;
- schema;
- cache;
- real prompts;
- list/inspect tools;
- hosting.

If Slice 0 fails:

- do not continue to Slice 1;
- try one short round of command-UX workaround phrasing;
- if no natural command-like pattern works, stop and redesign.

### Slice 1 — walking skeleton for `invoke_prompt_library_command`

Goal:

> Build one real invocation path from prompt file/source fixture to MCP response.

Scope:

- local fixture `PromptSource`;
- Markdown/frontmatter parser;
- schema validation;
- in-memory lookup;
- alias resolution;
- active-only invocation;
- reduced behavior projection;
- MCP-native response shape;
- unit tests TDD;
- contract/golden tests.

Fixtures:

- one valid active prompt;
- one draft prompt;
- one invalid prompt missing required field;
- one unknown command case;
- one alias case;
- one alias conflict case.

Done when:

- happy-path invocation returns exact reduced payload;
- draft is not invokable;
- unknown command fails closed;
- alias works;
- alias conflict fails closed;
- golden responses are stable.

### Slice 2 — public GitHub source + runtime cache/index

Goal:

> Replace fixture source with public GitHub source and implement cache/index behavior.

Scope:

- `PublicGitHubPromptSource`;
- load all `prompts/*.md`;
- 5-minute TTL;
- stale-while-revalidate;
- last-known-good behavior;
- partial valid cache behavior;
- cold failure behavior;
- local `validate-prompts` script.

Done when:

- core tests still run without network via fake source;
- source adapter has focused tests/mocks;
- integration smoke can read public prompt files;
- cache never replaces last-known-good with unsafe refresh.

### Slice 3 — add inspect and list tools

Goal:

> Complete ChatGPT-facing read-only API.

Scope:

- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- active-only inspection;
- active-only listing;
- no drafts exposed;
- no prompt bodies in list;
- inspection-only markers;
- contract/golden tests.

Done when:

- all three V1 tools work locally;
- draft prompts are never exposed;
- inspect cannot be mistaken for invoke.

### Slice 4 — local MVP with three real prompts

Goal:

> Make the connector useful locally with representative real prompts.

Initial real prompt set:

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

Done when:

- all three prompts invoke correctly;
- list shows all active commands;
- inspect verifies each prompt;
- local usage feels meaningfully useful;
- tests cover the real prompt files.

### Slice 5 — personal-use trial

Goal:

> Use locally for real workflows before hosting.

Scope:

- use connector in normal ChatGPT sessions;
- observe routing reliability;
- adjust tool descriptions if needed;
- improve prompt wording, not connector complexity;
- add remaining prompt set only if core remains stable.

Done when:

- user can use it for several real prompt workflows;
- no major command-routing issue remains;
- local usage justifies hosted deployment.

### Slice 6 — hosted deployment

Goal:

> Deploy stable HTTPS MCP endpoint after local MVP proves useful.

Scope:

- choose cheap/free-ish Node-compatible hosting;
- deploy MCP endpoint;
- run deployment smoke;
- verify ChatGPT connection;
- verify mobile/cross-device only if needed.

Deferred provider options:

- Render-style Node service;
- other ordinary Node host;
- Cloudflare Workers only if runtime compatibility is proven and worth it.

Done when:

- hosted endpoint works reliably;
- live smoke passes;
- local deterministic CI remains green.

---

## 21. Coding-agent work packages

### Work package 0 — Slice 0 premise spike

Objective:

Build a disposable local TypeScript MCP proof server with a hardcoded proof prompt.

Scope:

- one tool;
- hardcoded command `proof`;
- hardcoded prompt body;
- local dev startup docs;
- minimal manual test checklist.

Non-goals:

- GitHub;
- cache;
- parser;
- schema;
- real prompts;
- production structure.

Acceptance:

- ChatGPT can invoke proof tool;
- `@pl proof` routes correctly;
- proof prompt is applied in three cooperative fresh-chat runs.

### Work package 1 — prompt core TDD

Objective:

Implement core parser, schema validation, and reduced projection test-first.

Scope:

- domain types;
- frontmatter parser;
- schema validator;
- enum validation;
- reduced projection;
- unit tests first.

Acceptance:

- no network required;
- all core tests pass;
- invalid fixtures fail predictably;
- invocation projection contains only allowed fields.

### Work package 2 — lookup/index and invoke use case

Objective:

Implement slug/alias index and `InvokePromptUseCase`.

Scope:

- active prompt indexing;
- alias resolution;
- conflict detection;
- unknown-command suggestions;
- structured domain errors.

Acceptance:

- active prompt invokes;
- draft prompt fails;
- unknown command fails with `no_prompt_invoked`;
- alias conflict fails closed;
- golden tests pass.

### Work package 3 — MCP adapter for invocation

Objective:

Expose `invoke_prompt_library_command` via MCP-native tool response.

Scope:

- tool input schema;
- output schema;
- map use-case results to `structuredContent` and `content`;
- contract tests.

Acceptance:

- no custom outer transport envelope;
- prompt body is model-visible;
- visible receipt stays compact;
- output schema/golden tests pass.

### Work package 4 — public source and cache

Objective:

Add public GitHub prompt source and runtime cache.

Scope:

- `PromptSource` interface;
- `PublicGitHubPromptSource`;
- in-memory cache;
- 5-minute TTL;
- stale-while-revalidate;
- last-known-good preservation;
- local validation script.

Acceptance:

- fake source drives core tests;
- GitHub source has integration smoke;
- failed refresh does not destroy cache;
- no ChatGPT-facing refresh tool.

### Work package 5 — inspect and list tools

Objective:

Complete V1 ChatGPT-facing API.

Scope:

- `inspect_prompt_library_command`;
- `list_prompt_library_commands`;
- active-only behavior;
- contract/golden tests.

Acceptance:

- inspect returns full active prompt with `inspection_only`;
- list returns active summaries only;
- drafts are not exposed.

### Work package 6 — real prompt MVP

Objective:

Add the first three representative real prompts.

Scope:

- `handoff.md`;
- `grill-me.md`;
- `spec-prompt-creator.md`;
- metadata validation;
- local usage docs.

Acceptance:

- all three pass validation;
- all three invoke/list/inspect correctly;
- local MVP is usable for real workflows.

### Work package 7 — hosted deployment

Objective:

Deploy only after local MVP proves useful.

Scope:

- provider selection;
- HTTPS endpoint;
- deployment smoke;
- ChatGPT connection verification.

Acceptance:

- hosted endpoint works;
- live smoke passes;
- deterministic CI remains blocking gate.

---

## 22. QA-agent responsibilities

QA agents should verify the product boundaries as aggressively as the happy path.

### Slice 0 QA

- Verify explicit tool invocation works.
- Verify `@pl proof` routes to the tool.
- Verify exactly one clarifying question.
- Verify no topic answer yet.
- Verify `PPL-PROOF-001` marker.
- Record any routing failures.
- Treat conflicting/adversarial test as diagnostic only.

### Core QA

- Validate prompt files with good and bad fixtures.
- Verify drafts are never invokable.
- Verify invalid prompts are excluded.
- Verify alias collisions fail closed.
- Verify unknown command suggestions do not invoke.
- Verify reduced invocation payload contains no forbidden metadata.

### MCP contract QA

- Verify tool names.
- Verify input schemas.
- Verify output schemas.
- Verify `structuredContent` contains expected data.
- Verify `content` stays compact.
- Verify `_meta` is not needed for prompt application.

### Cache QA

- Verify fresh cache path.
- Verify stale cache path.
- Verify failed refresh preserves last-known-good.
- Verify cold source failure fails closed.
- Verify partial valid cache behavior.

### Runtime boundary QA

- Verify no cache refresh tool exists.
- Verify no draft listing exists.
- Verify no draft inspection exists.
- Verify no prompt editing exists.
- Verify no raw chat transcript input is requested.

---

## 23. Risks and mitigations

### Risk: `@pl` command-style routing does not work reliably

Mitigation:

- Slice 0 validates before implementation.
- Tool name is descriptive: `invoke_prompt_library_command`.
- Tool description should explicitly mention `@pl <command>` usage.
- If `@pl proof` fails, try a short round of more explicit command-like phrasing.
- If no natural phrasing works, redesign before building.

### Risk: returned prompt is retrieved but not applied

Mitigation:

- Slice 0 proof prompt forces observable behavior.
- Prompt body must be in model-visible `structuredContent` or `content`.
- Do not hide prompt body in `_meta`.
- Golden tests verify response shape; manual Slice 0 validates behavior.

### Risk: context pollution from metadata

Mitigation:

- Reduced invocation payload contains only `title`, `lifecycle`, `input_mode`, `prompt_body`.
- Debug/operational metadata excluded from normal invocation.
- Golden tests assert forbidden fields are absent.

### Risk: connector becomes prompt/admin platform

Mitigation:

- No write tools.
- No draft management in ChatGPT.
- No cache refresh tool.
- List active only.
- Inspect active only.
- Local tooling handles validation.

### Risk: runtime cache serves stale or invalid data

Mitigation:

- 5-minute TTL.
- Last-known-good cache.
- Failed refresh does not overwrite valid cache.
- Strict validation before cache acceptance.
- Invalid/conflicting prompts excluded.

### Risk: future private-suite needs are blocked

Mitigation:

- Use `PromptSource` boundary.
- Keep source details out of use cases.
- Do not hardcode public GitHub into domain/application logic.
- Document future DB/encryption needs, but do not implement them.

### Risk: TypeScript/SDK/platform changes

Mitigation:

- Keep MCP adapter thin.
- Keep core framework-independent.
- Contract tests isolate tool shape.
- Avoid UI widget dependency in V1.

### Risk: coding-agent implementation drift

Mitigation:

- Provide explicit module boundaries.
- Require TDD for unit-testable core.
- Use golden tests.
- Define forbidden behaviors.
- Use small implementation slices.

---

## 24. Open questions

These are not blockers for the first architecture plan.

1. Exact production hosting provider after local MVP.
2. Exact package manager: npm vs pnpm.
3. Exact HTTP runtime/server library for MCP endpoint.
4. Exact final tool descriptions after Slice 0 routing evidence.
5. Exact prompt body wording for `handoff`, `grill-me`, and `spec-prompt-creator`.
6. Whether the remaining initial prompts are added immediately after local MVP or after personal trial.
7. Future private-suite design:
   - user identity;
   - DB schema;
   - encryption model;
   - prompt visibility to model;
   - per-user command conflicts;
   - public/private precedence.
8. Whether a UI component ever becomes useful for browsing/inspection.

---

## 25. ADRs

## ADR: Validate connector premise before implementation

Status:  
Accepted

Context:  
The core product depends on ChatGPT being able to call a connector/MCP tool from a command-style user message and apply returned prompt content as behavior. GitHub fetching, parsing, and caching are ordinary implementation concerns; the unique risk is returned-prompt application.

Decision:  
Run Slice 0 before product implementation: a local TypeScript MCP server with a hardcoded `proof` prompt. Validate explicit invocation as a sanity check and `@pl proof` as the product gate.

Consequences:  
Positive: avoids building infrastructure around an unproven premise.  
Negative: delays real prompt-library implementation until manual platform behavior is proven.

Alternatives considered:  
Start with walking skeleton; build GitHub/parser first; assume MCP behavior works.

---

## ADR: Use TypeScript/Node for V1 connector

Status:  
Accepted

Context:  
The V1 risk is ChatGPT Apps/MCP integration, not enterprise backend complexity. TypeScript/Node is the smoother path for MCP/App connector work.

Decision:  
Use TypeScript/Node for V1.

Consequences:  
Positive: reduces platform friction; aligns with MCP/App SDK examples; keeps V1 small.  
Negative: not the user's default Java/Spring stack.

Alternatives considered:  
Java 21/Spring Boot; Python/FastAPI; spike both Java and TypeScript.

---

## ADR: Tool-only ChatGPT app, no UI widget in V1

Status:  
Accepted

Context:  
The product needs to fetch prompt definitions and return them to ChatGPT. It does not need custom UI to prove invocation.

Decision:  
Build a tool-only MCP/App connector in V1.

Consequences:  
Positive: smaller surface; faster validation; fewer UI/security concerns.  
Negative: no rich browsing/inspection UI.

Alternatives considered:  
Build a UI component for prompt browsing; build a full admin interface.

---

## ADR: Public GitHub command suite as V1 source of truth

Status:  
Accepted

Context:  
The V1 command suite is public/transparent. GitHub provides exact text, version history, diffs, rollback, and review workflow.

Decision:  
Use public GitHub as canonical source for V1 prompt files.

Consequences:  
Positive: simple and inspectable; no DB/auth required.  
Negative: not suitable for future private prompts.

Alternatives considered:  
Database-first storage; local files only; private GitHub suites.

---

## ADR: Future private suites are DB-backed, likely encrypted, not V1

Status:  
Accepted

Context:  
Future private prompts are expected, but not part of V1. The likely future model is DB-backed private suites, not private GitHub repositories.

Decision:  
Do not implement private suites in V1. Preserve only a small `PromptSource` boundary.

Consequences:  
Positive: avoids premature auth/encryption/user complexity.  
Negative: future private-suite work will require new architecture decisions.

Alternatives considered:  
Implement user tokens now; private GitHub source; multi-source merging in V1.

---

## ADR: Markdown with YAML frontmatter

Status:  
Accepted

Context:  
Prompt definitions need exact editable text plus machine-readable metadata.

Decision:  
Each prompt is a single Markdown file with YAML frontmatter and exact prompt body below.

Consequences:  
Positive: human-editable, GitHub-friendly, diffable, schema-validatable.  
Negative: parser/validation needed.

Alternatives considered:  
Pure YAML/JSON; split metadata/body files; plain Markdown only.

---

## ADR: Reduced invocation projection

Status:  
Accepted

Context:  
Normal invocation should not pollute the active chat context with operational metadata.

Decision:  
Normal invocation returns only `title`, `lifecycle`, `input_mode`, and exact `prompt_body` in model-visible structured payload.

Consequences:  
Positive: clear context hygiene; testable payload boundary.  
Negative: operational metadata requires explicit inspect/dev tooling.

Alternatives considered:  
Include slug/hash/version/source path in normal invocation; show full prompt visibly by default.

---

## ADR: Runtime cache, no database in V1

Status:  
Accepted

Context:  
V1 has public prompts, no user state, no writes, and simple lookup needs.

Decision:  
Use runtime in-memory cache with 5-minute TTL, stale-while-revalidate, and last-known-good behavior. Do not use a DB in V1.

Consequences:  
Positive: simple, fast, no second editable truth source.  
Negative: cache staleness up to 5 minutes; memory-only state.

Alternatives considered:  
Fetch every call; generated committed index; real database.

---

## ADR: Cache refresh is not ChatGPT-facing

Status:  
Accepted

Context:  
Manual cache refresh is runtime/admin behavior, not prompt invocation behavior.

Decision:  
Do not expose `refresh_prompt_library_cache` as a ChatGPT-facing tool.

Consequences:  
Positive: keeps API focused; avoids admin drift.  
Negative: prompt edits rely on TTL/restart/local tooling rather than chat command.

Alternatives considered:  
Expose refresh tool; expose detailed cache diagnostics.

---

## ADR: ChatGPT-facing tools are invoke, inspect, list only

Status:  
Accepted

Context:  
V1 API should support runtime prompt use without becoming prompt management.

Decision:  
Expose:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

Consequences:  
Positive: sufficient for invocation, verification, and discovery.  
Negative: no runtime cache control, no draft visibility, no editing.

Alternatives considered:  
Single generic tool; refresh tool; create/update/delete tools; draft/admin tools.

---

## ADR: Structured tool inputs, no raw command parser

Status:  
Accepted

Context:  
MCP tools are designed around declared input schemas. Requesting raw chat text would increase ambiguity and data collection.

Decision:  
`invoke_prompt_library_command` accepts structured input: `command` and optional `attached_input`. The connector does not parse raw `@pl` message text.

Consequences:  
Positive: cleaner API; easier testing; less data collection.  
Negative: depends on ChatGPT routing `@pl` command-style intent into tool arguments.

Alternatives considered:  
Raw `@pl` parser inside connector; command-specific tools.

---

## ADR: Fail closed with structured errors

Status:  
Accepted

Context:  
Exactness is central. Unknown or ambiguous commands must not result in guessed prompt execution.

Decision:  
Failed invocation returns structured error envelope inside `structuredContent` with `no_prompt_invoked: true`.

Consequences:  
Positive: unambiguous failure; golden-testable.  
Negative: slightly more response ceremony.

Alternatives considered:  
Plain text errors; exceptions; fuzzy auto-execution.

---

## ADR: Thin MCP adapter over framework-independent core

Status:  
Accepted

Context:  
MCP/App platform wiring may change. Prompt-library behavior should remain testable and portable.

Decision:  
Keep MCP adapter thin. Put parsing, validation, cache, lookup, projections, and use cases in framework-independent core modules.

Consequences:  
Positive: testability; coding-agent clarity; future platform flexibility.  
Negative: more files than a single-server prototype.

Alternatives considered:  
Single-file server; full enterprise layered backend.

---

## ADR: Invocation-first roadmap

Status:  
Accepted

Context:  
The central product path is invocation. Other tools and infrastructure should not precede it.

Decision:  
Use roadmap: Slice 0 proof, Slice 1 invoke walking skeleton, then source/cache, then inspect/list, then local MVP, then hosting.

Consequences:  
Positive: validates risk in order; avoids premature implementation.  
Negative: some useful supporting tools arrive later.

Alternatives considered:  
Tool-set-first roadmap; source/cache-first roadmap.

---

## 26. Next prompts

### Prompt for Slice 0 coding agent

```text
You are implementing Slice 0 for Project Prompt Library.

Goal:
Validate the core premise before product implementation: ChatGPT must be able to call a local MCP connector tool from a command-style request like `@pl proof`, receive a hardcoded proof prompt, and apply that prompt as behavior in the current conversation.

Scope:
- TypeScript/Node local MCP server.
- One tool, preferably named `invoke_prompt_library_command` unless the SDK setup requires a temporary simpler name.
- Structured input schema with `command: string` and optional `attached_input: string`.
- Hardcoded command: `proof`.
- Hardcoded proof prompt must instruct ChatGPT to ask exactly one clarifying question, not answer the topic yet, and end with `PPL-PROOF-001`.
- Use MCP-native response shape with model-visible prompt content in `structuredContent` or `content`.
- Provide local run instructions and tunnel/dev setup notes.

Non-goals:
- No GitHub.
- No Markdown parser.
- No YAML frontmatter.
- No cache.
- No real prompts.
- No list/inspect tools.
- No hosted deployment.

Acceptance criteria:
- Explicit tool invocation works as a sanity check.
- `@pl proof` command-style invocation works as the product gate.
- In three cooperative fresh chats, ChatGPT asks exactly one clarifying question, does not answer the topic yet, and ends with `PPL-PROOF-001`.
- If `@pl proof` fails, try only one short round of command-UX workaround phrasing and record results.
```

### Prompt for Slice 1 coding agent

```text
You are implementing Slice 1 for Project Prompt Library: the walking skeleton for `invoke_prompt_library_command`.

Goal:
Build one real invocation path from local fixture prompt files/source to MCP tool response.

Architecture constraints:
- TypeScript/Node.
- Thin MCP adapter over framework-independent core.
- No GitHub yet.
- No runtime DB.
- No inspect/list tools yet unless needed for test scaffolding.
- No raw `@pl` text parsing inside the connector.

Required core behavior:
- Parse Markdown with YAML frontmatter.
- Validate required schema fields.
- Validate lifecycle/input_mode/status enums.
- Build active prompt lookup by slug and aliases.
- Exclude drafts from invocation.
- Fail closed for invalid prompts, unknown commands, and alias conflicts.
- Return reduced invocation payload only: `title`, `lifecycle`, `input_mode`, `prompt_body`.
- Failed invocation must include `no_prompt_invoked: true`.

Testing:
- Use TDD for unit-testable core modules.
- Add unit tests, MCP/tool contract tests, and fixture-based golden tests.
- Fixture set must include one valid active prompt, one draft prompt, one invalid prompt missing a required field, one unknown command case, one alias case, and one alias conflict case.

Acceptance criteria:
- Happy path returns exact prompt body in model-visible structured content.
- Normal invocation output contains no slug/hash/version/source/debug metadata.
- Draft prompt is not invokable.
- Unknown command fails closed with optional non-executing suggestions.
- Alias conflict fails closed.
- Golden tests assert exact success/failure response shapes.
```

### Prompt for QA agent after Slice 1

```text
You are QA-reviewing Slice 1 of Project Prompt Library.

Focus on safety boundaries and contract drift, not just happy path.

Verify:
- `invoke_prompt_library_command` accepts structured `command` and optional `attached_input`.
- The connector does not parse raw `@pl` chat text.
- Success response uses MCP-native result shape with model-visible prompt payload.
- Invocation payload contains only `title`, `lifecycle`, `input_mode`, and `prompt_body`.
- No operational metadata leaks into normal invocation.
- Draft prompts are never invokable.
- Invalid prompts are excluded.
- Unknown commands fail with `no_prompt_invoked: true`.
- Suggestions never auto-execute.
- Alias collisions fail closed.
- Unit, contract, and golden tests cover these cases.

Report:
- pass/fail by category;
- any contract drift;
- any overbuild beyond Slice 1 scope;
- any missing tests before proceeding to Slice 2.
```

### Prompt for architecture review agent

```text
Review the Project Prompt Library architecture plan for coherence and implementation risk.

Pay special attention to:
- whether Slice 0 truly validates the unique product premise;
- whether V1 avoids prompt-management/admin drift;
- whether the MCP adapter/core boundary is clear enough for coding agents;
- whether response schemas preserve context hygiene;
- whether future private DB-backed suites are preserved only as a future seam, not overbuilt now;
- whether the roadmap slices are independently implementable and testable.

Do not propose SaaS, marketplace, analytics, workflow orchestration, semantic routing, or prompt editing features unless they directly address a flaw in the current V1 architecture.

Return:
- critical issues;
- medium risks;
- suggested clarifications;
- decision changes, only if necessary.
```

---

# Handoff to Spec & Prompt Creator

Project:  
Project Prompt Library

Architecture decision summary:  
Build a TypeScript/Node ChatGPT Apps/MCP connector for a public Prompt Library command suite. V1 is tool-only and retrieval-focused. Prompts live as Markdown files with YAML frontmatter in a flat public GitHub `prompts/*.md` directory. The connector exposes only three ChatGPT-facing tools: `invoke_prompt_library_command`, `inspect_prompt_library_command`, and `list_prompt_library_commands`. Normal invocation returns a reduced behavior-facing payload containing only `title`, `lifecycle`, `input_mode`, and exact `prompt_body`. Drafts, cache refresh, prompt editing, admin workflows, private suites, DB storage, and user auth are excluded from V1. Before real implementation, Slice 0 must validate that ChatGPT can invoke a local connector via `@pl proof` and apply a hardcoded returned prompt.

Recommended next artifact:  
Coding-agent prompt for Slice 0 premise validation.

First implementation slice:  
Slice 0 — disposable local hardcoded MCP proof server.

Scope:  
Included:

- TypeScript/Node local MCP server.
- One hardcoded proof command.
- Structured input with `command` and optional `attached_input`.
- MCP-native tool result.
- Model-visible hardcoded proof prompt.
- Local tunnel/developer setup.
- Manual validation checklist with three cooperative fresh-chat runs.

Non-goals:  
Excluded:

- GitHub fetching.
- Markdown/frontmatter parsing.
- Schema validation.
- Runtime cache.
- Real prompt files.
- Inspect/list tools.
- Prompt editing.
- Draft management.
- Hosted deployment.
- Private prompt suites.

Relevant architecture:  
The final architecture will use:

- TypeScript/Node MCP/App connector.
- Thin MCP adapter over framework-independent core.
- `PromptSource` seam with only `PublicGitHubPromptSource` in V1.
- Markdown prompt files with YAML frontmatter.
- Runtime in-memory cache with 5-minute TTL and stale-while-revalidate.
- Reduced invocation projection.
- Active-only invoke/list/inspect tools.

Testing expectations:  
For Slice 0:

- manual premise validation is primary;
- explicit tool invocation sanity check;
- `@pl proof` command-style invocation as product gate;
- three cooperative fresh-chat runs;
- optional messy run diagnostic only.

For later slices:

- TDD for core unit tests;
- MCP/tool contract tests;
- fixture-based golden tests;
- deterministic CI gates.

Risks:  
Primary risk is that ChatGPT may not reliably route `@pl proof` into the connector or may retrieve but not apply the returned prompt. If Slice 0 fails, stop and redesign before implementing parser/cache/source infrastructure. Secondary risks include metadata leakage, accidental prompt-management/admin drift, alias ambiguity, stale cache behavior, and future private-suite assumptions creeping into V1.

Suggested prompt request:  
Create a coding-agent prompt for Slice 0 of Project Prompt Library. The goal is to build a disposable local TypeScript/Node MCP proof server that exposes one hardcoded prompt invocation tool. The proof must validate whether ChatGPT can route `@pl proof` into the connector, receive a hardcoded prompt, and apply it as behavior by asking exactly one clarifying question, not answering the topic yet, and ending with `PPL-PROOF-001`. The prompt should include scope, non-goals, files/modules if appropriate, MCP-native response expectations, manual validation checklist, and acceptance criteria. Do not include GitHub, Markdown parsing, cache, schema validation, real prompts, hosted deployment, or private-suite design.
