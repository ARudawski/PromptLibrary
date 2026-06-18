# Slice 0 — Local MCP Premise Proof

Status: planned

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

### Run 1

- Date/time:
- Input:
- Tool called:
- Tool arguments:
- Assistant behavior:
- Marker present:
- Pass/fail:
- Notes:

### Run 2

- Date/time:
- Input:
- Tool called:
- Tool arguments:
- Assistant behavior:
- Marker present:
- Pass/fail:
- Notes:

### Run 3

- Date/time:
- Input:
- Tool called:
- Tool arguments:
- Assistant behavior:
- Marker present:
- Pass/fail:
- Notes:

## Failure rule

If `@pl proof` fails, try only one short round of more explicit command-style phrasing.

If no natural command-like phrasing works, stop implementation and revise the architecture.
