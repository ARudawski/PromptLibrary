import { describe, expect, it } from "vitest";
import { FakePromptSource, fakeLoadedPromptFile } from "../../helpers/FakePromptSource.js";

describe("FakePromptSource", () => {
  it("returns deterministic loaded prompt files without reading from filesystem or network", async () => {
    const promptFiles = [
      fakeLoadedPromptFile({
        sourcePath: "fake://active-basic.md",
        rawMarkdown: "raw prompt markdown",
      }),
    ];
    const source = new FakePromptSource(promptFiles);

    await expect(source.loadAllPrompts()).resolves.toEqual(promptFiles);
  });

  it("returns a fresh array on each load so tests can mutate local copies safely", async () => {
    const source = new FakePromptSource([
      fakeLoadedPromptFile({
        sourcePath: "fake://copy.md",
        rawMarkdown: "copy body",
      }),
    ]);

    const firstLoad = await source.loadAllPrompts();
    const secondLoad = await source.loadAllPrompts();

    expect(secondLoad).toEqual(firstLoad);
    expect(secondLoad).not.toBe(firstLoad);
  });
});
