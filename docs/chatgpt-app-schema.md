# ChatGPT App Schema Setup

Status: PL-132 current local MVP schema handoff

This document is the copy-paste reference for updating the ChatGPT development
app or connector so it describes the current Project Prompt Library local MVP
surface instead of the old Slice 0 proof-only surface.

Use this when ChatGPT app/action settings still say:

```text
Slice 0 proof tool for explicit Prompt Library commands such as @pl proof.
Supports only command: proof.
```

That wording is obsolete for the M5 trial surface. The old `Project Prompt
Library Local Proof` app/connector represents the historical Slice 0 proof only
and is not the current local MVP surface.

## Current Surface

The current local MCP server exposes exactly these ChatGPT-facing tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

Approved commands and aliases:

| Canonical command | Aliases | Invocation behavior |
|---|---|---|
| `handoff` | none | Return the Handoff prompt for ChatGPT to apply. |
| `grill-me` | `grill` | Return the Grill Me prompt for ChatGPT to apply. |
| `spec-prompt-creator` | `spec-creator`, `prompt-creator` | Return the Spec & Prompt Creator prompt for ChatGPT to apply. |

Non-goals remain blocked: no cache/admin/debug tools, prompt editing, drafts,
private suites, auth/OAuth, DB, semantic routing, workflow/session state,
hosting, or additional prompts.

## Update Path

1. Open the ChatGPT development app or connector settings for the Prompt Library
   surface used in trial runs.
2. If the app is named `Project Prompt Library Local Proof`, replace it with a
   current Prompt Library app/connector or update its displayed name and action
   definitions so it no longer describes Slice 0 proof-only behavior.
3. The action list must contain exactly the three tools in this document.
4. Remove any proof-only action description or schema that restricts `command`
   to `proof`.
5. If the settings UI accepts per-action input and output schemas, paste the
   schemas from the sections below.
6. Save the app/connector settings.
7. Verify that the visible tool descriptions match this document before running
   PL-123 trial evidence through a ChatGPT platform surface.

This repository does not implement hosted deployment or tunnel infrastructure.
If a tunnel is used to connect ChatGPT to the local stdio MCP server, the tunnel
is setup-only evidence and must point at the current local server from this
repository. Do not treat a tunnel URL or the old proof app as product behavior.

## Tool: invoke_prompt_library_command

Title:

```text
Invoke Prompt Library Command
```

Description:

```text
Invokes an active Prompt Library command by exact slug or alias and returns the stored prompt content for ChatGPT to apply.
```

Input schema:

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "minLength": 1,
      "description": "Prompt Library command to invoke."
    },
    "attached_input": {
      "type": "string",
      "description": "Optional user text attached to the command."
    }
  },
  "required": ["command"],
  "additionalProperties": false,
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

Output schema:

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "lifecycle": {
      "type": "string",
      "enum": ["persistent_mode", "interactive_workflow", "one_shot"]
    },
    "input_mode": {
      "type": "string",
      "enum": ["attached_input", "conversation_context", "either"]
    },
    "prompt_body": {
      "type": "string"
    }
  },
  "required": ["title", "lifecycle", "input_mode", "prompt_body"],
  "additionalProperties": false,
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

Verification examples:

```json
{ "command": "handoff" }
```

```json
{ "command": "grill" }
```

```json
{ "command": "prompt-creator" }
```

Expected routing: `handoff` must be passed as `command: "handoff"`, not as
`attached_input` to `command: "proof"`.

## Tool: inspect_prompt_library_command

Title:

```text
Inspect Prompt Library Command
```

Description:

```text
Inspects an active Prompt Library command by exact slug or alias without invoking it.
```

Input schema:

```json
{
  "type": "object",
  "properties": {
    "command": {
      "type": "string",
      "minLength": 1,
      "description": "Prompt Library command to inspect."
    }
  },
  "required": ["command"],
  "additionalProperties": false,
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

Output schema:

```json
{
  "type": "object",
  "properties": {
    "ok": {
      "type": "boolean",
      "const": true
    },
    "type": {
      "type": "string",
      "const": "prompt_inspection"
    },
    "inspection_only": {
      "type": "boolean",
      "const": true
    },
    "no_prompt_invoked": {
      "type": "boolean",
      "const": true
    },
    "metadata": {
      "type": "object",
      "properties": {
        "schema_version": {
          "type": "string"
        },
        "slug": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "aliases": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "lifecycle": {
          "type": "string",
          "enum": ["persistent_mode", "interactive_workflow", "one_shot"]
        },
        "input_mode": {
          "type": "string",
          "enum": ["attached_input", "conversation_context", "either"]
        },
        "status": {
          "type": "string",
          "enum": ["active", "draft"]
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "notes": {
          "type": "string"
        },
        "debug_marker": {
          "type": "string"
        },
        "prompt_version": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "updated_at": {
          "type": "string"
        }
      },
      "required": [
        "schema_version",
        "slug",
        "title",
        "description",
        "aliases",
        "lifecycle",
        "input_mode"
      ],
      "additionalProperties": false
    },
    "prompt_body": {
      "type": "string"
    }
  },
  "required": [
    "ok",
    "type",
    "inspection_only",
    "no_prompt_invoked",
    "metadata",
    "prompt_body"
  ],
  "additionalProperties": false,
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

Verification example:

```json
{ "command": "grill" }
```

Expected result: inspection-only output with `inspection_only: true` and
`no_prompt_invoked: true`. This must not apply the prompt as behavior.

## Tool: list_prompt_library_commands

Title:

```text
List Prompt Library Commands
```

Description:

```text
Lists active Prompt Library commands for discovery without returning prompt bodies.
```

Input schema:

```json
{
  "type": "object",
  "properties": {},
  "additionalProperties": false,
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

Output schema:

```json
{
  "type": "object",
  "properties": {
    "ok": {
      "type": "boolean",
      "const": true
    },
    "type": {
      "type": "string",
      "const": "prompt_command_list"
    },
    "commands": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "aliases": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "lifecycle": {
            "type": "string",
            "enum": ["persistent_mode", "interactive_workflow", "one_shot"]
          },
          "input_mode": {
            "type": "string",
            "enum": ["attached_input", "conversation_context", "either"]
          }
        },
        "required": [
          "command",
          "title",
          "description",
          "aliases",
          "lifecycle",
          "input_mode"
        ],
        "additionalProperties": false
      }
    }
  },
  "required": ["ok", "type", "commands"],
  "additionalProperties": false,
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

Expected command list:

```text
grill-me
handoff
spec-prompt-creator
```

Aliases are metadata on the canonical commands only. List output must not
include prompt bodies.

## Verification Checklist

Before resuming PL-123 ChatGPT-surface trial attempts, record evidence that:

- app/action settings no longer mention Slice 0 proof-only behavior;
- the only exposed tools are the three current V1 tools above;
- `invoke_prompt_library_command` accepts `handoff` as `command`, not as
  `attached_input` to `proof`;
- `inspect_prompt_library_command` is labeled inspection-only and returns
  `no_prompt_invoked: true`;
- `list_prompt_library_commands` is labeled discovery-only and returns no
  prompt bodies;
- a fresh `handoff` attempt no longer routes through `proof`.

If the Coding Agent cannot access the live ChatGPT app settings, this document
is the handoff artifact for the human update. After the human updates the app,
attach or comment the verification evidence on PL-132 and link the result back
to PL-123.
