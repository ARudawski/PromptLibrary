# Prompt Source Infrastructure

Prompt source adapters live here.

Current source boundary files:

```text
LoadedPromptFile.ts
PromptSource.ts
LocalFixturePromptSource.ts
PublicGitHubPromptSource.ts
```

Test-only helpers live outside production source:

```text
test/helpers/FakePromptSource.ts
```

## Source Boundary

The production boundary is:

```ts
interface PromptSource {
  loadAllPrompts(): Promise<readonly LoadedPromptFile[]>;
}
```

`LoadedPromptFile` is intentionally minimal:

```ts
interface LoadedPromptFile {
  readonly sourcePath: string;
  readonly rawMarkdown: string;
}
```

Prompt sources load raw Markdown files only. They do not parse frontmatter,
validate prompt metadata, decide invokability, build indexes, format MCP
responses, merge sources, or own cache state.

## Current ALJ-33 behavior

`PublicGitHubPromptSource` implements `PromptSource` for the V1 public GitHub
source. It is an infrastructure adapter only.

Configuration is passed to the constructor:

```ts
new PublicGitHubPromptSource({
  owner: "ARudawski",
  repo: "PromptLibrary",
  ref: "main",
  promptsPath: "prompts",
});
```

Defaults:

```text
ref: main
promptsPath: prompts
apiBaseUrl: https://api.github.com
userAgent: project-prompt-library
```

The adapter uses the public GitHub Contents API to list the configured prompt
path, filters flat Markdown files, fetches each file's raw `download_url`, and
returns `LoadedPromptFile` values containing only:

```text
sourcePath
rawMarkdown
```

Source failures are mapped to `PublicGitHubPromptSourceError` with a stable
`code`, and file failures include `sourcePath` for later cache behavior. The
adapter does not authenticate, use tokens, cache data, parse Markdown, validate
frontmatter, decide invokability, expose diagnostics through ChatGPT, or wire
itself into the fixture-backed MCP runtime.

Default unit tests inject a fake fetch function and do not hit the network.

## Earlier ALJ-29 behavior

`PromptSource` and `LoadedPromptFile` are formal production interfaces.

`LocalFixturePromptSource` implements `PromptSource` and loads raw Markdown from
local Slice 1 test fixtures only. It does not fetch GitHub or implement runtime
cache behavior.

`FakePromptSource` is a test helper for deterministic source/cache tests. It
returns caller-provided `LoadedPromptFile` values and does not read from the
filesystem or network.

Rules:

- public GitHub source is infrastructure only;
- no private/DB source implementation in V1;
- no multi-source merge logic in V1;
- application/core code should depend on `PromptSource`, not GitHub directly.

## Earlier ALJ-18 behavior

`LocalFixturePromptSource` loads raw Markdown from the local Slice 1 test
fixtures only. It does not parse Markdown, validate prompt metadata, decide
invokability, merge sources, fetch GitHub, or format MCP responses.

The default fixture set contains the active and draft valid fixtures needed for
the fixture-backed invoke adapter. Contract tests may pass an explicit fixture
path list to exercise conflict behavior deterministically.
