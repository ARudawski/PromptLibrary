# Architecture and Code Standards

This directory holds standards for Codex agents and QA agents.

## Non-negotiable rules

- Use TypeScript/Node for V1.
- Keep the MCP adapter thin.
- Keep domain/application logic framework-independent.
- Do not parse raw `@pl` text inside connector logic.
- Do not add ChatGPT-facing admin, draft, cache-refresh, prompt-editing, auth, DB, or private-suite features in V1.
- Do not implement work beyond the currently approved slice.
- Slice 0 has passed with caveats, Slice 1 fixture-backed invocation is the approved baseline, M2 has been approved through Slice 2.7 source/cache/validation behavior, M3 read-only API completion/readiness was accepted through PL-80 after PL-79 QA, and M4 local MVP completion/readiness was accepted through PL-111 after PL-110 QA.
- PL-133 recorded the State Checkpoint after PL-123 accepted Slice 5.2 personal-use trial evidence. PL-124 captured Slice 5.3 trial evidence triage and found no evidence-backed M5.4 hardening issue. The next approved gate after PL-124 review and closeout is PL-127 / M5.QA readiness audit unless review identifies a material evidence-backed hardening need.
- Do not treat M5.4/M5.5/M5.QA/M5.Gate work, M6 hosted deployment, private/auth/DB behavior, additional real prompt files beyond the approved three-prompt M4 MVP set, prompt or alias changes, tool metadata changes, or broader runtime behavior as implemented.

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
