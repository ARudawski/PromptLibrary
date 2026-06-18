# Slice 0 - Local MCP Premise Proof

Status: implementation ready for manual validation

## Purpose

Validate the unique product premise before building the real prompt-library
architecture:

> ChatGPT can route `@pl proof` into a local MCP connector, receive a hardcoded
> model-visible prompt, and apply that prompt as behavior.

If this fails, stop and redesign before implementing parser/cache/GitHub/schema
work.

## Scope

Allowed in Slice 0:

- local TypeScript/Node MCP server;
- one hardcoded proof command;
- structured input with `command` and optional `attached_input`;
- model-visible hardcoded proof prompt;
- local tunnel/developer setup notes;
- manual validation checklist.

Excluded from Slice 0:

- GitHub prompt source;
- Markdown/frontmatter parsing;
- prompt schema validation beyond minimal proof tool input;
- runtime cache;
- real prompt files;
- inspect/list tools;
- hosted deployment;
- private-suite/auth/database design.

## Local Run

Install dependencies:

```bash
npm install
```

Run deterministic checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
```

Start the local stdio MCP proof server for an MCP client:

```bash
npm --silent run dev
```

The server registers one tool:

```text
invoke_prompt_library_command
```

The tool accepts:

```json
{
  "command": "proof",
  "attached_input": "I want to build a small app that..."
}
```

`attached_input` is optional. Slice 0 does not parse raw `@pl` chat text inside
the connector; ChatGPT/tool routing must provide structured tool arguments.

## MCP Client Setup Notes

Use a local MCP client/developer setup that can launch this repository with:

```bash
npm --silent run dev
```

Because the server uses stdio transport, a compatible MCP client should start the
process directly rather than call an HTTP URL. The `--silent` flag matters for
stdio clients because normal npm banners are written to stdout and can corrupt
JSON-RPC traffic.

Example client command configuration:

```json
{
  "command": "npm",
  "args": ["--silent", "run", "dev"],
  "cwd": "<absolute path to this repository>"
}
```

Equivalent direct command configuration:

```json
{
  "command": "npx",
  "args": ["tsx", "src/mcp/server.ts"],
  "cwd": "<absolute path to this repository>"
}
```

If your ChatGPT developer setup requires an HTTPS endpoint instead of stdio, use
the platform-recommended bridge/tunnel for local MCP servers and record the exact
steps here before running the proof. Do not add hosted deployment or production
infrastructure for Slice 0.

## Proof Command

Expected user message:

```text
@pl proof

I want to build a small app that...
```

Expected structured tool input:

```json
{
  "command": "proof",
  "attached_input": "I want to build a small app that..."
}
```

## Hardcoded Proof Prompt

```text
You are running the Project Prompt Library proof workflow.
Ask exactly one clarifying question about the user's input.
Do not answer or solve the user's topic yet.
End your response with: PPL-PROOF-001
```

The proof prompt must be model-visible in `structuredContent.prompt_body` or
`content`. It must not be hidden only in `_meta`.

## Explicit Tool Invocation Sanity Check

Before testing natural `@pl proof` routing, perform one direct/explicit tool call
if the client supports it.

- Date/time:
- Client/setup:
- Tool called:
- Tool arguments:
- `structuredContent.prompt_body` present:
- Visible content includes `PPL-PROOF-001`:
- Unknown command returns `no_prompt_invoked: true`:
- Pass/fail:
- Notes:

This sanity check verifies the connector shape only. It does not prove the product
premise by itself.

## Success Criteria

Slice 0 passes only if `@pl proof` works in three cooperative fresh chats.

Each successful run must show that ChatGPT:

1. routes `@pl proof` into the connector tool;
2. receives the hardcoded proof prompt;
3. asks exactly one clarifying question;
4. does not answer or solve the topic yet;
5. ends with `PPL-PROOF-001`.

Explicit/manual tool invocation may be used as a platform sanity check, but
`@pl proof` is the product-relevance gate.

## Optional Diagnostic

A messy/conflicting input may be tested once, but it is diagnostic only. It must
not decide whether Slice 0 passes.

## Result Log

### Run 1

- Date/time:
- Fresh chat:
- Input:
- Tool called:
- Tool arguments:
- Prompt body model-visible:
- Assistant asked exactly one clarifying question:
- Assistant did not answer/solve the topic:
- Marker present:
- Pass/fail:
- Notes:

### Run 2

- Date/time:
- Fresh chat:
- Input:
- Tool called:
- Tool arguments:
- Prompt body model-visible:
- Assistant asked exactly one clarifying question:
- Assistant did not answer/solve the topic:
- Marker present:
- Pass/fail:
- Notes:

### Run 3

- Date/time:
- Fresh chat:
- Input:
- Tool called:
- Tool arguments:
- Prompt body model-visible:
- Assistant asked exactly one clarifying question:
- Assistant did not answer/solve the topic:
- Marker present:
- Pass/fail:
- Notes:

## Failure Rule

If `@pl proof` fails, try only one short round of more explicit command-style
phrasing.

If no natural command-like phrasing works, stop implementation and revise the
architecture.
