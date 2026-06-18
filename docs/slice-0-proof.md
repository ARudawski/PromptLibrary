# Slice 0 — Local MCP Premise Proof

Status: implemented; product validation pending

## Purpose

Validate the unique product premise before building the real prompt-library architecture:

> ChatGPT can route `@pl proof` into a local MCP connector, receive a hardcoded model-visible prompt, and apply that prompt as behavior.

If this fails, stop and redesign before implementing parser/cache/GitHub/schema work.

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
- prompt schema validation;
- runtime cache;
- real prompt files;
- inspect/list tools;
- hosted deployment;
- private-suite/auth/database design.

## Local server

The disposable Slice 0 server is `src/mcp/server.ts`. It exposes exactly one runtime tool:

```text
invoke_prompt_library_command
```

The tool accepts:

```json
{
  "command": "proof",
  "attached_input": "optional user text"
}
```

Only `command: "proof"` is supported. Unknown commands fail closed with `no_prompt_invoked: true` and do not return a `prompt_body`.

## Local run steps

1. Install dependencies if they are not present:

   ```sh
   npm install
   ```

2. Start the local stdio MCP server:

   ```sh
   npm run dev
   ```

3. Configure the ChatGPT developer/MCP connection to launch this local command from the repository root:

   ```sh
   npm run dev
   ```

The server uses stdio transport, so it is intended to be spawned by an MCP-compatible client. It does not open an HTTP port by itself.

## Tunnel / developer setup notes

- Stdio-based local MCP clients can launch the command directly and do not need a tunnel.
- If the ChatGPT developer setup requires a public HTTPS endpoint instead of stdio, use a short-lived tunnel or MCP proxy that forwards to this local server without changing the tool contract.
- Do not add hosted deployment, auth, database, cache, parser, GitHub source, inspect/list tools, or real prompt files for Slice 0.
- Record the exact client setup and any command-routing workaround in the result log below.

## Proof command

Expected command:

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

## Hardcoded proof prompt

```text
You are running the Project Prompt Library proof workflow.
Ask exactly one clarifying question about the user's input.
Do not answer or solve the user's topic yet.
End your response with: PPL-PROOF-001
```

The proof prompt must be model-visible in `structuredContent.prompt_body` and/or `content`; it must not be hidden only in `_meta`.

## Explicit tool invocation sanity check

Use any MCP-compatible client that can call tools directly. Call:

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": {
    "command": "proof",
    "attached_input": "I want to build a small app that helps me review ideas."
  }
}
```

Expected result:

- `structuredContent.title` is `Project Prompt Library Proof`;
- `structuredContent.lifecycle` is `one_shot_proof`;
- `structuredContent.input_mode` is `optional_attached_input`;
- `structuredContent.prompt_body` exactly matches the hardcoded proof prompt;
- visible `content` is compact and includes the proof prompt for model visibility.

Unknown-command sanity check:

```json
{
  "name": "invoke_prompt_library_command",
  "arguments": {
    "command": "grill-me"
  }
}
```

Expected result:

- `isError: true`;
- `structuredContent.no_prompt_invoked: true`;
- no `prompt_body` is returned.

## Success criteria

Slice 0 passes only if `@pl proof` works in three cooperative fresh chats.

Each successful run must show that ChatGPT:

1. routes `@pl proof` into the connector tool;
2. receives the hardcoded proof prompt;
3. asks exactly one clarifying question;
4. does not answer or solve the topic yet;
5. ends with `PPL-PROOF-001`.

Explicit/manual tool invocation may be used as a platform sanity check, but `@pl proof` is the product-relevance gate.

## Optional diagnostic

A messy/conflicting input may be tested once, but it is diagnostic only. It must not decide whether Slice 0 passes.

## Result log

### Environment

- Date/time:
- Operator:
- Branch/commit:
- Node version:
- Install command/result:
- Server command/result:
- Client/developer setup used:
- Tunnel/proxy used, if any:
- Notes:

### Explicit tool invocation

- Date/time:
- Tool called:
- Tool arguments:
- Prompt body model-visible in `structuredContent` or `content`:
- Unknown command failed closed:
- Pass/fail/not run:
- Evidence/notes:

### Run 1

- Date/time:
- Fresh chat confirmed:
- Input:
- Tool called:
- Tool arguments:
- Assistant asked exactly one clarifying question:
- Assistant avoided answering/solving topic:
- Marker present:
- Pass/fail/not run:
- Evidence/notes:

### Run 2

- Date/time:
- Fresh chat confirmed:
- Input:
- Tool called:
- Tool arguments:
- Assistant asked exactly one clarifying question:
- Assistant avoided answering/solving topic:
- Marker present:
- Pass/fail/not run:
- Evidence/notes:

### Run 3

- Date/time:
- Fresh chat confirmed:
- Input:
- Tool called:
- Tool arguments:
- Assistant asked exactly one clarifying question:
- Assistant avoided answering/solving topic:
- Marker present:
- Pass/fail/not run:
- Evidence/notes:

## Failure rule

If `@pl proof` fails, try only one short round of more explicit command-style phrasing.

If no natural command-like phrasing works, stop implementation and revise the architecture.
