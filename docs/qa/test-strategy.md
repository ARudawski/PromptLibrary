# Test Strategy — Project Prompt Library

Status: QA strategy v1.0  
Date: 2026-06-18  
Owner: QA Coordinator  
Project phase: proof-first bootstrap, before Slice 0 implementation

---

## 1. QA goal

The QA goal is to keep Project Prompt Library safe to develop with AI coding agents by controlling the risks that matter most:

- the `@pl` command premise may not work in ChatGPT;
- a returned prompt may be retrieved but not applied as model behavior;
- the connector may invoke the wrong prompt;
- drafts, invalid prompts, or conflicted aliases may leak into runtime behavior;
- operational metadata may pollute the model-visible invocation payload;
- cache/source behavior may replace a safe last-known-good state with unsafe data;
- coding agents may overbuild V1 into an editor, workflow engine, admin surface, private prompt system, or semantic router.

This is not a coverage-percentage exercise. The important quality target is meaningful regression protection around exact prompt invocation, fail-closed behavior, and architecture boundaries.

---

## 2. Source material reviewed

Project documents:

- `README.md`
- `AGENTS.md`
- `docs/idea-handoff.md`
- `docs/architecture/README.md`
- `docs/roadmap/README.md`
- `docs/standards/README.md`
- `docs/slice-0-proof.md`
- Approved architecture plan v1.0 from project planning context
- Approved implementation roadmap v1.0 from project planning context
- Codex agent architecture/code standards v1.0 from project planning context

Repository state inspected:

- TypeScript/Node bootstrap exists.
- `package.json` already defines `typecheck`, `lint`, `test`, `test:unit`, `test:contract`, `test:golden`, and `validate-prompts` scripts.
- `tsconfig.json` uses strict TypeScript settings.
- `src/mcp/server.ts` is still a Slice 0 placeholder.
- `test/README.md` exists and currently states that automated core tests begin with Slice 1.

Linear state inspected:

- Linear project exists: `Project Prompt Library`.
- Project is currently in Backlog.
- No Linear issues exist yet.
- No Linear issue acceptance criteria override the architecture or roadmap.

---

## 3. System under test

### Current system under test

For the current phase, the system under test is the Slice 0 proof setup:

- local TypeScript/Node MCP server;
- one hardcoded proof command;
- model-visible returned proof prompt;
- ChatGPT tool-routing behavior for `@pl proof`;
- manual evidence that ChatGPT applies the returned prompt as behavior.

### Later system under test

After Slice 0 passes, the system under test expands to:

- prompt domain model;
- Markdown/YAML frontmatter parsing;
- prompt validation;
- slug/alias collection validation;
- active command index;
- invocation projection;
- MCP tool response contracts;
- public GitHub prompt source;
- runtime cache with TTL, stale-while-revalidate, and last-known-good behavior;
- inspect/list read-only tools;
- real MVP prompt files.

---

## 4. Scope

### Current QA scope

QA currently covers:

- Slice 0 premise validation;
- repository bootstrap boundary check;
- manual proof checklist quality;
- evidence requirements before continuing to Slice 1;
- defining the later automated test strategy so implementation agents know where the guardrails are.

### Later QA scope

After Slice 0 passes, QA covers:

- unit tests for deterministic core behavior;
- MCP/tool contract tests;
- fixture-based golden tests;
- no-network enforcement for core tests;
- prompt validation fixtures;
- source/cache behavior tests;
- read-only runtime API boundary tests;
- real prompt integrity tests;
- CI gate review;
- release/readiness reviews.

---

## 5. Non-goals

QA does not cover these in V1 because they are outside V1 scope:

- prompt editing in ChatGPT;
- draft management through ChatGPT;
- cache refresh/invalidation tools exposed to ChatGPT;
- private prompt suites;
- user accounts;
- OAuth/user-token flows;
- encrypted private prompt storage;
- database-backed prompt records;
- multi-source prompt merging;
- team/shared prompt spaces;
- prompt marketplace behavior;
- semantic search;
- automatic prompt selection;
- workflow/session state management;
- prompt composition engine;
- external agent orchestration;
- Vaadin, Elasticsearch, Java/Spring backend work for V1.

QA should treat accidental implementation of any of these as architecture drift, not as bonus functionality. Bonus functionality is how small projects get ceremonial hats and then drown.

---

## 6. Risk model

