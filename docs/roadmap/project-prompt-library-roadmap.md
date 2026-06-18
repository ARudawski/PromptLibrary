# Project Prompt Library — Implementation Roadmap

Status: Initial implementation roadmap 1.0  
Date: 2026-06-18  
Primary audience: Codex Prompt Coordinator, QA Coordinator, coding agents, future architecture review  
Roadmap basis: approved architecture plan v1.0 plus greenfield planning clarifications

---

## 1. Executive summary

Project Prompt Library is a small, retrieval-focused ChatGPT Apps / MCP connector that lets a user invoke exact externally maintained prompt workflows from inside a normal ChatGPT conversation using short command-style requests such as:

```text
@pl grill-me

I want to build a small app that...
```

The implementation roadmap is deliberately premise-first and invocation-first.

The first implementation must **not** build the real prompt-library architecture yet. It must first prove the platform premise with a disposable local MCP proof:

```text
@pl proof
```

The proof must demonstrate that ChatGPT can route command-style user intent into a local connector tool, receive a hardcoded model-visible prompt, and apply that prompt as behavior. If this fails, parser/cache/GitHub/schema work is waste. Elegant waste, perhaps, but still waste.

The roadmap therefore starts with:

1. **Slice -1** — minimal repository/workflow bootstrap.
2. **Slice 0** — hardcoded local MCP premise validation.
3. **Slice 1** — fixture-backed invocation walking skeleton.
4. **Slice 2** — public GitHub prompt source and cache/index behavior.
5. **Slice 3** — inspect/list tools.
6. **Slice 4** — local MVP with three real prompts.
7. **Slice 5** — personal-use trial.
8. **Slice 6** — hosted deployment, only after local MVP proves useful.

The roadmap intentionally avoids V1 scope creep:

- no prompt editor;
- no draft management in ChatGPT;
- no private prompt suites;
- no accounts or OAuth;
- no database;
- no semantic search;
- no workflow engine;
- no external agent orchestration;
- no Java/Spring/Vaadin/Elasticsearch backend for V1.

The final deliverable should make implementation boring, bounded, inspectable, and hard for coding agents to creatively reinterpret.

---

## 2. Source material reviewed

### 2.1 Reviewed sources

1. **Project Prompt Library — Architecture Plan**
   - Status: architecture plan v1.0
   - Date: 2026-06-18
   - Role: primary technical source of truth

2. **Handoff: Skill-Adjacent Prompt Library for ChatGPT**
   - Role: product idea source and problem framing

3. **Current planning clarifications**
   - No GitHub repository exists yet.
   - No Linear project/issues exist yet.
   - No implementation has started.
   - This roadmap will be the base for the first implementation and workflow.
   - The roadmap planner sits one level above issue creation; work items should be issue-ready, but no issues are created here.

### 2.2 Source-of-truth hierarchy for this roadmap

When sources disagree, use this order:

1. Current explicit user instruction.
2. Approved architecture plan / ADRs.
3. Approved product idea handoff.
4. Future Linear issue acceptance criteria.
5. Future GitHub issues / PRs.
6. Future repository documentation.
7. Future code.
8. Future tests.

### 2.3 Important conflict resolved

The original idea handoff mentions a broader initial prompt set, including `software-idea-sparring-partner` and `review-spec`.

The approved architecture narrows the **initial local MVP prompt set** to:

- `handoff`
- `grill-me`
- `spec-prompt-creator`

The architecture plan wins for V1 roadmap sequencing. Additional prompts can be added after the local MVP or personal-use trial if the core remains stable.

---

## 3. Roadmap assumptions

### 3.1 Project state assumptions

- The project is greenfield.
- No repository exists yet.
- No Linear project exists yet.
- No implementation slices have been completed.
- Slice 0 has not been attempted.
- GitHub and Linear reconciliation are not needed for this first roadmap.
- This roadmap should be usable as the base for the first Codex Prompt Coordinator session.

### 3.2 Technical assumptions

- V1 uses TypeScript/Node.
- Default package manager for planning: `npm`, unless revised during repo bootstrap.
- The MCP/App server is tool-only; no UI widget in V1.
- The prompt suite is public in V1.
- Public GitHub is canonical for prompt definitions after Slice 2.
- Prompt files use Markdown with YAML frontmatter.
- Runtime state is in-memory cache only.
- Cache TTL is five minutes.
- Cache refresh uses stale-while-revalidate / last-known-good behavior.
- The core must be testable without ChatGPT, GitHub, or network access.

### 3.3 Planning assumptions

- The roadmap should split architecture, implementation, documentation, and QA into small inspectable slices.
- Coding agents should work from one slice at a time.
- QA should audit boundaries, contracts, and drift, not merely happy-path behavior.
- Issue-ready work items are useful, but actual Linear creation is out of scope.
- Hosted deployment is conditional and belongs after local MVP usefulness is proven.

### 3.4 Roadmap Planner Ledger

```text
Project:
Project Prompt Library

Source material:
- Architecture plan v1.0
- Product idea handoff
- Current greenfield clarifications

Current phase:
Final roadmap

Locked planning decisions:
- Greenfield execution starts with minimal repo bootstrap.
- Slice 0 premise validation must happen before real product implementation.
- Architecture plan is source of truth.
- TypeScript/Node is the V1 stack.
- Public GitHub prompt suite is the V1 canonical source.
- No database, auth, private prompts, prompt editing, or UI widget in V1.
- Roadmap is one level above Linear issue creation.

Open planning questions:
- Exact production hosting provider.
- Exact HTTP runtime/server library.
- Exact final tool descriptions after Slice 0 evidence.
- Exact final prompt wording for the initial three MVP prompts.

Milestones:
- M0: Bootstrap and premise validation.
- M1: Invocation walking skeleton.
- M2: Public source, cache, and validation tooling.
- M3: Complete read-only ChatGPT-facing API.
- M4: Local MVP with real prompts.
- M5: Personal-use trial.
- M6: Hosted deployment.

Current slice focus:
Slice -1, then Slice 0.

Linked GitHub items:
None yet.

Linked Linear items:
None yet.

Linear action status:
Issue-ready planning only. No creation.

Risks:
- ChatGPT may not route `@pl proof` reliably.
- ChatGPT may retrieve but not apply returned prompt content.
- Coding agents may overbuild infrastructure before the premise is proven.
- V1 may drift into prompt-management/admin features.

Next action:
Hand this roadmap to the Codex Prompt Coordinator and create the Slice -1 / Slice 0 coding-agent prompts.
```

---

## 4. V1 boundary

### 4.1 Included in V1

V1 includes:

- ChatGPT-facing MCP/App connector.
- Explicit command-style prompt invocation, targeting `@pl <command>`.
- Tool-only app; no custom UI widget/component.
- Public command suite.
- Public GitHub as canonical source for prompt definitions.
- Flat prompt repository layout:

```text
prompts/*.md
```

- Markdown prompt files with YAML frontmatter.
- Runtime in-memory prompt cache.
- Five-minute cache TTL.
- Stale-while-revalidate / last-known-good cache behavior.
- Strict prompt validation.
- Global slug/alias conflict checks.
- Active-only invocation.
- Draft prompts may exist in GitHub, but are not exposed through the ChatGPT-facing API.
- Three ChatGPT-facing read-only tools:

```text
invoke_prompt_library_command
inspect_prompt_library_command
list_prompt_library_commands
```

- Local developer prompt-validation script.
- Deterministic CI for local/dev quality gates.
- Live integration smoke checks for deployment/readiness only.
- Initial local MVP prompt set:
  - `handoff`
  - `grill-me`
  - `spec-prompt-creator`

### 4.2 V1 proof sequence

V1 work starts with Slice 0:

> Hardcoded local proof prompt returned by a local MCP tool. Validate that ChatGPT can route `@pl proof` into the connector and apply the returned prompt.

Only after Slice 0 passes should actual prompt-library implementation begin.

### 4.3 V1 product boundary

The connector retrieves prompt definitions. The prompt text defines behavior. The connector does not execute workflows, manage conversation state, or decide when a prompt should be used.

---

## 5. Non-goals

V1 must not build:

- prompt editing in ChatGPT;
- draft management in ChatGPT;
- cache refresh/invalidation exposed to ChatGPT users;
- private prompt suites;
- user accounts;
- OAuth/user-token flows;
- encrypted private prompt storage;
- DB-backed private prompt records;
- multi-source prompt merging;
- team/shared spaces;
- prompt marketplace;
- billing;
- analytics dashboard;
- semantic search;
- automatic prompt selection;
- bare-command recognition without explicit `@pl` intent;
- workflow/session state management outside ChatGPT;
- external agent orchestration;
- prompt composition engine;
- complex UI/admin panel;
- Elasticsearch;
- Vaadin;
- Java/Spring backend for V1.

Also explicitly excluded from implementation-agent freedom:

- building GitHub source before Slice 0 passes;
- building parser/schema/cache in Slice 0;
- creating extra ChatGPT-facing tools;
- exposing drafts through inspect/list/invoke;
- adding any write operation;
- treating future private suites as a V1 feature.

---

## 6. Milestones

## Milestone 0: Bootstrap and premise validation

### Goal

Create only enough project structure to run a local hardcoded MCP proof and validate the unique product premise.

### Scope

Included:

- Minimal greenfield TypeScript/Node repo skeleton.
- Local dev startup script.
- Minimal local MCP server for proof.
- One hardcoded proof command.
- Model-visible hardcoded proof prompt.
- Local tunnel/developer setup notes.
- Manual Slice 0 validation log.

### Non-goals

Excluded:

- GitHub prompt source.
- Markdown parsing.
- YAML frontmatter.
- Schema validation.
- Runtime cache.
- Real prompt files.
- Inspect/list tools.
- Hosted deployment.
- Production architecture beyond what the proof needs.

### Dependencies

- None.

### Implementation slices

- Slice -1: Minimal repository/workflow bootstrap.
- Slice 0: Hardcoded local MCP premise proof.

### Acceptance criteria

- Repo can install, typecheck, and run local dev server.
- Local proof tool can be connected to ChatGPT developer/tooling setup.
- Explicit tool invocation works as a sanity check.
- `@pl proof` command-style invocation works in three cooperative fresh chats.
- ChatGPT asks exactly one clarifying question.
- ChatGPT does not answer or solve the topic yet.
- ChatGPT ends with `PPL-PROOF-001`.
- Slice 0 results are recorded.

### QA gate

Manual QA checklist for Slice 0 must pass before any real prompt-library implementation begins.

### Documentation gate

Documentation must include:

- local install/run steps;
- tunnel/developer setup notes;
- proof command behavior;
- Slice 0 test checklist;
- Slice 0 result log template.

### Linear task group

Draft-only task group:

- Bootstrap minimal TypeScript/Node MCP repo.
- Validate local `@pl proof` routing and prompt application.
- Document Slice 0 proof setup and results.

### Handoff

- Codex Prompt Coordinator for implementation prompt.
- QA Coordinator for manual premise validation checklist.

---

## Milestone 1: Invocation walking skeleton

### Goal

Build the first real `invoke_prompt_library_command` path from local fixture prompt definitions to MCP-native response, without GitHub or runtime cache complexity.

### Scope

