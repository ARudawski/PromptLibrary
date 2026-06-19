import { describe, expect, it } from "vitest";
import { suggestCommands } from "../../../src/suggestions/index.js";

describe("suggestCommands", () => {
  it("suggests active commands by simple command text match", () => {
    expect(suggestCommands("active", ["active-basic", "active-with-alias", "alias-basic"])).toEqual(
      ["active-basic", "active-with-alias"],
    );
  });

  it("returns no suggestions for low-confidence input", () => {
    expect(suggestCommands("zz", ["active-basic", "alias-basic"])).toEqual([]);
  });
});