| Risk | Impact | QA control |
|---|---|---|
| `@pl proof` does not route to tool | Product premise fails | Slice 0 manual gate in three fresh chats |
| Prompt retrieved but not applied | Connector works technically, product fails behaviorally | Proof prompt with observable behavior and marker |
| Proof only tests explicit tool call | False confidence | Separate explicit sanity check from `@pl proof` product gate |
| Wrong prompt invoked | User gets incorrect workflow | Unit/golden tests for slug and alias resolution |
| Unknown command guessed/executed | Loss of exactness | Fail-closed tests and non-executing suggestion tests |
| Alias conflict resolved by order | Non-deterministic unsafe behavior | Collection validation and golden conflict tests |
| Draft prompt exposed | Incomplete prompts become runtime behavior | Active-only tests for invoke/list/inspect |
| Invalid prompt served | Broken prompt enters model context | Validation tests and fixture exclusions |
| Invocation payload leaks metadata | Model behavior polluted by operational detail | Golden tests asserting exact allowed keys and forbidden-key absence |
| Prompt body hidden only in `_meta` | Model cannot apply prompt | Contract tests for model-visible `structuredContent` or `content` |
| Cache refresh destroys known-good state | Previously working commands fail or unsafe prompts served | Cache unit/golden tests with fake source and fake clock |
| Core tests hit network | Flaky CI and false failures | No-network rule for unit/contract/golden tests |
| Coding agent overbuilds V1 | Scope and architecture drift | QA boundary audit per slice |
| Docs and code disagree | Agents implement stale expectations | Documentation gate per milestone |
| Linear acceptance criteria later conflict with architecture | Ambiguous source of truth | QA stops and escalates conflict before prompting agents |

---

## 7. Test levels

### 7.1 Slice 0 manual premise validation

Slice 0 is not primarily an automated-test problem. It must prove platform behavior.

Required checks:

1. Start local MCP proof server.
2. Connect it through the chosen ChatGPT developer/tunnel setup.
3. Perform explicit/manual tool invocation as a platform sanity check.
4. Run `@pl proof` in three cooperative fresh chats.
5. Confirm each run:
   - called the connector tool;
   - passed `command: "proof"`;
   - made the hardcoded prompt model-visible;
   - asked exactly one clarifying question;
   - did not answer or solve the user topic yet;
   - ended with `PPL-PROOF-001`.
6. Record all evidence in `docs/slice-0-proof.md` or a linked result log.

Pass condition:

- All three cooperative `@pl proof` fresh-chat runs pass.

Fail condition:

- `@pl proof` cannot be routed naturally after one short command-UX workaround attempt.
- The prompt is returned but not applied as behavior.
- The assistant answers the topic instead of asking one clarifying question.
- The marker is missing in repeated cooperative runs.

If Slice 0 fails, implementation must stop before parser/cache/GitHub/schema work.

### 7.2 Unit tests

Unit tests cover pure deterministic behavior. They start with Slice 1.

Required unit-test areas:

- Markdown/frontmatter parsing;
- exact prompt body preservation;
- required metadata validation;
- lifecycle/input/status enum validation;
- slug and alias format validation;
- empty prompt body rejection;
- duplicate slug detection;
- alias/slug conflict detection;
- duplicate alias detection;
- active-only index construction;
- draft exclusion;
- invocation projection;
- unknown command failure;
- suggestions as non-executing results;
- cache TTL state;
- stale-while-revalidate behavior;
- last-known-good preservation.

### 7.3 Contract tests

Contract tests cover MCP-facing tool shapes without real ChatGPT.

Required contract-test areas:

- tool names;
- tool input schemas;
- tool output schemas;
- success response shape;
- failure response shape;
- model-visible `prompt_body` in invocation result;
- compact visible receipt text;
- `_meta` not required for model-needed prompt body;
- failure responses include `no_prompt_invoked: true` where behavior ambiguity matters.

### 7.4 Golden tests

Golden tests freeze exact response payloads and absence of forbidden keys.

Required golden scenarios:

- valid active prompt invocation;
- alias invocation;
- unknown command with optional suggestion;
- draft prompt not invokable;
- invalid prompt excluded;
- duplicate slug conflict;
- alias conflict;
- inspection success/failure;
- list success/failure;
- no prompt bodies in list output;
- cold cache failure;
- partial valid cache behavior;
- failed refresh preserving last-known-good cache.