Included:

- Domain types.
- Local fixture prompt source.
- Markdown/frontmatter parser.
- Prompt schema validation.
- Collection validation.
- Active prompt index by slug/alias.
- Alias conflict detection.
- Draft exclusion.
- Reduced invocation projection.
- `InvokePromptUseCase`.
- MCP adapter for `invoke_prompt_library_command`.
- Unit, contract, and golden tests.

### Non-goals

Excluded:

- Public GitHub source.
- Runtime TTL cache.
- Stale-while-revalidate behavior.
- Real prompt files.
- Inspect/list tools.
- Hosted deployment.

### Dependencies

- Slice 0 must have passed, or the architecture must be explicitly revised.

### Implementation slices

- Slice 1.1: Domain types and fixture harness.
- Slice 1.2: Markdown/frontmatter parser.
- Slice 1.3: Prompt definition validation.
- Slice 1.4: Collection validation and index.
- Slice 1.5: Invocation projection and use case.
- Slice 1.6: MCP invoke adapter.
- Slice 1.7: Invocation contract/golden tests and docs.

### Acceptance criteria

- Happy-path invocation returns exact reduced payload.
- Prompt body is model-visible in MCP-native result data.
- Normal invocation visible receipt remains compact.
- Invocation payload contains only:
  - `title`
  - `lifecycle`
  - `input_mode`
  - `prompt_body`
- Draft prompts are not invokable.
- Unknown commands fail closed.
- Alias invocation works.
- Alias conflicts fail closed.
- Suggestions, if present, are non-executing.
- Golden responses are stable.

### QA gate

QA must verify safety and contract boundaries:

- no forbidden metadata in invocation payload;
- no draft invocation;
- no invalid prompt invocation;
- no auto-execution of suggestions;
- no raw `@pl` parsing inside connector core;
- exact success/failure response shape.

### Documentation gate

Documentation must include:

- prompt metadata schema draft;
- fixture authoring notes;
- invocation response contract;
- list of forbidden invocation metadata;
- known Slice 1 limitations.

### Linear task group

Draft-only task group:

- Implement prompt domain model and parser.
- Implement prompt validation and index.
- Implement fixture-backed invoke use case.
- Expose invoke MCP adapter.
- Add invocation contract/golden tests.
- Document invocation contract.

### Handoff

- Codex Prompt Coordinator for slice-by-slice implementation prompts.
- QA Coordinator after Slice 1.6 or 1.7 for contract audit.

---

## Milestone 2: Public source, cache, and validation tooling

### Goal

Replace fixture-only loading with the V1 public GitHub prompt source and safe runtime cache behavior.

### Scope

Included:

- `PromptSource` interface.
- Fake source test seam.
- `PublicGitHubPromptSource`.
- Load all `prompts/*.md`.
- Runtime in-memory prompt cache.
- Five-minute TTL.
- Stale-while-revalidate behavior.
- Last-known-good preservation.
- Partial valid cache behavior.
- Cold failure behavior.
- Local `validate-prompts` script.
- Source/cache contract and golden tests.

### Non-goals

Excluded:

- Private prompt source.
- DB-backed source.
- Multi-source merging.
- Cache refresh ChatGPT tool.
- Auth/OAuth.
- Hosted deployment.

### Dependencies

- Milestone 1 invoke path stable.
- Parser/validator/index behavior tested without network.

### Implementation slices

- Slice 2.1: `PromptSource` interface and fake source seam.
- Slice 2.2: Public GitHub prompt source.
- Slice 2.3: Runtime cache with TTL.
- Slice 2.4: Stale-while-revalidate and last-known-good behavior.
- Slice 2.5: Partial valid cache and cold failure behavior.
- Slice 2.6: Local `validate-prompts` script.
- Slice 2.7: Source/cache contract and golden tests.

### Acceptance criteria

- Core tests run without network.
- Public source adapter is isolated in infrastructure.
- GitHub source can load public prompt files in smoke/integration context.
- Failed refresh does not destroy last-known-good cache.
- Invalid/conflicting prompts are excluded.
- If no valid cache can be built, invoke/inspect/list fail closed.
- No ChatGPT-facing cache refresh tool exists.

### QA gate

QA must verify:

- fresh cache path;
- stale cache path;
- failed refresh preserving last-known-good;
- partial valid cache behavior;
- cold failure behavior;
- invalid/conflicting prompt exclusion;
- no source/cache diagnostics leaking into normal invocation.

### Documentation gate

Documentation must include:

- prompt source configuration;
- cache behavior;
- validation script usage;
- cold failure behavior;
- operational limitation: prompt edits may take up to five minutes to appear.

### Linear task group

Draft-only task group:

- Add prompt source boundary.
- Implement public GitHub source adapter.
- Implement runtime cache behavior.
- Add prompt validation CLI.
- Add source/cache tests.
- Document source/cache behavior.

### Handoff

- Codex Prompt Coordinator for infrastructure and cache slices.
- QA Coordinator for cache safety audit.

---

## Milestone 3: Complete read-only ChatGPT-facing API

### Goal

Add inspect and list tools while keeping the connector read-only and non-admin.

### Scope

Included:

- `InspectPromptUseCase`.
- `inspect_prompt_library_command` MCP adapter.
- `ListPromptsUseCase`.
- `list_prompt_library_commands` MCP adapter.
- Inspection projection.
- Prompt summary projection.
- Contract/golden tests.

### Non-goals

Excluded:

- Draft inspection.
- Draft listing.
- Prompt body in list output.
- Cache diagnostics in list output.
- Admin/debug inventory.
- Prompt editing.
- Cache refresh tool.

### Dependencies

- Milestone 1 invoke contracts stable.
- Milestone 2 source/cache/index behavior stable enough to share lookup/index path.

### Implementation slices

- Slice 3.1: Inspect use case and projection.
- Slice 3.2: Inspect MCP adapter.
- Slice 3.3: List use case and summary projection.
- Slice 3.4: List MCP adapter.
- Slice 3.5: Inspect/list contract and golden tests.

### Acceptance criteria

- Inspect returns full active prompt metadata and body.
- Inspect response includes `inspection_only: true`.
- Inspect response includes `no_prompt_invoked: true`.
- Inspect never invokes prompt behavior.
- List returns active/invokable commands only.
- List does not return prompt bodies.
- Drafts are not exposed through inspect/list.
- All three V1 tools work locally.

### QA gate

QA must verify:

- inspect cannot be mistaken for invoke;
- list cannot leak prompt bodies;
- drafts remain hidden;
- no extra admin tools exist;
- failure responses include `no_prompt_invoked` where behavior could otherwise be ambiguous.

### Documentation gate

Documentation must include:

- tool reference for invoke, inspect, and list;
- examples of normal invocation vs inspection;
- explicit warning that inspect is not invocation.

### Linear task group

Draft-only task group:

- Implement inspect use case/tool.
- Implement list use case/tool.
- Add inspect/list contract tests.
- Document read-only API behavior.

### Handoff

- Codex Prompt Coordinator for inspect/list implementation prompts.
- QA Coordinator for read-only API boundary audit.

---

## Milestone 4: Local MVP with real prompts

### Goal

Make the connector locally useful with the first real prompt set.

### Scope

Included:

- Real prompt files:
  - `prompts/handoff.md`
  - `prompts/grill-me.md`
  - `prompts/spec-prompt-creator.md`
- Correct YAML frontmatter.
- Active prompt status.
- Prompt metadata validation.
- Real prompt fixture/golden coverage.
- Local MVP usage guide.

### Non-goals

Excluded:

- Adding every future prompt.
- Prompt editing in ChatGPT.
- Personal/private prompt uploads.
- Hosted deployment.
- Semantic routing.
- Automatic prompt selection.

### Dependencies

- Milestone 3 complete.
- Prompt schema stable enough for real prompt files.
- `validate-prompts` available.

### Implementation slices

- Slice 4.1: Prompt authoring baseline and metadata conventions.
- Slice 4.2: Add `handoff.md`.
- Slice 4.3: Add `grill-me.md`.
- Slice 4.4: Add `spec-prompt-creator.md`.
- Slice 4.5: Real prompt validation, golden tests, and local walkthrough docs.

### Acceptance criteria

- All three real prompt files validate.
- All three prompts invoke correctly.
- All three prompts inspect correctly.
- List shows all three active commands.
- Drafts or future prompts are not accidentally exposed.
- Local MVP supports real ChatGPT workflows.

### QA gate

QA must verify:

- exact command resolution;
- alias behavior;
- prompt body integrity;
- lifecycle/input mode metadata;
- no metadata leakage in invocation;
- real prompt behavior plausibly matches intended mode.

### Documentation gate

Documentation must include:

- prompt authoring guide;
- local MVP usage guide;
- examples for `handoff`, `grill-me`, and `spec-prompt-creator`;
- limitations and non-goals.

### Linear task group

Draft-only task group:

- Add prompt authoring conventions.
- Add real MVP prompt files.
- Add validation/golden coverage for real prompts.
- Document local MVP usage.

### Handoff

- Codex Prompt Coordinator for prompt-file implementation and validation tasks.
- QA Coordinator for real-prompt behavior audit.

---

## Milestone 5: Personal-use trial

### Goal

Use the local connector in real workflows before hosting, and decide whether hosted deployment is justified.

### Scope

Included:

- Trial protocol.
- Real usage log.
- Routing reliability notes.
- Tool description tuning.
- Prompt wording adjustments.
- Hosting readiness decision.

### Non-goals

Excluded:

- Major architecture changes without explicit review.
- Adding private prompts.
- Building account/auth/private-space features.
- Hosted deployment before local usefulness is proven.

### Dependencies

- Milestone 4 local MVP complete.
- Local MCP setup usable in normal workflows.

### Implementation slices

- Slice 5.1: Personal trial protocol and results log.
- Slice 5.2: Tool description/routing tuning.
- Slice 5.3: Prompt wording hardening.
- Slice 5.4: Hosting readiness decision.

### Acceptance criteria

- Connector is used in several real ChatGPT sessions.
- `@pl` routing is reliable enough for personal use.
- Returned prompts are applied as intended often enough to justify continued work.
- Any failures are categorized as platform routing, tool description, prompt wording, or implementation bug.
- Hosting decision is explicit: proceed, defer, or redesign.

### QA gate

QA must verify:

- trial evidence exists;
- failures are categorized;
- no scope creep is hidden as “tuning”;
- hosting is not approved without real local usefulness.

### Documentation gate

Documentation must include:

- trial log;
- known limitations;
- routing notes;
- readiness decision.

### Linear task group

Draft-only task group:

- Run personal-use trial.
- Tune tool descriptions.
- Harden prompt wording.
- Decide hosted readiness.

### Handoff

- QA Coordinator for trial evidence review.
- Architect if trial exposes architecture contradiction.
- Codex Prompt Coordinator only for bounded tuning tasks.

---

## Milestone 6: Hosted deployment

### Goal

Deploy a stable HTTPS MCP endpoint after local MVP proves useful.

### Scope

Included:

- Hosting compatibility spike.
- Node-compatible deployment configuration.
- Hosted endpoint.
- Hosted smoke tests.
- ChatGPT connection verification.
- Release/readiness documentation.
- Rollback notes.

