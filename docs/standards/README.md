# Architecture and Code Standards

This directory holds standards for Codex agents and QA agents.

## Non-negotiable rules

- Use TypeScript/Node for V1.
- Keep the MCP adapter thin.
- Keep domain/application logic framework-independent.
- Do not parse raw `@pl` text inside connector logic.
- Do not add ChatGPT-facing admin, draft, cache-refresh, prompt-editing, auth, DB, or private-suite features in V1.
- Do not implement work beyond the currently approved slice.
- Slice 0 has passed with caveats, and Slice 1 fixture-backed invocation is the approved baseline; current implementation is bounded to Slice 2.1 `PromptSource` boundary and fake source seam work.
- Do not treat public GitHub source, runtime cache behavior, inspect/list tools, real prompt files, hosted deployment, or private/auth/DB behavior as implemented.

## Approved ChatGPT-facing tools

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

## Forbidden ChatGPT-facing tools

```text
refresh_prompt_library_cache
create_prompt
update_prompt
delete_prompt
list_drafts
inspect_draft
admin/debug/cache tools
```

## Invocation payload hygiene

Normal invocation may expose only:

```text
title
lifecycle
input_mode
prompt_body
```

The prompt body must be model-visible in `structuredContent` or `content`; hiding it only in `_meta` makes invocation useless.

## Future full document

The generated full standards document should be stored here as:

```text
project-prompt-library-codex-agent-standards.md
```
