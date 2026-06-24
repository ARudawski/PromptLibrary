# Local MVP Walkthrough

Status: Slice 4.5 local MVP walkthrough

This walkthrough verifies the local Project Prompt Library MVP with the three
approved active prompts:

```text
handoff
grill-me
spec-prompt-creator
```

It uses the local `prompts/*.md` runtime source. It does not require GitHub,
ChatGPT, a tunnel, hosted deployment, private suites, auth, or a database.

If a ChatGPT development app or connector is used as an extra platform smoke
surface, first verify it against
[`chatgpt-app-schema.md`](./chatgpt-app-schema.md). Do not use the historical
`Project Prompt Library Local Proof` proof-only app as evidence for the current
local MVP.

## Setup

Install dependencies from the repository root:

```bash
npm install
```

Use Node 22 or newer. The repository scripts are defined in `package.json`.

## Validate Local Prompt Files

Run:

```bash
npm run validate-prompts
```

Expected result for the local MVP:

```text
validate-prompts: OK
files: 3
valid: 3
active: 3
drafts: 0
statusless: 0
```

The exact `prompts_dir` path depends on the local checkout. Any validation
failure means the local MVP is not ready.

## Run The Local MCP Server

The local server is a stdio MCP server. It should be launched by an MCP client,
not used as an interactive shell. Do not type raw `@pl ...` text into the
server process; the connector expects structured MCP tool calls.

To start only the server process:

```bash
npm run dev
```

The server uses stdio transport and loads prompt files from the repository
`prompts/` directory through the local prompt source. It registers exactly these
ChatGPT-facing tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

## Call The Local MCP Tools

Run this one-off PowerShell client from the repository root to spawn the local
stdio server and call the three approved tools:

```powershell
@'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "local-mvp-walkthrough", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: process.platform === "win32" ? "npm.cmd" : "npm",
  args: ["run", "dev"],
});

const calls = [
  ["invoke handoff", "invoke_prompt_library_command", { command: "handoff" }],
  ["invoke grill-me", "invoke_prompt_library_command", { command: "grill-me" }],
  ["invoke grill alias", "invoke_prompt_library_command", { command: "grill" }],
  [
    "invoke spec-prompt-creator",
    "invoke_prompt_library_command",
    { command: "spec-prompt-creator" },
  ],
  [
    "invoke spec-creator alias",
    "invoke_prompt_library_command",
    { command: "spec-creator" },
  ],
  [
    "invoke prompt-creator alias",
    "invoke_prompt_library_command",
    { command: "prompt-creator" },
  ],
  ["inspect handoff", "inspect_prompt_library_command", { command: "handoff" }],
  ["inspect grill alias", "inspect_prompt_library_command", { command: "grill" }],
  [
    "inspect prompt-creator alias",
    "inspect_prompt_library_command",
    { command: "prompt-creator" },
  ],
  ["list commands", "list_prompt_library_commands", {}],
];

await client.connect(transport);
try {
  const tools = await client.listTools();
  console.log(
    "tools:",
    tools.tools.map((tool) => tool.name).sort(),
  );

  for (const [label, name, args] of calls) {
    const result = await client.callTool({ name, arguments: args });
    console.log(`\n${label}`);
    console.log(JSON.stringify(summarize(result), null, 2));
  }
} finally {
  await client.close();
}

function summarize(result) {
  const structuredContent = summarizeStructuredContent(result.structuredContent);

  return {
    isError: result.isError === true,
    structuredContent,
    content: result.content,
  };
}

function summarizeStructuredContent(value) {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  const summary = { ...value };
  if (typeof summary.prompt_body === "string") {
    summary.prompt_body = `[${summary.prompt_body.length} chars]`;
  }
  return summary;
}
'@ | node --input-type=module
```

The client uses the MCP SDK `StdioClientTransport`, so this is a real local MCP
path over JSON-RPC stdio. GitHub, ChatGPT, tunnels, hosted deployment, private
suites, auth, and a database are still not required for this walkthrough.

## Invoke The MVP Prompts