### Non-goals

Excluded:

- Provider overengineering.
- Multi-region architecture.
- Database.
- User auth/private prompts.
- Admin UI.
- Analytics dashboard.

### Dependencies

- Milestone 5 approves hosted deployment.
- Deterministic CI gate is green.
- Local MVP remains stable.

### Implementation slices

- Slice 6.1: Hosting compatibility spike.
- Slice 6.2: Deployment configuration.
- Slice 6.3: Hosted endpoint smoke tests.
- Slice 6.4: ChatGPT connection verification.
- Slice 6.5: Release/readiness documentation.

### Acceptance criteria

- Hosted endpoint is reachable over HTTPS.
- MCP tool connection works.
- Deterministic CI remains green.
- Live public source smoke passes.
- `@pl` routing still works against hosted endpoint.
- Rollback/redeploy path is documented.

### QA gate

QA must verify:

- deterministic CI;
- local MCP smoke;
- hosted endpoint smoke;
- live public source smoke;
- ChatGPT developer/tooling smoke if available;
- no production-only behavior drift.

### Documentation gate

Documentation must include:

- deployment guide;
- environment/configuration guide;
- smoke checklist;
- rollback notes;
- known hosting limitations.

### Linear task group

Draft-only task group:

- Spike hosting provider compatibility.
- Add deployment configuration.
- Add hosted smoke checklist.
- Verify ChatGPT hosted connection.
- Document release/rollback.

### Handoff

- Codex Prompt Coordinator for hosting implementation prompts.
- QA Coordinator for release readiness audit.

---

## 7. Implementation slices

This section is the working breakdown for Codex Prompt Coordinator and coding agents.

### Slice -1: Minimal repository/workflow bootstrap

**Purpose:**  
Create a boring greenfield project skeleton so Slice 0 can run without dragging in real product infrastructure.

**Source:**  
Roadmap planning addition; architecture requires Slice 0 before implementation but assumes a runnable project exists.

**Scope:**

- Create TypeScript/Node project.
- Add minimal `package.json` scripts.
- Add TypeScript config.
- Add minimal formatting/linting decision.
- Add minimal test runner setup only if cheap.
- Add `README.md` with local run placeholder.
- Add `docs/slice-0-proof.md` placeholder.

**Non-goals:**

- No GitHub prompt source.
- No parser/schema/cache.
- No real prompt files.
- No inspect/list tools.
- No production module layout beyond what Slice 0 needs.

**Dependencies:**  
None.

**Expected repository impact:**

```text
package.json
tsconfig.json
src/
  mcp/
    server.ts            # may be minimal/proof-only
README.md
docs/
  slice-0-proof.md
```

**Acceptance criteria:**

- `npm install` works.
- `npm run typecheck` works or is intentionally stubbed with explanation.
- `npm run dev` starts the local proof server once Slice 0 is implemented.
- README states that this repo is currently proof-first and not a full implementation.

**Testing expectations:**

- Basic smoke only.
- No real product tests yet.

**Documentation expectations:**  
Minimal local setup notes.

**QA expectations:**  
QA confirms the bootstrap did not prebuild real architecture prematurely.

**Linear task draft:**  
Title: Bootstrap minimal TypeScript/Node MCP project  
Acceptance: project installs, typechecks, has local dev script placeholder, and documents Slice 0 proof-first status.

**Codex suitability:**  
Good. Small, mechanical, low ambiguity.

**Risk:**  
Low, except overbuilding. Keep it dull.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 0: Hardcoded local MCP premise proof

**Purpose:**  
Validate that ChatGPT can route `@pl proof` into a connector tool and apply a returned hardcoded prompt as behavior.

**Source:**  
Architecture plan Slice 0 / ADR “Validate connector premise before implementation”.

**Scope:**

- One local MCP tool, preferably `invoke_prompt_library_command` unless SDK setup requires a temporary proof equivalent.
- Structured input:

```ts
interface InvokePromptInput {
  command: string;
  attached_input?: string;
}
```

- Hardcoded command: `proof`.
- Hardcoded proof prompt:

```text
You are running the Project Prompt Library proof workflow.
Ask exactly one clarifying question about the user's input.
Do not answer or solve the user's topic yet.
End your response with: PPL-PROOF-001
```

- Model-visible prompt content in `structuredContent` or `content`.
- Compact visible receipt.
- Local tunnel/developer setup notes.
- Manual result log.

**Non-goals:**

- No GitHub.
- No parser.
- No YAML frontmatter.
- No validation schema.
- No cache.
- No real prompts.
- No inspect/list tools.
- No hosted deployment.

**Dependencies:**  
Slice -1.

**Expected repository impact:**

```text
src/mcp/server.ts
src/mcp/tools/invokePromptLibraryCommandTool.ts   # optional, if not overstructured
docs/slice-0-proof.md
```

**Acceptance criteria:**

- Explicit tool invocation works as platform sanity check.
- `@pl proof` command-style invocation works as product gate.
- In three cooperative fresh chats, ChatGPT:
  - asks exactly one clarifying question;
  - does not answer or solve the topic yet;
  - ends with `PPL-PROOF-001`.
- Results are recorded.
- If `@pl proof` fails, one short command-UX workaround attempt is recorded.
- If no natural command-like pattern works, project stops for redesign.

**Testing expectations:**

- Manual premise validation is primary.
- Optional simple unit/smoke test for hardcoded command routing inside the local server.

**Documentation expectations:**

- Local run instructions.
- Tunnel/developer setup notes.
- Proof checklist.
- Result log.

**QA expectations:**

- QA verifies proof behavior from fresh chats.
- QA records pass/fail and categorizes failures.

**Linear task draft:**  
Title: Validate local `@pl proof` MCP premise  
Acceptance: explicit invocation works and `@pl proof` applies the proof prompt in three cooperative fresh chats.

**Codex suitability:**  
Good, with manual validation caveat.

**Risk:**  
High, because this validates the unique platform premise.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 1.1: Domain types and fixture harness

**Purpose:**  
Create the minimal core vocabulary for prompts without transport or GitHub concerns.

**Source:**  
Architecture domain model and code architecture.

**Scope:**

- `PromptDefinition`
- `PromptMetadata`
- lifecycle/input/status enums
- domain error types
- loaded prompt fixture representation
- initial valid/invalid fixture folders

**Non-goals:**

- No parser implementation yet if this would bloat the slice.
- No MCP adapter.
- No GitHub source.

**Dependencies:**  
Slice 0 passed.

**Expected repository impact:**

```text
src/domain/
test/fixtures/
```

**Acceptance criteria:**

- Domain types represent metadata and body separately.
- Lifecycle enum includes `persistent_mode`, `interactive_workflow`, `one_shot`.
- Input mode enum includes `attached_input`, `conversation_context`, `either`.
- Status enum includes `active`, `draft`.
- Tests compile against domain types.

**Testing expectations:**  
Type-level/compile checks plus minimal unit tests if useful.

**Documentation expectations:**  
None beyond code comments if needed.

**QA expectations:**  
QA checks that domain types do not include transport/source/cache concerns.

**Linear task draft:**  
Title: Add prompt domain model and fixture harness.

**Codex suitability:**  
Good.

**Risk:**  
Low.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 1.2: Markdown/frontmatter parser

**Purpose:**  
Parse Markdown files with YAML frontmatter into raw prompt definitions.

**Source:**  
Architecture prompt model.

**Scope:**

- Parse frontmatter.
- Preserve exact prompt body below frontmatter.
- Reject empty body at validation layer or parser boundary.
- Add parser fixtures.

**Non-goals:**

- No collection validation.
- No alias conflict detection.
- No MCP response mapping.

**Dependencies:**  
Slice 1.1.

**Expected repository impact:**

```text
src/prompt-parser/parsePromptMarkdown.ts
src/prompt-parser/frontmatterSchema.ts
test/unit/prompt-parser/
```

**Acceptance criteria:**

- Valid frontmatter/body parses.
- Body text remains exact.
- Missing frontmatter fails predictably.
- Malformed YAML fails predictably.

**Testing expectations:**  
Unit tests first.

**Documentation expectations:**  
Prompt file shape note can be added later in Slice 1.7.

**QA expectations:**  
QA checks exact body preservation.

**Linear task draft:**  
Title: Implement Markdown/frontmatter parser.

**Codex suitability:**  
Good.

**Risk:**  
Low/medium, because exact body preservation matters.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 1.3: Prompt definition validation

**Purpose:**  
Validate individual prompt definitions before any invocation can occur.

**Source:**  
Architecture validation strategy.

**Scope:**

- Required metadata fields.
- Slug format.
- Alias format.
- Lifecycle enum.
- Input mode enum.
- Status enum.
- Empty body rejection.
- Unknown field policy if chosen.

**Non-goals:**

- No global duplicate/conflict validation.
- No cache behavior.

**Dependencies:**  
Slice 1.2.

**Expected repository impact:**

```text
src/validation/validatePromptDefinition.ts
src/validation/ValidationError.ts
test/unit/validation/
```

**Acceptance criteria:**

- Valid prompt passes.
- Missing required fields fail.
- Invalid enum values fail.
- Empty prompt body fails.
- Draft status is valid but not invokable later.

**Testing expectations:**  
Unit tests first with invalid fixtures.

**Documentation expectations:**  
Validation rules added later in authoring docs.

**QA expectations:**  
QA checks invalid prompts cannot sneak into later invocation path.

**Linear task draft:**  
Title: Implement single prompt validation.

**Codex suitability:**  
Good.

**Risk:**  
Medium, because validation laxness becomes later drift.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 1.4: Collection validation and active command index

**Purpose:**  
Build the global slug/alias lookup and fail closed on unsafe conflicts.

**Source:**  
Architecture sync/indexing and alias rules.

**Scope:**

- Validate duplicate slugs.
- Validate alias/slug conflicts.
- Validate duplicate aliases.
- Build active prompt map by slug.
- Build active prompt map by alias.
- Exclude draft prompts from runtime index.

**Non-goals:**

- No GitHub loading.
- No runtime cache.
- No MCP adapter.

**Dependencies:**  
Slice 1.3.

**Expected repository impact:**

```text
src/validation/validatePromptCollection.ts
src/cache/PromptIndex.ts
test/unit/validation/
test/unit/cache/
```

**Acceptance criteria:**

- Duplicate slug fails closed.
- Alias matching another prompt slug fails closed.
- Duplicate alias fails closed.
- Active prompts are indexed.
- Draft prompts are excluded from active index.

**Testing expectations:**  
Unit tests plus conflict fixtures.

**Documentation expectations:**  
Alias conflict rules documented later.

**QA expectations:**  
QA checks conflicts are not resolved by priority, order, or “best guess”.

**Linear task draft:**  
Title: Implement collection validation and active command index.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 1.5: Invocation projection and `InvokePromptUseCase`

**Purpose:**  
Resolve commands and return only the reduced behavior-facing payload.

**Source:**  
Architecture invocation payload and use case responsibilities.

**Scope:**

- Resolve command by slug/alias.
- Return reduced payload:
  - `title`
  - `lifecycle`
  - `input_mode`
  - `prompt_body`