Golden tests must assert exact allowed invocation payload keys:

```text
title
lifecycle
input_mode
prompt_body
```

Golden tests must also assert absence of forbidden invocation metadata:

```text
slug
aliases
description
status
hash
source_path
repo_commit
indexed_at
validation diagnostics
cache diagnostics
debug_marker
prompt_version
created_at
updated_at
```

### 7.5 Integration smoke tests

Integration smoke tests are opt-in and not part of the default deterministic gate.

Smoke tests may cover:

- live public GitHub source read;
- local MCP endpoint connectivity;
- hosted endpoint connectivity;
- ChatGPT developer/tooling connection;
- hosted `@pl` routing after deployment.

Smoke failures should block deployment/readiness, not normal core commits.

### 7.6 Manual verification

Manual verification is allowed only where the platform cannot be deterministically simulated:

- Slice 0 ChatGPT command-routing proof;
- personal-use trial evidence;
- hosted ChatGPT connection verification.

Manual QA must be checklist-based and evidence-backed. “Looks fine” is not a QA method; it is a vibe with a clipboard.

---

## 8. Test data and fixtures

### 8.1 Fixture directory plan

Expected fixture layout after Slice 1 begins:

```text
test/
  fixtures/
    prompts-valid/
    prompts-invalid/
    prompts-conflicts/
  unit/
  contract/
  golden/
```

### 8.2 Minimum Slice 1 fixtures

Create fixtures for:

- one valid active prompt;
- one active prompt with alias;
- one draft prompt;
- one invalid prompt missing a required field;
- one invalid prompt with malformed YAML;
- one invalid prompt with empty body;
- duplicate slug conflict;
- alias equals another active prompt slug;
- duplicate alias conflict;
- unknown command suggestion case.

### 8.3 Later fixture additions

For cache/source work:

- fake source success;
- fake source unavailable;
- fake source returns partial invalid set;
- fake source returns conflict set;
- fake source returns no valid prompts;
- fake refresh fails after a valid cache exists;
- fake refresh succeeds after stale cache.

For real MVP prompts:

- `handoff` validates and invokes;
- `grill-me` validates and invokes;
- `spec-prompt-creator` validates and invokes;
- all three inspect successfully;
- all three appear in list summaries;
- prompt bodies remain exact in invocation payload.

---

## 9. CI and quality gates

### 9.1 Current repository scripts

The repository already declares the intended deterministic gate scripts:

```text
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:unit
npm run test:contract
npm run test:golden
npm run validate-prompts
```

During the bootstrap phase some commands may fail or be placeholders because real tests/scripts are not implemented yet. Coding and QA agents must report this plainly instead of pretending the gate is complete.

### 9.2 Blocking deterministic gate

Once relevant tooling exists, every implementation PR should pass:

```text
install
format check
lint
TypeScript typecheck
unit tests
contract tests
golden tests
local prompt schema validation
```

### 9.3 CI failure policy

CI must fail if:

- invocation payload contains forbidden metadata;
- draft prompt appears in invoke/list/inspect;
- unknown command auto-executes a suggestion;
- alias conflict is resolved by order or priority;
- invalid prompt is served;
- invocation prompt body is hidden only in `_meta`;
- golden response shape changes without explicit review;
- core tests require network access;
- `validate-prompts` accepts invalid active prompt files or alias conflicts.

### 9.4 Deployment/readiness gate

Before hosted deployment:

- deterministic gate green;
- local MCP smoke passes;
- live public source smoke passes;
- ChatGPT developer/tooling smoke passes if available;
- hosted HTTPS endpoint smoke passes;
- `@pl` routing works against hosted endpoint.

Hosted deployment must not be approved just because the server starts. A running useless connector is still a useless connector, only with hosting bills.

---

## 10. QA responsibilities

### 10.1 Implementation agent

Owns:

- feature implementation;
- tests required by the implementation slice;
- keeping changes within scope;
- running available deterministic checks;
- reporting failures honestly;
- updating docs when behavior changes.

Does not own:

- broad QA strategy;
- release approval;
- architecture decision changes;
- uncontrolled production-code refactors during QA slices.

### 10.2 QA Codex agent

Owns:

- repository inspection;
- test-suite audit;
- adding/updating tests when explicitly allowed;
- running available checks;
- identifying coverage gaps;
- checking architecture/test/docs alignment;
- reporting remaining risk.