Invocation resolves a canonical command or alias and returns the reduced
model-visible payload:

```json
{
  "title": "Grill Me",
  "lifecycle": "interactive_workflow",
  "input_mode": "either",
  "prompt_body": "..."
}
```

The normal invocation payload contains only:

```text
title
lifecycle
input_mode
prompt_body
```

Expected local MCP tool calls:

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": { "command": "handoff" }
}
```

Returns `Handoff`, lifecycle `one_shot`, input mode
`conversation_context`, and the handoff prompt body.

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": { "command": "grill-me" }
}
```

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": { "command": "grill" }
}
```

Both resolve to `Grill Me`, lifecycle `interactive_workflow`, input mode
`either`, and the same prompt body.

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": { "command": "spec-prompt-creator" }
}
```

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": { "command": "spec-creator" }
}
```

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": { "command": "prompt-creator" }
}
```

All three resolve to `Spec & Prompt Creator`, lifecycle
`persistent_mode`, input mode `either`, and the same prompt body.

Normal invocation must not expose slug, aliases, description, status, source
paths, cache diagnostics, validation diagnostics, debug markers, prompt
versions, or timestamps.

## Inspect The MVP Prompts

Inspection is for reading an active prompt definition without applying it as
behavior. It must return:

```json
{
  "ok": true,
  "type": "prompt_inspection",
  "inspection_only": true,
  "no_prompt_invoked": true
}
```

Expected local MCP tool calls:

```json
{
  "name": "inspect_prompt_library_command",
  "arguments": { "command": "handoff" }
}
```

```json
{
  "name": "inspect_prompt_library_command",
  "arguments": { "command": "grill-me" }
}
```

```json
{
  "name": "inspect_prompt_library_command",
  "arguments": { "command": "grill" }
}
```

```json
{
  "name": "inspect_prompt_library_command",
  "arguments": { "command": "spec-prompt-creator" }
}
```

```json
{
  "name": "inspect_prompt_library_command",
  "arguments": { "command": "spec-creator" }
}
```

```json
{
  "name": "inspect_prompt_library_command",
  "arguments": { "command": "prompt-creator" }
}
```

Aliases inspect the same canonical prompt metadata and body as their canonical
commands. Inspection must always remain inspection-only and must not invoke the
prompt as behavior.

## List Available Commands

Expected local MCP tool call:

```json
{
  "name": "list_prompt_library_commands",
  "arguments": {}
}
```

Listing returns active canonical commands only:

```text
grill-me
handoff
spec-prompt-creator
```

The aliases are metadata on their canonical commands:

```text
grill-me aliases: grill
handoff aliases: none
spec-prompt-creator aliases: spec-creator, prompt-creator
```

Aliases must not appear as duplicate list entries. List output must not include
prompt bodies, source/cache diagnostics, validation diagnostics, debug markers,
prompt versions, timestamps, draft prompts, or admin/debug inventory.

## Deterministic Checks

Run the full PL-109 local gate:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:unit
npm run test:contract
npm run test:golden
npm run validate-prompts
```

`test:contract` verifies the three-prompt local MVP behavior through the MCP
tools. `test:golden` freezes the approved local MVP tool payloads and prompt
body hashes, and guards that the tests do not call network fetch.

## Known Limitations

- This is a local MVP. Hosted deployment is not implemented.
- The command suite is public local prompt files for V1. Private suites, auth,
  OAuth, user accounts, database behavior, and encrypted private prompts are not
  implemented.
- The connector retrieves prompt definitions. It does not execute workflows,
  manage conversation state, compose prompts, select prompts semantically, edit
  prompts, manage drafts, or expose cache/admin/debug controls through ChatGPT.
- Live ChatGPT routing and tunnel smoke checks are outside this deterministic
  local walkthrough unless a later issue explicitly asks for them.
- ChatGPT app/action settings for the current MVP must match
  [`chatgpt-app-schema.md`](./chatgpt-app-schema.md); proof-only settings that
  support only `proof` are historical Slice 0 evidence, not the M5 trial
  surface.