- Structured domain errors.
- Unknown command suggestions if simple and non-executing.
- `no_prompt_invoked` semantics for failure.

**Non-goals:**

- No MCP transport mapping yet.
- No inspect/list.
- No raw `@pl` parsing.

**Dependencies:**  
Slice 1.4.

**Expected repository impact:**

```text
src/application/InvokePromptUseCase.ts
src/projection/toInvocationPayload.ts
src/suggestions/suggestCommands.ts
test/unit/application/
```

**Acceptance criteria:**

- Active command invokes.
- Alias invokes.
- Unknown command fails closed.
- Suggestions never invoke.
- Draft cannot be invoked.
- Reduced payload contains no forbidden metadata.

**Testing expectations:**  
Unit tests first.

**Documentation expectations:**  
Invocation projection contract documented later in Slice 1.7.

**QA expectations:**  
QA checks payload hygiene.

**Linear task draft:**  
Title: Implement fixture-backed invoke use case and reduced projection.

**Codex suitability:**  
Good.

**Risk:**  
Medium/high, because this is the core product behavior.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 1.6: MCP adapter for `invoke_prompt_library_command`

**Purpose:**  
Expose the invocation use case through MCP-native tool shape.

**Source:**  
Architecture connector/API design.

**Scope:**

- Tool input schema: `command`, optional `attached_input`.
- Success response with model-visible payload.
- Failure response with structured error and `no_prompt_invoked: true`.
- Compact `content` receipt.
- No hidden `_meta` dependency for prompt body.

**Non-goals:**

- No GitHub.
- No inspect/list.
- No prompt body visible dump in normal receipt.

**Dependencies:**  
Slice 1.5.

**Expected repository impact:**

```text
src/mcp/tools/invokePromptLibraryCommandTool.ts
src/mcp/schemas/toolInputSchemas.ts
src/mcp/schemas/toolOutputSchemas.ts
test/contract/
```

**Acceptance criteria:**

- Tool accepts structured command input.
- Tool result uses MCP-native shape.
- `payload.prompt_body` is model-visible.
- Visible receipt remains compact.
- Failure contains `no_prompt_invoked: true`.

**Testing expectations:**  
Contract tests without real ChatGPT.

**Documentation expectations:**  
Tool contract documented later in Slice 1.7.

**QA expectations:**  
QA verifies contract shape and absence of forbidden fields.

**Linear task draft:**  
Title: Expose invoke command through MCP adapter.

**Codex suitability:**  
Good/mixed, depending on SDK friction.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 1.7: Invocation contract/golden tests and docs

**Purpose:**  
Freeze the first real invocation contract before adding source/cache complexity.

**Source:**  
Architecture testing strategy and CI policy.

**Scope:**

- Golden tests for:
  - valid active invocation;
  - alias invocation;
  - unknown command with optional suggestion;
  - draft prompt not invokable;
  - invalid prompt excluded;
  - alias conflict;
  - forbidden metadata absence.
- Invocation contract documentation.

**Non-goals:**

- No GitHub source.
- No cache.
- No inspect/list.

**Dependencies:**  
Slice 1.6.

**Expected repository impact:**

```text
test/golden/
docs/invocation-contract.md
```

**Acceptance criteria:**

- Golden tests assert exact keys.
- Golden tests assert forbidden keys are absent.
- Contract docs explain normal invocation vs inspection not yet implemented.

**Testing expectations:**  
Golden and contract tests.

**Documentation expectations:**  
Invocation contract document.

**QA expectations:**  
QA audits the first stable invoke contract.

**Linear task draft:**  
Title: Add invocation golden tests and contract documentation.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 2.1: `PromptSource` interface and fake source seam

**Purpose:**  
Introduce source abstraction without prematurely building multi-source architecture.

**Source:**  
Architecture source-of-truth strategy.

**Scope:**

- `PromptSource` interface:

```ts
interface PromptSource {
  loadAllPrompts(): Promise<LoadedPromptFile[]>;
}
```

- Fake source for tests.
- Move fixture loading behind source boundary.

**Non-goals:**

- No source merging.
- No private source.
- No auth.
- No GitHub implementation yet if separation is cleaner.

**Dependencies:**  
Milestone 1 complete.

**Expected repository impact:**

```text
src/prompt-source/PromptSource.ts
src/prompt-source/LoadedPromptFile.ts
test/helpers/FakePromptSource.ts
```

**Acceptance criteria:**

- Core use cases can be tested using fake source.
- Application code does not depend on GitHub directly.

**Testing expectations:**  
Unit tests with fake source.

**Documentation expectations:**  
Architecture note if useful.

**QA expectations:**  
QA checks no future-private-suite overengineering.

**Linear task draft:**  
Title: Add PromptSource boundary and fake test source.

**Codex suitability:**  
Good.

**Risk:**  
Low/medium due to abstraction creep.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 2.2: Public GitHub prompt source

**Purpose:**  
Load public prompt Markdown files from GitHub as V1 canonical source.

**Source:**  
Architecture source-of-truth strategy.

**Scope:**

- `PublicGitHubPromptSource`.
- Load all `prompts/*.md` from configured public repository/path.
- Focused adapter tests/mocks.
- Live smoke path kept out of default deterministic tests.

**Non-goals:**

- No private GitHub token.
- No OAuth.
- No DB.
- No multi-source merge.

**Dependencies:**  
Slice 2.1.

**Expected repository impact:**

```text
src/prompt-source/PublicGitHubPromptSource.ts
src/config/appConfig.ts
test/unit/prompt-source/
```

**Acceptance criteria:**

- Source loads public prompt files when configured.
- Source returns loaded file path/content.
- Source failures are typed/structured.
- Default core tests do not require network.

**Testing expectations:**  
Mocked/focused tests plus optional live smoke script/check.

**Documentation expectations:**  
Public source configuration.

**QA expectations:**  
QA verifies public source is infrastructure only.

**Linear task draft:**  
Title: Implement public GitHub prompt source adapter.

**Codex suitability:**  
Mixed because SDK/API details may require small spike.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 2.3: Runtime cache with TTL

**Purpose:**  
Avoid fetching/parsing source on every invocation while keeping GitHub canonical.

**Source:**  
Architecture cache strategy.

**Scope:**

- Runtime in-memory cache.
- Five-minute TTL.
- Fresh/stale state.
- Load/parse/validate/index cache build path.

**Non-goals:**

- No DB.
- No manual ChatGPT refresh tool.
- No hosted deployment.

**Dependencies:**  
Slice 2.2.

**Expected repository impact:**

```text
src/cache/PromptCache.ts
src/cache/StaleWhileRevalidateCache.ts
test/unit/cache/
```

**Acceptance criteria:**

- Fresh cache serves immediately.
- Stale cache is detected.
- Cache build runs parser/validator/index.
- Cache never becomes canonical editable source.

**Testing expectations:**  
Unit tests with fake source and fake clock.

**Documentation expectations:**  
Cache behavior draft.

**QA expectations:**  
QA verifies cache is read-only derived state.

**Linear task draft:**  
Title: Implement runtime prompt cache with TTL.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 2.4: Stale-while-revalidate and last-known-good behavior

**Purpose:**  
Ensure refresh failures do not destroy working prompt availability.

**Source:**  
Architecture cache refresh behavior.

**Scope:**

- Serve stale last-known-good cache while refresh runs.
- Replace cache only after successful valid refresh.
- Preserve last-known-good on refresh failure.
- Controlled async/background path or synchronous equivalent if simpler.

**Non-goals:**

- No user-facing refresh control.
- No admin diagnostics in ChatGPT tools.

**Dependencies:**  
Slice 2.3.

**Expected repository impact:**

```text
src/cache/StaleWhileRevalidateCache.ts
test/unit/cache/
```

**Acceptance criteria:**

- Failed refresh preserves previous valid cache.
- Unsafe refresh result does not replace cache.
- Logs/diagnostics are internal only.

**Testing expectations:**  
Unit tests simulating source failure and invalid refresh.

**Documentation expectations:**  
Cache refresh semantics.

**QA expectations:**  
QA verifies failed refresh cannot break known-good invocation.

**Linear task draft:**  
Title: Add stale-while-revalidate and last-known-good cache behavior.

**Codex suitability:**  
Good/mixed due to async complexity.

**Risk:**  
Medium/high.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 2.5: Partial valid cache and cold failure behavior

**Purpose:**  
Define safe behavior when some or all prompt files are invalid/unavailable.

**Source:**  
Architecture partial valid cache and cold failure strategy.

**Scope:**

- Valid prompts can be served if some files are invalid.
- Invalid/conflicting prompts are excluded.
- If no valid cache exists and none can be built, all tools fail closed.
- Structured source/cache errors.

**Non-goals:**

- No hidden fallback prompt.
- No guessed prompt content.

**Dependencies:**  
Slice 2.4.

**Expected repository impact:**

```text
src/cache/PromptCache.ts
src/domain/PromptErrors.ts
test/golden/cache/
```

**Acceptance criteria:**

- Partial valid cache serves valid active prompts.
- Invalid prompts are excluded.
- Cold failure returns structured failure.
- Invocation failure includes `no_prompt_invoked: true`.

**Testing expectations:**  
Golden tests for partial valid and cold failure.

**Documentation expectations:**  
Failure behavior documented.

**QA expectations:**  
QA verifies no prompt is invented in failure cases.

**Linear task draft:**  
Title: Implement partial valid cache and cold failure behavior.

**Codex suitability:**  
Good.

**Risk:**  
Medium/high.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 2.6: Local `validate-prompts` script

**Purpose:**  
Allow prompt files to be checked locally and in CI without ChatGPT or network.

**Source:**  
Architecture tooling/developer workflow.

**Scope:**

- Read local `prompts/*.md`.
- Parse frontmatter.
- Validate schema.
- Run global slug/alias checks.
- Report drafts separately.
- Exit non-zero for invalid active prompts or conflicts.

**Non-goals:**

- No prompt editing.
- No auto-fix.
- No ChatGPT-facing validation tool.

**Dependencies:**  
Slices 1.2–1.4.

**Expected repository impact:**

```text
scripts/validate-prompts.ts
package.json
```

**Acceptance criteria:**

- `npm run validate-prompts` validates local prompt files.
- Invalid active prompt fails non-zero.
- Drafts are reported but not treated as invokable.
- Alias conflicts fail non-zero.

**Testing expectations:**  
Script-level tests or fixture smoke.

**Documentation expectations:**  
Validation script usage.

**QA expectations:**  
QA verifies script can serve as CI/local quality gate.

**Linear task draft:**  
Title: Add local prompt validation script.

**Codex suitability:**  
Good.

**Risk:**  
Low/medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 2.7: Source/cache contract and golden tests

**Purpose:**  
Freeze source/cache behavior before adding inspect/list tools.

**Source:**  
Architecture testing strategy and CI policy.

**Scope:**

- Golden tests for:
  - fresh cache;
  - stale cache;
  - failed refresh;
  - partial valid cache;
  - cold cache failure;
  - invalid/conflicting prompt exclusion.
- Contract docs for source/cache behavior.

**Non-goals:**

- No hosted deployment.
- No live network in default test gate.

**Dependencies:**  
Slices 2.1–2.6.

**Expected repository impact:**

