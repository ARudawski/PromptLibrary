import { describe, expect, it } from "vitest";
import { createFixtureBackedInvokePromptUseCase } from "../../../src/application/index.js";
import { FakePromptSource, fakeLoadedPromptFile } from "../../helpers/FakePromptSource.js";

describe("createFixtureBackedInvokePromptUseCase", () => {
  it("composes invocation from the PromptSource boundary without filesystem access", async () => {
    const promptSource = new FakePromptSource([
      fakeLoadedPromptFile({
        sourcePath: "fake://fake-active.md",
        rawMarkdown: `---
schema_version: "1"
slug: fake-active
title: Fake Active
description: Fake source active prompt.
aliases:
  - fake-alias
lifecycle: one_shot
input_mode: attached_input
status: active
---

Apply the fake active prompt.
`,
      }),
      fakeLoadedPromptFile({
        sourcePath: "fake://missing-required-field.md",
        rawMarkdown: `---
schema_version: "1"
slug: missing-required
title: Missing Required
description: Missing aliases should keep this prompt out.
lifecycle: one_shot
input_mode: attached_input
status: active
---

This invalid prompt must not invoke.
`,
      }),
    ]);

    const useCase = await createFixtureBackedInvokePromptUseCase({ promptSource });

    expect(useCase.execute({ command: "fake-alias" })).toEqual({
      kind: "success",
      value: {
        title: "Fake Active",
        lifecycle: "one_shot",
        input_mode: "attached_input",
        prompt_body: "Apply the fake active prompt.\n",
      },
    });
    expect(useCase.execute({ command: "missing-required" })).toEqual({
      kind: "failure",
      error: {
        reason: "command_not_found",
        message: 'Command "missing-required" was not found.',
      },
    });
  });
});