Does not own:

- product bug fixes unless explicitly allowed;
- architecture redesign;
- merging PRs;
- closing Linear issues.

### 10.3 Audit/review agent

Owns:

- independent boundary review;
- checking implementation against architecture, roadmap, and standards;
- calling out drift and contradictions.

Does not own:

- writing implementation code in the same uncontrolled pass.

### 10.4 Human/manual verification

Owns:

- ChatGPT platform proof evidence where automation cannot inspect behavior;
- judging whether personal-use trial justifies hosting;
- resolving architecture/product conflicts.

### 10.5 QA Coordinator

Owns:

- this strategy;
- QA slice selection;
- QA prompt creation;
- QA report intake;
- Linear QA task recommendations;
- release/readiness recommendation.

---

## 11. Acceptance criteria

### 11.1 Current stage acceptance criteria

Current stage is tested enough when:

- Slice 0 proof implementation exists;
- explicit tool invocation sanity check is recorded;
- three cooperative fresh-chat `@pl proof` runs are recorded;
- all three runs show exactly one clarifying question, no topic answer, and `PPL-PROOF-001`;
- failures, if any, are categorized;
- QA gives an explicit proceed/stop recommendation.

### 11.2 Milestone 1 acceptance criteria

Milestone 1 is tested enough when:

- parser, validation, collection index, invocation use case, and MCP invoke adapter have unit/contract/golden coverage;
- draft and invalid prompts cannot invoke;
- unknown commands fail closed;
- alias conflicts fail closed;
- invocation payload contains only allowed fields;
- normal visible receipt is compact;
- prompt body is model-visible;
- no core tests require network.

### 11.3 Milestone 2 acceptance criteria

Milestone 2 is tested enough when:

- source/cache behavior is tested with fake sources and fake time;
- last-known-good survives failed refresh;
- unsafe refresh results do not replace valid cache;
- partial valid cache behavior is deterministic;
- cold failure fails closed;
- `validate-prompts` works locally and in CI context;
- no ChatGPT-facing cache refresh tool exists.

### 11.4 Milestone 3 acceptance criteria

Milestone 3 is tested enough when:

- inspect/list tools have contract and golden tests;
- inspect is explicitly inspection-only and non-invoking;
- list returns active summaries only;
- drafts are not exposed;
- list does not return prompt bodies;
- only the three approved runtime tools exist.

### 11.5 Milestone 4 acceptance criteria

Milestone 4 is tested enough when:

- all three real MVP prompts validate;
- all three invoke/list/inspect correctly;
- golden tests cover real prompt payloads;
- prompt behavior matches lifecycle/input mode expectations;
- local MVP walkthrough is documented.

### 11.6 Milestone 5 and 6 acceptance criteria

Personal-use trial and hosted deployment are tested enough when:

- real-use evidence exists;
- routing failures are categorized;
- prompt wording/tool descriptions are tuned only from evidence;
- hosting readiness decision is explicit;
- hosted smoke and ChatGPT connection verification pass before treating hosted V1 as usable.

---

## 12. Linear task recommendations

No Linear issues exist yet, so these are recommendations only. Do not create them unless explicitly requested.

### Task 1

Title: QA audit Slice 0 proof results  
Type: QA  
Priority: urgent  
Suggested owner: QA

Acceptance criteria:

- explicit tool invocation sanity check reviewed;
- three cooperative `@pl proof` runs reviewed;
- exact one-question/no-answer/marker behavior verified;
- failures categorized if present;
- proceed/stop recommendation recorded.

### Task 2

Title: QA audit invocation contract and payload hygiene  
Type: QA  
Priority: high  
Suggested owner: QA

Acceptance criteria:

- invoke tool contract reviewed;
- model-visible prompt body verified;
- compact receipt verified;
- forbidden metadata absence verified;
- draft/invalid/unknown/alias-conflict behavior verified.

### Task 3

Title: QA audit source/cache safety behavior  
Type: QA  
Priority: high  
Suggested owner: QA

Acceptance criteria:

- fresh/stale cache behavior verified;
- failed refresh preserves last-known-good;
- partial valid cache behavior verified;
- cold failure fails closed;
- no ChatGPT-facing cache refresh tool exists.

### Task 4

Title: QA audit read-only API boundary  
Type: QA  
Priority: high  
Suggested owner: QA

Acceptance criteria:

- invoke/inspect/list are the only runtime tools;
- inspect is inspection-only;
- list does not return prompt bodies;
- drafts are not exposed;
- no admin/draft/edit/cache tools exist.

### Task 5

Title: QA audit real MVP prompt behavior  
Type: QA  
Priority: high  
Suggested owner: QA

Acceptance criteria:

- `handoff`, `grill-me`, and `spec-prompt-creator` validate;
- all three invoke/list/inspect correctly;
- prompt bodies remain exact;
- lifecycle/input mode metadata matches intended behavior.

### Task 6

Title: QA review personal-use trial evidence  
Type: QA  
Priority: high  
Suggested owner: QA / human

Acceptance criteria:

- trial log reviewed;
- routing failures categorized;
- readiness recommendation made before hosting.

### Task 7

Title: QA audit hosted release readiness  
Type: QA  
Priority: high  
Suggested owner: QA / human

Acceptance criteria:

- deterministic gate green;
- local smoke passes;
- hosted endpoint smoke passes;
- ChatGPT hosted connection verified;
- rollback/redeploy notes exist.

---

## 13. Open questions

These do not block Slice 0:

1. Exact final MCP server implementation shape after SDK proof work starts.
2. Exact final tool descriptions after Slice 0 routing evidence.
3. Exact final prompt wording for the three MVP prompts.
4. Whether GitHub Actions CI should be added during Slice -1/0 or delayed until Slice 1 tests exist.
5. Whether Linear milestones should be created now or after Slice 0 passes.
6. Whether QA agents may create tests directly during later QA slices, or should only report gaps unless explicitly prompted.

Blocking later:

- Before Slice 1: Slice 0 must pass or architecture must be revised.
- Before Slice 2: public GitHub prompt source path/config must be chosen.
- Before hosting: personal-use trial must justify hosted deployment.

---

## 14. Recommended next QA slice

Recommended QA slice: Slice 0 proof validation checklist hardening

Why this slice:

Slice 0 is the unique product-premise gate. If it fails, all parser/cache/GitHub work is polished furniture for a house with no floor.

Scope:

- Review Slice 0 proof implementation once available.
- Verify explicit tool invocation and `@pl proof` routing.
- Review three fresh-chat runs.
- Categorize failures.
- Recommend proceed/stop/redesign.

Non-goals:

- Do not audit parser/cache/GitHub behavior before it exists.
- Do not create automated core tests for Slice 0 unless implementation makes a tiny smoke test cheap.
- Do not approve Slice 1 unless product-relevant `@pl proof` evidence exists.

Inputs required:

- Slice 0 implementation branch/PR or repo state;
- local run/tunnel instructions;
- proof result log;
- any workaround attempt result if first command-style attempt fails.

Risk: high

QA Codex suitability: mixed

- Good for repository inspection and checklist/report generation.
- Poor for actually verifying ChatGPT fresh-chat behavior, which needs human/platform execution.

Linear action: draft task only

---

## 15. QA Coordinator Ledger

Project:  
Project Prompt Library

Source material:  
Idea handoff, architecture plan, roadmap, Codex standards, GitHub repository, Linear project

Current QA target:  
Project / Slice 0 premise validation

Current phase:  
strategy

Test strategy status:  
drafted

Linked Linear items:  
Project Prompt Library exists; no issues yet

Linked GitHub items:  
Repository: `ARudawski/PromptLibrary`  
Current docs: README, AGENTS, Slice 0 proof checklist, architecture/roadmap/standards summaries  
Current code: Slice 0 placeholder MCP server

Locked QA scope:  
Slice 0 manual premise validation first; later unit/contract/golden tests after Slice 0 passes

Non-goals:  
No QA work for private suites, DB/auth, editor/admin tools, semantic routing, workflow engine, hosted deployment before local usefulness

Open questions:  
See section 13

Current QA slice:  
Slice 0 proof validation checklist hardening

Prompt status:

- Strategy validation: not created
- Test-suite audit: not created
- Test implementation: not created
- Contract/API QA: not created
- Regression QA: not needed
- Release/readiness QA: not created

Linear actions:  
drafted recommendations only; no tasks created

Risks:  
`@pl` routing failure, returned prompt not applied, coding-agent overbuild, future metadata/cache/API drift

Next action:  
Run Slice 0 implementation, then perform QA intake on the proof result log before allowing Slice 1.