```text
test/golden/cache/
docs/source-cache-behavior.md
```

**Acceptance criteria:**

- Golden tests assert source/cache behavior.
- Default tests remain deterministic.
- Docs explain operational behavior without exposing admin tools.

**Testing expectations:**  
Golden tests.

**Documentation expectations:**  
Source/cache contract doc.

**QA expectations:**  
QA audits cache safety before inspect/list reuse the same index.

**Linear task draft:**  
Title: Add source/cache golden tests and documentation.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 3.1: Inspect use case and projection

**Purpose:**  
Allow explicit inspection of active prompts without invoking them.

**Source:**  
Architecture inspect workflow.

**Scope:**

- `InspectPromptUseCase`.
- `toPromptInspection` projection.
- Active-only resolution.
- `inspection_only: true`.
- `no_prompt_invoked: true`.

**Non-goals:**

- No draft inspection.
- No prompt application.
- No cache diagnostics.

**Dependencies:**  
Milestone 2.

**Expected repository impact:**

```text
src/application/InspectPromptUseCase.ts
src/projection/toPromptInspection.ts
test/unit/application/
```

**Acceptance criteria:**

- Active prompt inspection returns metadata and body.
- Draft prompt inspection fails closed.
- Inspection result cannot be confused with invocation result.

**Testing expectations:**  
Unit tests.

**Documentation expectations:**  
Tool docs later in Slice 3.5.

**QA expectations:**  
QA checks non-invocation markers.

**Linear task draft:**  
Title: Implement inspect use case and projection.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 3.2: Inspect MCP adapter

**Purpose:**  
Expose explicit prompt inspection via ChatGPT-facing tool.

**Source:**  
Architecture inspect tool contract.

**Scope:**

- `inspect_prompt_library_command`.
- Input schema: `command`.
- MCP-native response.
- Failure responses with `no_prompt_invoked` where appropriate.

**Non-goals:**

- No invocation.
- No list behavior.
- No draft exposure.

**Dependencies:**  
Slice 3.1.

**Expected repository impact:**

```text
src/mcp/tools/inspectPromptLibraryCommandTool.ts
test/contract/
```

**Acceptance criteria:**

- Inspect tool returns full active prompt body and metadata.
- `inspection_only` and `no_prompt_invoked` are present.
- ChatGPT-visible receipt says inspection only.

**Testing expectations:**  
Contract tests.

**Documentation expectations:**  
Tool reference later.

**QA expectations:**  
QA verifies inspect cannot apply the prompt.

**Linear task draft:**  
Title: Expose inspect command through MCP adapter.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 3.3: List use case and summary projection

**Purpose:**  
Allow discovery of active/invokable commands without exposing prompt bodies.

**Source:**  
Architecture list workflow.

**Scope:**

- `ListPromptsUseCase`.
- `toPromptSummary` / command summary projection.
- Active-only summaries.
- Include command/slug so users know what to invoke.

**Non-goals:**

- No prompt bodies.
- No drafts.
- No cache/admin diagnostics.

**Dependencies:**  
Milestone 2.

**Expected repository impact:**

```text
src/application/ListPromptsUseCase.ts
src/projection/toPromptSummary.ts
test/unit/application/
```

**Acceptance criteria:**

- Active prompts appear in list.
- Draft prompts do not appear.
- Prompt bodies do not appear.
- Summaries include enough to invoke commands.

**Testing expectations:**  
Unit tests.

**Documentation expectations:**  
Tool docs later.

**QA expectations:**  
QA checks no prompt body leakage.

**Linear task draft:**  
Title: Implement list use case and command summary projection.

**Codex suitability:**  
Good.

**Risk:**  
Low/medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 3.4: List MCP adapter

**Purpose:**  
Expose active command discovery via ChatGPT-facing tool.

**Source:**  
Architecture list tool contract.

**Scope:**

- `list_prompt_library_commands`.
- Empty input schema.
- MCP-native response.
- Compact receipt.

**Non-goals:**

- No prompt body return.
- No draft inventory.
- No admin/debug output.

**Dependencies:**  
Slice 3.3.

**Expected repository impact:**

```text
src/mcp/tools/listPromptLibraryCommandsTool.ts
test/contract/
```

**Acceptance criteria:**

- List tool returns active summaries only.
- No prompt bodies returned.
- No cache diagnostics returned.

**Testing expectations:**  
Contract tests.

**Documentation expectations:**  
Tool docs later.

**QA expectations:**  
QA verifies runtime boundary.

**Linear task draft:**  
Title: Expose list command through MCP adapter.

**Codex suitability:**  
Good.

**Risk:**  
Low/medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 3.5: Inspect/list contract and golden tests

**Purpose:**  
Freeze the full read-only API contract.

**Source:**  
Architecture testing strategy.

**Scope:**

- Golden tests for inspect success/failure.
- Golden tests for list success/failure.
- Draft exclusion tests.
- No prompt bodies in list tests.
- Tool reference documentation.

**Non-goals:**

- No real prompt MVP yet unless needed as fixtures.

**Dependencies:**  
Slices 3.1–3.4.

**Expected repository impact:**

```text
test/golden/tools/
docs/tool-reference.md
```

**Acceptance criteria:**

- All three tool contracts are documented.
- Golden tests cover invoke/inspect/list boundaries.
- QA can audit API drift from snapshots/contracts.

**Testing expectations:**  
Golden tests.

**Documentation expectations:**  
Tool reference.

**QA expectations:**  
QA audits all read-only tool boundaries.

**Linear task draft:**  
Title: Add inspect/list golden tests and tool reference.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 4.1: Prompt authoring baseline and metadata conventions

**Purpose:**  
Prepare real prompt files with consistent metadata before adding prompt bodies.

**Source:**  
Architecture prompt model and V1 prompt set.

**Scope:**

- Confirm schema version.
- Confirm lifecycle/input mode conventions.
- Confirm alias naming rules.
- Add authoring docs.
- Optionally add empty draft examples only if not exposed.

**Non-goals:**

- No prompt editor.
- No broad prompt catalog.

**Dependencies:**  
Milestone 3.

**Expected repository impact:**

```text
docs/prompt-authoring.md
prompts/
```

**Acceptance criteria:**

- Authoring rules match validator.
- Initial prompt metadata plan is documented.

**Testing expectations:**  
`validate-prompts` ready.

**Documentation expectations:**  
Prompt authoring guide.

**QA expectations:**  
QA checks docs match actual schema.

**Linear task draft:**  
Title: Document prompt authoring conventions for MVP prompts.

**Codex suitability:**  
Good.

**Risk:**  
Low.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 4.2: Add `handoff.md`

**Purpose:**  
Add the one-shot handoff prompt as a real MVP prompt.

**Source:**  
Architecture initial local MVP prompt set.

**Scope:**

- `prompts/handoff.md`.
- Metadata:
  - lifecycle: `one_shot`
  - input_mode: `conversation_context`
  - status: `active`
- Validation and golden invocation coverage.

**Non-goals:**

- No workflow execution outside prompt text.
- No state management.

**Dependencies:**  
Slice 4.1.

**Expected repository impact:**

```text
prompts/handoff.md
test/golden/prompts/
```

**Acceptance criteria:**

- Prompt validates.
- Prompt invokes.
- Prompt inspects.
- Prompt appears in list.
- Invocation payload has exact body only plus allowed fields.

**Testing expectations:**  
Prompt validation and golden tests.

**Documentation expectations:**  
Usage example.

**QA expectations:**  
QA checks one-shot behavior wording is self-contained in prompt text.

**Linear task draft:**  
Title: Add active `handoff` MVP prompt.

**Codex suitability:**  
Good.

**Risk:**  
Medium, because prompt wording affects behavior.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 4.3: Add `grill-me.md`

**Purpose:**  
Add the interactive clarification workflow prompt as a real MVP prompt.

**Source:**  
Architecture initial local MVP prompt set and product idea handoff.

**Scope:**

- `prompts/grill-me.md`.
- Metadata:
  - lifecycle: `interactive_workflow`
  - input_mode: `either`
  - status: `active`
- Validation and golden invocation coverage.

**Non-goals:**

- No external workflow/session state.
- No connector-managed interview state.

**Dependencies:**  
Slice 4.1.

**Expected repository impact:**

```text
prompts/grill-me.md
test/golden/prompts/
```

**Acceptance criteria:**

- Prompt validates.
- Prompt invokes.
- Prompt inspects.
- Prompt appears in list.
- Prompt wording itself controls one-question-at-a-time interaction.

**Testing expectations:**  
Prompt validation and golden tests.

**Documentation expectations:**  
Usage example.

**QA expectations:**  
QA checks interactive workflow is encoded in prompt, not connector state.

**Linear task draft:**  
Title: Add active `grill-me` MVP prompt.

**Codex suitability:**  
Good/mixed, because prompt quality matters.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 4.4: Add `spec-prompt-creator.md`

**Purpose:**  
Add the persistent spec/prompt creation mode as a real MVP prompt.

**Source:**  
Architecture initial local MVP prompt set.

**Scope:**

- `prompts/spec-prompt-creator.md`.
- Metadata:
  - lifecycle: `persistent_mode`
  - input_mode: `either`
  - status: `active`
- Validation and golden invocation coverage.

**Non-goals:**

- No custom GPT replacement.
- No connector-managed mode state.

**Dependencies:**  
Slice 4.1.

**Expected repository impact:**

```text
prompts/spec-prompt-creator.md
test/golden/prompts/
```

**Acceptance criteria:**

- Prompt validates.
- Prompt invokes.
- Prompt inspects.
- Prompt appears in list.
- Prompt makes persistent-mode expectations clear inside the prompt body.

**Testing expectations:**  
Prompt validation and golden tests.

**Documentation expectations:**  
Usage example.

**QA expectations:**  
QA checks persistent mode is prompt-defined, not connector-managed.

**Linear task draft:**  
Title: Add active `spec-prompt-creator` MVP prompt.

**Codex suitability:**  
Good/mixed.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 4.5: Real prompt validation, golden tests, and local walkthrough docs

**Purpose:**  
Make the real prompt MVP usable and testable as a whole.

**Source:**  
Architecture local MVP.

**Scope:**

- End-to-end local walkthrough.
- Validation of all real prompts.
- Golden tests for invoke/list/inspect of real prompts.
- Local MVP usage docs.

**Non-goals:**

- No hosted deployment.
- No additional prompt expansion unless explicitly approved.

**Dependencies:**  
Slices 4.2–4.4.

**Expected repository impact:**

```text
docs/local-mvp-walkthrough.md
test/golden/prompts/
```

**Acceptance criteria:**

- `validate-prompts` passes.
- Invoke/list/inspect work for all MVP prompts.
- Local usage guide is enough to use the MVP.

**Testing expectations:**  
Golden tests and local smoke.

**Documentation expectations:**  
Local MVP walkthrough.

**QA expectations:**  
QA performs local MVP behavior audit.

**Linear task draft:**  
Title: Validate and document local MVP prompt set.

**Codex suitability:**  
Good.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 5.1: Personal trial protocol and results log

**Purpose:**  
Use the local MVP in real workflows before deciding to host.

**Source:**  
Architecture Slice 5.

**Scope:**

