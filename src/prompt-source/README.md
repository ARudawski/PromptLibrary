# Prompt Source Infrastructure

Prompt source adapters live here.

Expected future files:

```text
PromptSource.ts
PublicGitHubPromptSource.ts
LoadedPromptFile.ts
```

V1 should expose only a small source boundary:

```ts
interface PromptSource {
  loadAllPrompts(): Promise<LoadedPromptFile[]>;
}
```

Rules:

- public GitHub source is infrastructure only;
- no private/DB source implementation in V1;
- no multi-source merge logic in V1;
- application/core code should depend on `PromptSource`, not GitHub directly.

## Current ALJ-18 behavior

`LocalFixturePromptSource` loads raw Markdown from the local Slice 1 test
fixtures only. It does not parse Markdown, validate prompt metadata, decide
invokability, merge sources, fetch GitHub, or format MCP responses.

The default fixture set contains the active and draft valid fixtures needed for
the fixture-backed invoke adapter. Contract tests may pass an explicit fixture
path list to exercise conflict behavior deterministically.
