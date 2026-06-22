# Application Layer

Use cases live here.

Current files:

```text
createFixtureBackedInvokePromptUseCase.ts
createFixtureBackedInspectPromptUseCase.ts
loadFixtureBackedPromptDefinitions.ts
InvokePromptUseCase.ts
InspectPromptUseCase.ts
ListPromptsUseCase.ts
```

## Current ALJ-17 behavior

`InvokePromptUseCase` accepts an explicit tool command string and resolves it
through the derived prompt index.

Implemented behavior:

- active slug invocation returns the reduced invocation payload;
- active alias invocation returns the same reduced invocation payload;
- draft and status-less prompts fail closed as not invokable;
- conflicted commands fail closed as ambiguous;
- unknown commands fail closed and may include active-only non-executing
  suggestions;
- invalid prompt files must fail definition validation before they reach the use
  case.

Rules:

- may orchestrate domain/cache/source/projection behavior;
- must not import MCP SDK types;
- must not parse raw `@pl` text;
- must not perform direct network calls;
- must return typed success/failure results for adapters to map.

## Current ALJ-18 behavior

`loadFixtureBackedPromptDefinitions` composes the local fixture source, Markdown
parser, prompt definition validator, and collection validator once for the
fixture-backed MCP adapter.

`createFixtureBackedInvokePromptUseCase` and
`createFixtureBackedInspectPromptUseCase` build invoke and inspect use cases from
that shared prompt snapshot.

Invalid or unparsable fixture files do not enter the use-case index. Collection
conflicts are still handled by the derived prompt index and fail closed at
invocation time.

## Current Slice 3.1 behavior

`InspectPromptUseCase` accepts an explicit tool command string and resolves it
through the derived active prompt index.

Implemented behavior:

- active slug inspection returns full active prompt metadata and prompt body;
- active alias inspection returns the same inspection data;
- draft and status-less prompts fail closed as not invokable;
- conflicted commands fail closed as ambiguous;
- unknown commands fail closed and may include active-only non-executing
  suggestions;
- successful inspection includes `inspection_only: true` and
  `no_prompt_invoked: true`;
- inspection does not invoke or apply a prompt.

## Current Slice 3.3 behavior

`ListPromptsUseCase` lists active invokable prompt commands through the derived
prompt index.

Implemented behavior:

- active prompts appear once by canonical command slug;
- aliases appear as summary metadata, not duplicate list entries;
- draft and status-less prompts do not appear;
- conflicted prompt commands do not appear as invokable summaries;
- summaries are sorted deterministically by `command`;
- summaries contain only `command`, `title`, `description`, `aliases`,
  `lifecycle`, and `input_mode`;
- prompt bodies, source/cache diagnostics, validation diagnostics, and
  operational metadata are not returned.