- Define trial scenarios.
- Record command used, input context, outcome, failure mode.
- Include at least the three MVP prompts.

**Non-goals:**

- No implementation changes hidden inside trial.

**Dependencies:**  
Milestone 4.

**Expected repository impact:**

```text
docs/trial-log.md
```

**Acceptance criteria:**

- Trial log exists.
- Several real sessions are recorded.
- Failures are categorized.

**Testing expectations:**  
Manual/product trial.

**Documentation expectations:**  
Trial log.

**QA expectations:**  
QA reviews evidence quality.

**Linear task draft:**  
Title: Run local personal-use trial and record results.

**Codex suitability:**  
Poor for execution, good for preparing template.

**Risk:**  
Medium.

**Handoff target:**  
QA Coordinator / user.

---

### Slice 5.2: Tool description/routing tuning

**Purpose:**  
Improve ChatGPT tool routing based on trial evidence.

**Source:**  
Trial results.

**Scope:**

- Adjust tool descriptions.
- Adjust examples.
- Avoid changing tool contracts unless necessary.
- Retest `@pl` routing.

**Non-goals:**

- No semantic routing.
- No bare-command recognition as V1 goal.

**Dependencies:**  
Slice 5.1.

**Expected repository impact:**

```text
src/mcp/tools/*
docs/trial-log.md
```

**Acceptance criteria:**

- Routing issue is improved or documented as platform limitation.
- Contract tests remain green.
- Slice 0 proof still passes or is revalidated.

**Testing expectations:**  
Manual routing retest plus contract tests.

**Documentation expectations:**  
Routing notes.

**QA expectations:**  
QA verifies tuning does not broaden scope.

**Linear task draft:**  
Title: Tune tool descriptions based on local trial routing evidence.

**Codex suitability:**  
Mixed; needs evidence, not vibes.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator if bounded, QA Coordinator for verification.

---

### Slice 5.3: Prompt wording hardening

**Purpose:**  
Improve real prompt behavior without adding connector complexity.

**Source:**  
Trial results.

**Scope:**

- Tighten wording for MVP prompts.
- Preserve metadata and contracts.
- Update golden snapshots if exact prompt bodies change intentionally.

**Non-goals:**

- No connector-managed lifecycle.
- No workflow engine.

**Dependencies:**  
Slice 5.1.

**Expected repository impact:**

```text
prompts/*.md
test/golden/prompts/
```

**Acceptance criteria:**

- Prompt changes are deliberate and reviewed.
- Tests/validation pass.
- Behavior improvement is tied to trial evidence.

**Testing expectations:**  
Prompt validation and golden update.

**Documentation expectations:**  
Changelog/trial notes.

**QA expectations:**  
QA verifies no accidental behavior drift.

**Linear task draft:**  
Title: Harden MVP prompt wording based on trial evidence.

**Codex suitability:**  
Mixed; prompt-editing quality matters.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator and QA Coordinator.

---

### Slice 5.4: Hosting readiness decision

**Purpose:**  
Decide whether to proceed to hosted deployment.

**Source:**  
Trial results and architecture hosting deferral.

**Scope:**

- Summarize trial evidence.
- Confirm CI/test/readiness state.
- Decide proceed/defer/redesign.

**Non-goals:**

- No deployment implementation.

**Dependencies:**  
Slices 5.1–5.3.

**Expected repository impact:**

```text
docs/hosting-readiness.md
```

**Acceptance criteria:**

- Decision is explicit.
- Risks are listed.
- If proceeding, Milestone 6 entry criteria are satisfied.

**Testing expectations:**  
Review gate.

**Documentation expectations:**  
Hosting readiness note.

**QA expectations:**  
QA validates the decision is evidence-based.

**Linear task draft:**  
Title: Decide hosted deployment readiness.

**Codex suitability:**  
Poor; this is a coordinator/architect decision.

**Risk:**  
Medium.

**Handoff target:**  
QA Coordinator / Architect.

---

### Slice 6.1: Hosting compatibility spike

**Purpose:**  
Choose a simple Node-compatible hosting path that supports the MCP endpoint.

**Source:**  
Architecture hosted deployment slice.

**Scope:**

- Compare practical provider options.
- Verify HTTPS/server/runtime compatibility.
- Choose one deployment target.

**Non-goals:**

- No multi-provider abstraction.
- No DB/auth.

**Dependencies:**  
Slice 5.4 proceed decision.

**Expected repository impact:**

```text
docs/hosting-spike.md
```

**Acceptance criteria:**

- Chosen provider supports required runtime/endpoint behavior.
- Decision explains tradeoffs.

**Testing expectations:**  
Small spike/smoke.

**Documentation expectations:**  
Hosting decision note.

**QA expectations:**  
QA checks provider choice does not force architecture drift.

**Linear task draft:**  
Title: Spike Node-compatible hosting for MCP endpoint.

**Codex suitability:**  
Mixed; may need current docs/research.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator / Architect.

---

### Slice 6.2: Deployment configuration

**Purpose:**  
Add the minimum configuration needed to deploy the MCP endpoint.

**Source:**  
Hosting decision.

**Scope:**

- Provider config.
- Environment/config variables.
- Build/start commands.
- Deployment docs.

**Non-goals:**

- No production observability platform.
- No DB/auth.

**Dependencies:**  
Slice 6.1.

**Expected repository impact:**

```text
provider config files
docs/deployment.md
```

**Acceptance criteria:**

- Deployment builds.
- Endpoint starts.
- Config is documented.

**Testing expectations:**  
Build/deploy smoke.

**Documentation expectations:**  
Deployment guide.

**QA expectations:**  
QA verifies local deterministic gate still passes.

**Linear task draft:**  
Title: Add deployment configuration for hosted MCP endpoint.

**Codex suitability:**  
Good/mixed.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator.

---

### Slice 6.3: Hosted endpoint smoke tests

**Purpose:**  
Verify the deployed endpoint works outside local development.

**Source:**  
Architecture deployment/readiness gate.

**Scope:**

- Hosted health/tool smoke.
- Live public source smoke.
- Basic invoke/list/inspect smoke.

**Non-goals:**

- No default CI dependency on live network.

**Dependencies:**  
Slice 6.2.

**Expected repository impact:**

```text
scripts/smoke-hosted.ts
docs/smoke-checklist.md
```

**Acceptance criteria:**

- Hosted endpoint responds.
- Tool smoke passes.
- Live public source smoke passes.

**Testing expectations:**  
Manual or opt-in smoke script.

**Documentation expectations:**  
Smoke checklist.

**QA expectations:**  
QA verifies smoke does not replace deterministic CI.

**Linear task draft:**  
Title: Add hosted endpoint smoke checks.

**Codex suitability:**  
Good/mixed.

**Risk:**  
Medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

### Slice 6.4: ChatGPT connection verification

**Purpose:**  
Verify ChatGPT can connect to and use the hosted endpoint.

**Source:**  
Architecture deployment/readiness gate.

**Scope:**

- Connect hosted endpoint to ChatGPT developer/tooling setup.
- Verify invoke/list/inspect.
- Re-run `@pl` routing checks.

**Non-goals:**

- No mobile/cross-device claims unless explicitly tested.

**Dependencies:**  
Slice 6.3.

**Expected repository impact:**

```text
docs/hosted-chatgpt-verification.md
```

**Acceptance criteria:**

- Hosted tool invocation works.
- `@pl` routing works against hosted endpoint.
- Results are recorded.

**Testing expectations:**  
Manual ChatGPT verification.

**Documentation expectations:**  
Verification log.

**QA expectations:**  
QA verifies hosted behavior matches local behavior.

**Linear task draft:**  
Title: Verify ChatGPT connection to hosted MCP endpoint.

**Codex suitability:**  
Poor for execution, good for checklist generation.

**Risk:**  
High, because platform behavior can differ from local setup.

**Handoff target:**  
QA Coordinator / user.

---

### Slice 6.5: Release/readiness documentation

**Purpose:**  
Make hosted V1 maintainable enough for personal use.

**Source:**  
Architecture delivery strategy.

**Scope:**

- Release checklist.
- Rollback/redeploy notes.
- Known limitations.
- Maintenance notes.

**Non-goals:**

- No incident management theater.
- No overbuilt ops docs.

**Dependencies:**  
Slice 6.4.

**Expected repository impact:**

```text
docs/release-readiness.md
docs/rollback.md
```

**Acceptance criteria:**

- Release checklist exists.
- Rollback path is documented.
- Known limitations are explicit.

**Testing expectations:**  
Docs review.

**Documentation expectations:**  
Release/readiness docs.

**QA expectations:**  
QA performs final readiness audit.

**Linear task draft:**  
Title: Document hosted V1 release readiness and rollback.

**Codex suitability:**  
Good.

**Risk:**  
Low/medium.

**Handoff target:**  
Codex Prompt Coordinator, then QA Coordinator.

---

## 8. Dependency map

### 8.1 High-level dependency chain

```text
Slice -1
  -> Slice 0
    -> Milestone 1: Invocation walking skeleton
      -> Milestone 2: Public source/cache/validation
        -> Milestone 3: Inspect/list tools
          -> Milestone 4: Local MVP prompts
            -> Milestone 5: Personal-use trial
              -> Milestone 6: Hosted deployment
```

### 8.2 Hard gates

```text
Slice 0 failed
  -> stop implementation
  -> try one short command-UX workaround
  -> redesign if still failed
```

```text
Milestone 1 invoke contract unstable
  -> do not build GitHub/cache
```

```text
Milestone 2 cache safety unproven
  -> do not add inspect/list on top of unsafe index/cache behavior
```

```text
Milestone 4 local MVP not useful
  -> do not host
```

### 8.3 Important sequencing rules

- Bootstrap must stay minimal.
- Slice 0 validates the product premise, not the architecture.
- Parser/schema/cache work starts only after Slice 0 passes.
- GitHub source starts only after fixture-backed invocation is stable.
- Inspect/list start only after source/cache/index behavior is safe.
- Real prompts start only after tool contracts are stable.
- Hosting starts only after local personal usefulness is proven.

---

## 9. Linear issue plan

No Linear issues are created by this roadmap. The following issue plan is ready to translate into Linear later.

### 9.1 Issue granularity rule

Recommended issue granularity:

- One issue per implementation slice for Slices -1 through 3.5.
- One issue per real MVP prompt in Milestone 4.
- One issue per trial/tuning/readiness slice in Milestone 5.
- One issue per hosting slice in Milestone 6.
- QA issues should be separate where QA gate work is materially different from implementation work.

### 9.2 Suggested labels

```text
project-prompt-library
architecture-aligned
mcp
prompt-library
slice-0
implementation
qa
contract-test
golden-test
docs
release-gate
```

### 9.3 Initial issue batch

Create only after repo exists and Slice 0 planning is accepted.

#### Linear issue draft

**Title:**  
Bootstrap minimal TypeScript/Node MCP project

**Type:**  
task

**Priority:**  
high

**Milestone:**  
M0 — Bootstrap and premise validation

**Context:**  
The project is greenfield. A minimal repository is needed before the local Slice 0 proof can run.

**Scope:**

- Create project skeleton.
- Add TypeScript/Node setup.
- Add minimal dev script.
- Add README.
- Add Slice 0 proof docs placeholder.

**Non-goals:**

- No real prompt-library implementation.
- No parser/cache/source.
- No real prompts.

**Acceptance criteria:**

- Project installs.
- TypeScript setup exists.
- Local dev script exists or is prepared for Slice 0.
- README states proof-first status.

**Dependencies:**  
None.

**Links:**

- Architecture: Architecture plan v1.0, Slice 0 premise validation.
- GitHub: TBD.
- Related Linear: TBD.

**Suggested labels:**  
`project-prompt-library`, `setup`, `slice-0`

**Suggested owner:**  
implementation

---

#### Linear issue draft

**Title:**  
Validate local `@pl proof` MCP premise

**Type:**  
spike

**Priority:**  
urgent

**Milestone:**  
M0 — Bootstrap and premise validation

**Context:**  
The project’s core premise is that ChatGPT can route command-style intent into a connector tool and apply returned prompt content. This must be proven before parser/cache/GitHub work starts.

**Scope:**

- Local TypeScript/Node MCP proof server.
- One hardcoded proof command.
- Model-visible proof prompt.
- Local tunnel/developer setup.
- Three cooperative fresh-chat runs.
- Result log.

**Non-goals:**

- No GitHub.
- No parser/schema/cache.
- No real prompts.
- No inspect/list.
- No hosting.

**Acceptance criteria:**

- Explicit tool invocation works.
- `@pl proof` routes into the tool.
- ChatGPT asks exactly one clarifying question.
- ChatGPT does not answer/solve topic yet.
- ChatGPT ends with `PPL-PROOF-001`.
- Behavior reproduces in three cooperative fresh chats.

**Dependencies:**  
Bootstrap issue.

**Links:**

- Architecture: Slice 0 / ADR validate connector premise.
- GitHub: TBD.
- Related Linear: TBD.

**Suggested labels:**  
`project-prompt-library`, `slice-0`, `mcp`, `risk-validation`, `qa`

**Suggested owner:**  
implementation + QA

---

#### Linear issue draft

**Title:**  
QA audit Slice 0 proof results

**Type:**  
QA

**Priority:**  
urgent

**Milestone:**  
M0 — Bootstrap and premise validation

**Context:**  
Slice 0 determines whether implementation may proceed. QA must verify the result, not just trust the coding agent’s report.

**Scope:**

- Review explicit invocation result.
- Review three cooperative `@pl proof` runs.
- Confirm proof behavior.
- Categorize failures if any.
- Recommend proceed/stop/redesign.

**Non-goals:**

- No implementation changes.
- No parser/cache review.

**Acceptance criteria:**

- QA report states pass/fail.
- Evidence is recorded.
- Recommendation is explicit.

**Dependencies:**  
Slice 0 implementation issue.

**Links:**

- Architecture: Slice 0 proof checklist.
- GitHub: TBD.
- Related Linear: TBD.

**Suggested labels:**  
`project-prompt-library`, `qa`, `slice-0`, `release-gate`

**Suggested owner:**  
QA

---

### 9.4 Later issue batch outline

| Slice | Suggested issue title | Type | Priority | Owner |
|---|---|---:|---:|---|
| 1.1 | Add prompt domain model and fixture harness | task | high | implementation |
| 1.2 | Implement Markdown/frontmatter parser | feature | high | implementation |
| 1.3 | Implement single prompt validation | feature | high | implementation |
| 1.4 | Implement collection validation and active command index | feature | high | implementation |
| 1.5 | Implement fixture-backed invoke use case and reduced projection | feature | high | implementation |
| 1.6 | Expose invoke command through MCP adapter | feature | high | implementation |
| 1.7 | Add invocation golden tests and contract documentation | QA/docs | high | implementation + QA |
| 2.1 | Add PromptSource boundary and fake test source | task | medium | implementation |
| 2.2 | Implement public GitHub prompt source adapter | feature | medium | implementation |
| 2.3 | Implement runtime prompt cache with TTL | feature | medium | implementation |
| 2.4 | Add stale-while-revalidate and last-known-good behavior | feature | high | implementation |
| 2.5 | Implement partial valid cache and cold failure behavior | feature | high | implementation |
| 2.6 | Add local prompt validation script | task | medium | implementation |
| 2.7 | Add source/cache golden tests and documentation | QA/docs | high | implementation + QA |
| 3.1 | Implement inspect use case and projection | feature | medium | implementation |
| 3.2 | Expose inspect command through MCP adapter | feature | medium | implementation |
| 3.3 | Implement list use case and summary projection | feature | medium | implementation |
| 3.4 | Expose list command through MCP adapter | feature | medium | implementation |
| 3.5 | Add inspect/list golden tests and tool reference | QA/docs | high | implementation + QA |
| 4.1 | Document prompt authoring conventions for MVP prompts | docs | medium | docs |
| 4.2 | Add active `handoff` MVP prompt | feature | medium | implementation |
| 4.3 | Add active `grill-me` MVP prompt | feature | medium | implementation |
| 4.4 | Add active `spec-prompt-creator` MVP prompt | feature | medium | implementation |
| 4.5 | Validate and document local MVP prompt set | QA/docs | high | implementation + QA |
| 5.1 | Run local personal-use trial and record results | QA | high | QA/user |
| 5.2 | Tune tool descriptions based on routing evidence | task | medium | implementation |
| 5.3 | Harden MVP prompt wording based on trial evidence | task | medium | implementation + QA |
| 5.4 | Decide hosted deployment readiness | release | high | architect/QA |
| 6.1 | Spike Node-compatible hosting for MCP endpoint | spike | medium | architect/implementation |
| 6.2 | Add deployment configuration for hosted MCP endpoint | task | medium | implementation |
| 6.3 | Add hosted endpoint smoke checks | QA | high | implementation + QA |
| 6.4 | Verify ChatGPT connection to hosted MCP endpoint | QA | high | QA/user |
| 6.5 | Document hosted V1 release readiness and rollback | docs | medium | docs/QA |

---

## 10. GitHub/repository implications

### 10.1 Repository status

No repository exists yet.

The first repository should be intentionally small. It should not pretend to be a mature platform. The first branch/commit sequence should make the proof-first strategy obvious.

### 10.2 Suggested repository layout after Milestone 3

```text
src/
  mcp/
    server.ts
    tools/
      invokePromptLibraryCommandTool.ts
      inspectPromptLibraryCommandTool.ts
      listPromptLibraryCommandsTool.ts
    schemas/
      toolInputSchemas.ts
      toolOutputSchemas.ts

  application/
    InvokePromptUseCase.ts
    InspectPromptUseCase.ts
    ListPromptsUseCase.ts

  domain/
    PromptDefinition.ts
    PromptMetadata.ts
    PromptLifecycle.ts
    InputMode.ts
    PromptStatus.ts
    PromptErrors.ts
    PromptResult.ts

  prompt-source/
    PromptSource.ts
    PublicGitHubPromptSource.ts
    LoadedPromptFile.ts

  prompt-parser/
    parsePromptMarkdown.ts
    frontmatterSchema.ts

  validation/
    validatePromptDefinition.ts
    validatePromptCollection.ts
    ValidationError.ts

  cache/
    PromptCache.ts
    PromptIndex.ts
    StaleWhileRevalidateCache.ts

  projection/
    toInvocationPayload.ts
    toPromptInspection.ts
    toPromptSummary.ts

  suggestions/
    suggestCommands.ts

  config/
    appConfig.ts

scripts/
  validate-prompts.ts

prompts/
  grill-me.md
  handoff.md
  spec-prompt-creator.md

test/
  fixtures/
    prompts-valid/
    prompts-invalid/
    prompts-conflicts/
  unit/
  contract/
  golden/

docs/
  slice-0-proof.md
  invocation-contract.md
  source-cache-behavior.md
  tool-reference.md
  prompt-authoring.md
  local-mvp-walkthrough.md
```

### 10.3 Dependency direction

```text
MCP adapter
  -> application use cases
    -> domain
    -> cache/index
    -> prompt source
    -> parser/validator/projection
```

Rules:

- MCP adapter contains no GitHub logic.
- MCP adapter contains no Markdown parsing.
- MCP adapter contains no alias conflict logic.
- Use cases do not know transport details.
- Parser/validator are pure/testable.
- Cache/index can be tested with fake `PromptSource`.
- `PublicGitHubPromptSource` is infrastructure only.

### 10.4 Branch and PR workflow recommendation

For the first implementation:

- One branch per slice or small slice group.
- Slice -1 and Slice 0 may be a single bootstrap/proof PR if tiny.
- Slice 1 should be split across multiple PRs.
- Every PR should state:
  - slice ID;
  - scope;
  - non-goals;
  - tests added;
  - docs updated;
  - known follow-ups.

### 10.5 Repository documentation expectations

Minimum docs over time:

```text
README.md
  - project purpose
  - V1 boundary
  - local setup
  - proof-first warning

docs/slice-0-proof.md
  - proof setup
  - manual checklist
  - result log

docs/invocation-contract.md
  - invoke response shape
  - forbidden metadata

docs/source-cache-behavior.md
  - source and cache rules

docs/tool-reference.md
  - invoke/inspect/list behavior

docs/prompt-authoring.md
  - prompt schema and authoring rules

docs/local-mvp-walkthrough.md
  - real usage examples
```

---

## 11. QA gates

QA gates are mandatory because this project’s main risk is drift: wrong prompt, wrong metadata, wrong tool shape, or accidental overreach.

### 11.1 Milestone QA gates

| Milestone | QA gate | Required before proceeding? |
|---|---|---:|
| M0 | Slice 0 manual premise validation | Yes |
| M1 | Invocation contract audit | Yes |
| M2 | Cache/source safety audit | Yes |
| M3 | Read-only API boundary audit | Yes |
| M4 | Real prompt MVP behavior audit | Yes |
| M5 | Trial evidence/readiness review | Yes before hosting |
| M6 | Hosted release readiness audit | Yes before treating hosted endpoint as usable |

### 11.2 Slice 0 QA

Verify:

- explicit tool invocation works;
- `@pl proof` routes to the tool;
- exactly one clarifying question is asked;
- no topic answer is given yet;
- `PPL-PROOF-001` appears;
- result reproduces in three cooperative fresh chats;
- failures are recorded and categorized.

### 11.3 Core QA

Verify:

- valid prompts parse and validate;
- invalid prompts are excluded;
- drafts are never invokable;
- alias collisions fail closed;
- unknown command suggestions do not invoke;
- reduced invocation payload contains no forbidden metadata.

### 11.4 MCP contract QA

Verify:

- tool names are stable;
- input schemas are correct;
- output schemas are correct;
- `structuredContent` contains expected model-visible data;
- `content` receipt stays compact;
- `_meta` is not required for prompt application;
- failure responses are unambiguous.

### 11.5 Cache QA

Verify:

- fresh cache path;
- stale cache path;
- failed refresh preserves last-known-good;
- cold source/cache failure fails closed;
- partial valid cache behavior;
- invalid/conflicting prompts are not served.

### 11.6 Runtime boundary QA

Verify no V1 boundary drift:

- no cache refresh tool;
- no draft listing;
- no draft inspection;
- no prompt editing;
- no private prompts;
- no account/auth flow;
- no raw chat transcript input requested;
- no semantic routing;
- no workflow/session engine.

---

## 12. Documentation gates

### 12.1 Documentation by milestone

| Milestone | Required documentation |
|---|---|
| M0 | README, local setup, Slice 0 proof checklist/result log |
| M1 | Invocation contract and prompt metadata/schema draft |
| M2 | Source/cache behavior and `validate-prompts` usage |
| M3 | Tool reference for invoke/inspect/list |
| M4 | Prompt authoring guide and local MVP walkthrough |
| M5 | Trial log, known limitations, hosting readiness decision |
| M6 | Deployment guide, smoke checklist, release/rollback notes |

### 12.2 Documentation rules

- Docs must be updated when behavior/setup changes.
- Docs must not describe future private prompt features as implemented.
- Docs must call out V1 non-goals where users/agents might otherwise infer them.
- Prompt lifecycle behavior belongs in prompt wording and docs, not connector state.

---

## 13. CI/release gates

### 13.1 Blocking deterministic CI gate

Run on every PR/commit once the relevant tooling exists:

```text
install
lint / format check
TypeScript typecheck
unit tests
contract tests
golden tests
local prompt schema validation
no-network tests for core logic
```

Recommended scripts:

```json
{
  "scripts": {
    "dev": "tsx src/mcp/server.ts",
    "build": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run test/unit",
    "test:contract": "vitest run test/contract",
    "test:golden": "vitest run test/golden",
    "validate-prompts": "tsx scripts/validate-prompts.ts"
  }
}
```

Equivalent tooling is acceptable, but capabilities should remain.

### 13.2 CI failure policy

Fail CI if:

- invocation payload contains forbidden metadata;
- draft prompt appears in list/invoke/inspect;
- unknown command auto-executes suggestion;
- alias conflict is resolved by order/priority;
- invalid prompt is served;
- golden response shape changes without explicit review;
- core tests require network access.

### 13.3 Deployment/readiness gate

Run before hosted deployment, not as default commit gate:

- deterministic CI gate;
- local MCP server smoke;
- live public source smoke;
- ChatGPT developer/tooling smoke if available;
- verify `@pl` routing still works;
- verify hosted HTTPS endpoint.

---

## 14. Risks and mitigations

### Risk: `@pl` command-style routing does not work reliably

**Impact:**  
Core product premise fails.

**Mitigation:**

- Slice 0 validates before real implementation.
- Tool name should be descriptive.
- Tool description should mention `@pl <command>` usage.
- If `@pl proof` fails, try one short command-UX workaround.
- If no natural command-like pattern works, stop and redesign.

### Risk: returned prompt is retrieved but not applied

**Impact:**  
Connector works technically but product fails behaviorally.

**Mitigation:**

- Slice 0 proof prompt forces observable behavior.
- Prompt body must be model-visible in `structuredContent` or `content`.
- Do not hide prompt body only in `_meta`.
- Golden tests verify response shape; manual Slice 0 validates behavior.

### Risk: metadata pollutes context

**Impact:**  
Prompt application drifts because operational details leak into the active chat.

**Mitigation:**

- Normal invocation returns only `title`, `lifecycle`, `input_mode`, `prompt_body`.
- Debug/source/cache metadata excluded.
- Golden tests assert forbidden fields are absent.

### Risk: connector becomes prompt/admin platform

**Impact:**  
V1 becomes too large and muddled.

**Mitigation:**

- No write tools.
- No draft management.
- No cache refresh tool.
- Active-only list/inspect/invoke.
- Local tooling handles validation.

### Risk: runtime cache serves stale or invalid data

**Impact:**  
Wrong prompt can be invoked or valid prompt availability can break.

**Mitigation:**

- Five-minute TTL.
- Last-known-good cache.
- Failed refresh never overwrites good cache.
- Strict validation before cache acceptance.
- Invalid/conflicting prompts excluded.

### Risk: future private-suite needs distort V1

**Impact:**  
Premature auth/encryption/user design bloats implementation.

**Mitigation:**

- Preserve small `PromptSource` seam.
- Keep source details out of use cases.
- Document future private-suite requirements.
- Do not implement them in V1.

### Risk: TypeScript/MCP/App SDK changes

**Impact:**  
Platform wiring may shift.

**Mitigation:**

- Thin MCP adapter.
- Framework-independent core.
- Contract tests isolate tool shape.
- Avoid UI widget dependency.

### Risk: coding-agent drift

**Impact:**  
Agents build too much, wrong things, or silently violate architecture boundaries.

**Mitigation:**

- One slice per prompt.
- Explicit scope/non-goals.
- TDD for core.
- Contract/golden tests.
- QA boundary audits.
- Handoffs include forbidden behavior.

---

## 15. Open questions

Non-blocking for Slice -1 and Slice 0:

1. Exact production hosting provider.
2. Exact package manager: npm vs pnpm.
3. Exact HTTP runtime/server library for MCP endpoint.
4. Exact final tool descriptions after Slice 0 routing evidence.
5. Exact final prompt wording for:
   - `handoff`
   - `grill-me`
   - `spec-prompt-creator`
6. Whether broader initial prompt candidates are added immediately after local MVP or after personal trial.
7. Future private-suite design:
   - user identity;
   - DB schema;
   - encryption model;
   - prompt visibility to model;
   - per-user command conflicts;
   - public/private precedence.
8. Whether a UI component ever becomes useful for browsing/inspection.

Blocking before later milestones:

- Before Milestone 2: public GitHub repo/path must exist or be chosen.
- Before Milestone 6: hosting provider must be selected.
- Before adding extra prompts: local MVP quality must be stable.

---

## 16. Handoff to Codex Prompt Coordinator

```text
Handoff to Codex Prompt Coordinator

Project:
Project Prompt Library

Roadmap source:
project-prompt-library-roadmap.md and architecture plan v1.0

Recommended next slice:
Slice -1, immediately followed by Slice 0.

Why this slice:
The project is greenfield and the architecture requires Slice 0 premise validation before real product implementation. A minimal repo bootstrap is needed only so the proof can run.

Scope:
Slice -1:
- Create minimal TypeScript/Node project skeleton.
- Add local dev script setup.
- Add README and Slice 0 proof docs placeholder.

Slice 0:
- Implement local TypeScript/Node MCP proof server.
- Expose one hardcoded proof command through a tool, preferably `invoke_prompt_library_command` unless SDK constraints require a temporary name.
- Accept structured input: `command` and optional `attached_input`.
- Hardcode command `proof`.
- Return hardcoded proof prompt in model-visible tool result data.
- Provide local tunnel/developer setup notes.
- Add manual validation checklist and result log.

Non-goals:
- No GitHub prompt source.
- No Markdown parser.
- No YAML frontmatter.
- No schema validation.
- No runtime cache.
- No real prompts.
- No inspect/list tools.
- No hosted deployment.
- No private prompt design.

Dependencies:
None for Slice -1. Slice 0 depends on Slice -1.

Relevant architecture:
- V1 is a TypeScript/Node tool-only MCP/App connector.
- Slice 0 validates whether ChatGPT can route `@pl proof` to the connector and apply the returned prompt.
- Prompt body must be model-visible in `structuredContent` or `content`, not hidden only in `_meta`.
- Do not implement real prompt-library architecture before Slice 0 passes.

Suggested Linear issue:
Validate local `@pl proof` MCP premise.

Testing expectations:
- Explicit tool invocation sanity check.
- Three cooperative fresh ChatGPT chats using `@pl proof`.
- ChatGPT must ask exactly one clarifying question.
- ChatGPT must not answer or solve the topic yet.
- ChatGPT must end with `PPL-PROOF-001`.

Documentation expectations:
- README local setup.
- Slice 0 proof instructions.
- Tunnel/developer setup notes.
- Result log template.

Risks:
- ChatGPT may not route `@pl proof` reliably.
- ChatGPT may retrieve but not apply returned prompt content.
- Coding agent may overbuild parser/cache/GitHub prematurely.

Suggested coordinator instruction:
Create a Codex implementation prompt for Project Prompt Library Slice -1 and Slice 0. Keep the work proof-first and minimal. The goal is to bootstrap a tiny TypeScript/Node MCP project and validate the `@pl proof` premise with a hardcoded model-visible prompt. Explicitly forbid GitHub source, Markdown parsing, YAML frontmatter, schema validation, cache, real prompts, inspect/list tools, hosted deployment, and private-suite design. Include scope, non-goals, likely files, manual validation checklist, and acceptance criteria.
```

---

## 17. Handoff to QA Coordinator

```text
Handoff to QA Coordinator

Project:
Project Prompt Library

Roadmap source:
project-prompt-library-roadmap.md and architecture plan v1.0

QA planning target:
Slice 0 first, then Milestone 1 invocation contract.

Quality risks:
- ChatGPT may not route `@pl proof` into the tool.
- ChatGPT may retrieve but not apply returned prompt content.
- The proof may accidentally test explicit manual tool calling but not command-style invocation.
- Coding agents may overbuild real architecture before the proof passes.
- Later implementation may leak metadata into invocation payload.
- Drafts/invalid prompts may accidentally become invokable.
- Alias conflicts may be resolved by order instead of failing closed.

Expected test levels:
Slice 0:
- manual premise validation;
- explicit tool invocation sanity check;
- three cooperative fresh-chat `@pl proof` runs.

Milestone 1+:
- unit tests;
- contract tests;
- fixture-based golden tests;
- no-network core tests.

QA gates:
- Slice 0 pass/fail gate before any real implementation.
- Invocation contract audit before GitHub/cache work.
- Cache safety audit before inspect/list.
- Read-only API audit before real prompts.
- Real prompt behavior audit before personal trial.
- Trial evidence review before hosting.
- Hosted release readiness audit before treating hosted endpoint as usable.

Linear QA task suggestions:
- QA audit Slice 0 proof results.
- QA audit invocation contract and payload hygiene.
- QA audit source/cache safety behavior.
- QA audit read-only API boundary.
- QA audit real MVP prompts.
- QA review personal-use trial evidence.
- QA audit hosted release readiness.

Suggested QA Coordinator instruction:
Create a QA strategy and Slice 0 QA checklist for Project Prompt Library based on the roadmap and architecture plan. Focus first on validating the `@pl proof` premise. The checklist must verify explicit tool invocation, command-style `@pl proof` routing, exactly one clarifying question, no topic answer yet, the `PPL-PROOF-001` marker, and reproduction across three cooperative fresh chats. Also define what failure evidence should stop implementation before Slice 1.
```

---

## 18. Suggested next actions

1. Create the GitHub repository only after deciding repo name/visibility.
2. Give this roadmap to the **Codex Prompt Coordinator** and ask for a Slice -1 / Slice 0 coding-agent prompt.
3. Run Slice -1 and Slice 0 before any parser/cache/GitHub implementation.
4. Give the Slice 0 proof setup to the **QA Coordinator** for a manual validation checklist.
5. If Slice 0 passes, proceed to Milestone 1 in small implementation slices.
6. If Slice 0 fails, stop and redesign command invocation before touching the rest. No parser heroics. No cache ceremony. No building the castle on swamp gas.
