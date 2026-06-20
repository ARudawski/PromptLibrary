import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROMPT_CACHE_TTL_MILLISECONDS,
  PromptCache,
  resolvePromptCommand,
} from "../../../src/cache/index.js";
import type { LoadedPromptFile, PromptSource } from "../../../src/prompt-source/index.js";
import { FakePromptSource, fakeLoadedPromptFile } from "../../helpers/FakePromptSource.js";

describe("PromptCache", () => {
  it("builds a fresh cache from PromptSource through parser, validation, and index", async () => {
    const promptSource = new FakePromptSource([
      validPromptFile("fake-active", {
        alias: "fake-alias",
        title: "Fake Active",
        body: "Apply the fake active prompt.\n",
      }),
      fakeLoadedPromptFile({
        sourcePath: "fake://invalid.md",
        rawMarkdown: `---
schema_version: "1"
slug: invalid-prompt
title: Invalid Prompt
description: Missing aliases keeps this prompt out.
lifecycle: one_shot
input_mode: attached_input
status: active
---

This invalid prompt must not invoke.
`,
      }),
    ]);
    const cache = new PromptCache({ promptSource, clock: fixedClock(1_000) });

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "fresh",
      loadedAtMilliseconds: 1_000,
      expiresAtMilliseconds: 1_000 + DEFAULT_PROMPT_CACHE_TTL_MILLISECONDS,
    });

    if (result.kind !== "success") {
      throw new Error("Expected cache build to succeed.");
    }

    expect(resolvePromptCommand(result.index, "fake-alias")).toMatchObject({
      kind: "found",
      prompt: {
        metadata: {
          slug: "fake-active",
        },
      },
    });
    expect(resolvePromptCommand(result.index, "invalid-prompt")).toEqual({
      kind: "not_found",
      command: "invalid-prompt",
    });
  });

  it("returns a typed no-cache failure when the source has no prompt files", async () => {
    const cache = new PromptCache({
      promptSource: new FakePromptSource([]),
      clock: fixedClock(2_000),
    });

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "failure",
      error: {
        code: "PROMPT_CACHE_UNAVAILABLE",
        reason: "no_cache",
        message: "Prompt cache could not be built and no usable cache exists.",
      },
    });
    expect(cache.status()).toEqual({
      kind: "empty",
    });
  });

  it("returns a typed no-cache failure when no prompt files parse and validate", async () => {
    const cache = new PromptCache({
      promptSource: new FakePromptSource([
        fakeLoadedPromptFile({
          sourcePath: "fake://unparsable.md",
          rawMarkdown: "This file has no frontmatter.",
        }),
        fakeLoadedPromptFile({
          sourcePath: "fake://invalid.md",
          rawMarkdown: `---
schema_version: "1"
slug: invalid-prompt
title: Invalid Prompt
description: Missing aliases keeps this prompt out.
lifecycle: one_shot
input_mode: attached_input
status: active
---

This invalid prompt must not invoke.
`,
        }),
      ]),
      clock: fixedClock(2_000),
    });

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "failure",
      error: {
        code: "PROMPT_CACHE_UNAVAILABLE",
        reason: "no_cache",
        message: "Prompt cache could not be built and no usable cache exists.",
      },
    });
    expect(cache.status()).toEqual({
      kind: "empty",
    });
  });

  it("returns a typed no-cache failure when no active commands can be indexed", async () => {
    const cache = new PromptCache({
      promptSource: new FakePromptSource([
        validPromptFile("draft-only", {
          status: "draft",
          body: "Draft body.\n",
        }),
      ]),
      clock: fixedClock(2_000),
    });

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "failure",
      error: {
        code: "PROMPT_CACHE_UNAVAILABLE",
        reason: "no_cache",
        message: "Prompt cache could not be built and no usable cache exists.",
      },
    });
    expect(cache.status()).toEqual({
      kind: "empty",
    });
  });

  it("serves a fresh cache without reloading the source", async () => {
    const clock = mutableClock(1_000);
    const promptSource = new CountingPromptSource([
      [validPromptFile("first-prompt", { body: "First body.\n" })],
      [validPromptFile("second-prompt", { body: "Second body.\n" })],
    ]);
    const cache = new PromptCache({ promptSource, clock });

    const firstResult = await cache.getIndex();
    clock.setNow(1_000 + DEFAULT_PROMPT_CACHE_TTL_MILLISECONDS - 1);
    const secondResult = await cache.getIndex();

    expect(firstResult.kind).toBe("success");
    expect(secondResult.kind).toBe("success");
    expect(promptSource.loadCount).toBe(1);

    if (secondResult.kind !== "success") {
      throw new Error("Expected fresh cache hit.");
    }

    expect(resolvePromptCommand(secondResult.index, "first-prompt")).toMatchObject({
      kind: "found",
    });
    expect(resolvePromptCommand(secondResult.index, "second-prompt")).toEqual({
      kind: "not_found",
      command: "second-prompt",
    });
  });

  it("detects stale cache state and rebuilds on the next access", async () => {
    const clock = mutableClock(1_000);
    const promptSource = new CountingPromptSource([
      [validPromptFile("first-prompt", { body: "First body.\n" })],
      [validPromptFile("second-prompt", { body: "Second body.\n" })],
    ]);
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 50 });

    await cache.getIndex();
    clock.setNow(1_049);

    expect(cache.status()).toMatchObject({
      kind: "ready",
      freshness: "fresh",
    });

    clock.setNow(1_050);

    expect(cache.status()).toMatchObject({
      kind: "ready",
      freshness: "stale",
    });

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "fresh",
      loadedAtMilliseconds: 1_050,
      expiresAtMilliseconds: 1_100,
    });
    expect(promptSource.loadCount).toBe(2);

    if (result.kind !== "success") {
      throw new Error("Expected stale cache rebuild to succeed.");
    }

    expect(resolvePromptCommand(result.index, "first-prompt")).toEqual({
      kind: "not_found",
      command: "first-prompt",
    });
    expect(resolvePromptCommand(result.index, "second-prompt")).toMatchObject({
      kind: "found",
    });
  });

  it("stamps the TTL after async source loading and cache build work finishes", async () => {
    const clock = mutableClock(1_000);
    const promptSource: PromptSource = {
      async loadAllPrompts() {
        clock.setNow(1_075);

        return [validPromptFile("delayed-prompt", { body: "Delayed body.\n" })];
      },
    };
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 50 });

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "fresh",
      loadedAtMilliseconds: 1_075,
      expiresAtMilliseconds: 1_125,
    });
    expect(cache.status()).toMatchObject({
      kind: "ready",
      freshness: "fresh",
      loadedAtMilliseconds: 1_075,
      expiresAtMilliseconds: 1_125,
    });
  });

  it("returns a typed no-cache failure when the initial source load fails", async () => {
    const sourceError = new Error("source unavailable");
    const promptSource: PromptSource = {
      async loadAllPrompts() {
        throw sourceError;
      },
    };
    const cache = new PromptCache({ promptSource, clock: fixedClock(2_000) });

    const result = await cache.getIndex();

    expect(result).toEqual({
      kind: "failure",
      error: {
        code: "PROMPT_CACHE_UNAVAILABLE",
        reason: "no_cache",
        message: "Prompt cache could not be built and no usable cache exists.",
        cause: sourceError,
      },
    });
    expect(cache.status()).toEqual({
      kind: "empty",
    });
  });

  it("serves stale last-known-good cache when stale refresh source load fails", async () => {
    const clock = mutableClock(1_000);
    const sourceError = new Error("refresh failed");
    const promptSource = new CountingPromptSource(
      [[validPromptFile("first-prompt", { body: "First body.\n" })]],
      sourceError,
    );
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 10 });

    await cache.getIndex();
    clock.setNow(1_010);

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "stale",
      loadedAtMilliseconds: 1_000,
      expiresAtMilliseconds: 1_010,
    });
    expect(cache.status()).toMatchObject({
      kind: "ready",
      freshness: "stale",
    });

    if (result.kind !== "success") {
      throw new Error("Expected stale last-known-good cache to be served.");
    }

    expect(resolvePromptCommand(result.index, "first-prompt")).toMatchObject({
      kind: "found",
    });
    expect(resolvePromptCommand(result.index, "second-prompt")).toEqual({
      kind: "not_found",
      command: "second-prompt",
    });
  });

  it("preserves stale last-known-good cache when refresh has no usable prompts", async () => {
    const clock = mutableClock(1_000);
    const promptSource = new CountingPromptSource([
      [validPromptFile("first-prompt", { body: "First body.\n" })],
      [],
    ]);
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 10 });

    await cache.getIndex();
    clock.setNow(1_010);

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "stale",
      loadedAtMilliseconds: 1_000,
      expiresAtMilliseconds: 1_010,
    });
    expect(promptSource.loadCount).toBe(2);

    if (result.kind !== "success") {
      throw new Error("Expected stale last-known-good cache to be served.");
    }

    expect(resolvePromptCommand(result.index, "first-prompt")).toMatchObject({
      kind: "found",
    });
  });

  it("accepts a partial valid refresh when unrelated prompt files are invalid", async () => {
    const clock = mutableClock(1_000);
    const promptSource = new CountingPromptSource([
      [validPromptFile("first-prompt", { body: "First body.\n" })],
      [
        validPromptFile("second-prompt", { body: "Second body.\n" }),
        fakeLoadedPromptFile({
          sourcePath: "fake://invalid.md",
          rawMarkdown: "This file has no frontmatter.",
        }),
      ],
    ]);
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 10 });

    await cache.getIndex();
    clock.setNow(1_010);

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "fresh",
      loadedAtMilliseconds: 1_010,
      expiresAtMilliseconds: 1_020,
    });
    expect(promptSource.loadCount).toBe(2);

    if (result.kind !== "success") {
      throw new Error("Expected partial valid refresh to be accepted.");
    }

    expect(resolvePromptCommand(result.index, "first-prompt")).toEqual({
      kind: "not_found",
      command: "first-prompt",
    });
    expect(resolvePromptCommand(result.index, "second-prompt")).toMatchObject({
      kind: "found",
    });
    expect(resolvePromptCommand(result.index, "invalid")).toEqual({
      kind: "not_found",
      command: "invalid",
    });
  });

  it("preserves stale last-known-good cache when refresh has no active commands", async () => {
    const clock = mutableClock(1_000);
    const promptSource = new CountingPromptSource([
      [validPromptFile("first-prompt", { body: "First body.\n" })],
      [
        validPromptFile("draft-only", {
          status: "draft",
          body: "Draft body.\n",
        }),
        fakeLoadedPromptFile({
          sourcePath: "fake://invalid.md",
          rawMarkdown: "This file has no frontmatter.",
        }),
      ],
    ]);
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 10 });

    await cache.getIndex();
    clock.setNow(1_010);

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "stale",
      loadedAtMilliseconds: 1_000,
      expiresAtMilliseconds: 1_010,
    });
    expect(promptSource.loadCount).toBe(2);

    if (result.kind !== "success") {
      throw new Error("Expected stale last-known-good cache to be served.");
    }

    expect(resolvePromptCommand(result.index, "first-prompt")).toMatchObject({
      kind: "found",
    });
    expect(resolvePromptCommand(result.index, "draft-only")).toEqual({
      kind: "not_found",
      command: "draft-only",
    });
  });

  it("preserves stale last-known-good cache when refresh has unsafe collection conflicts", async () => {
    const clock = mutableClock(1_000);
    const promptSource = new CountingPromptSource([
      [validPromptFile("first-prompt", { body: "First body.\n" })],
      [
        validPromptFile("conflict-a", {
          alias: "shared-alias",
          body: "Conflict A body.\n",
        }),
        validPromptFile("conflict-b", {
          alias: "shared-alias",
          body: "Conflict B body.\n",
        }),
        validPromptFile("safe-prompt", {
          body: "Safe body.\n",
        }),
      ],
    ]);
    const cache = new PromptCache({ promptSource, clock, ttlMilliseconds: 10 });

    await cache.getIndex();
    clock.setNow(1_010);

    const result = await cache.getIndex();

    expect(result).toMatchObject({
      kind: "success",
      status: "stale",
      loadedAtMilliseconds: 1_000,
      expiresAtMilliseconds: 1_010,
    });
    expect(promptSource.loadCount).toBe(2);

    if (result.kind !== "success") {
      throw new Error("Expected stale last-known-good cache to be served.");
    }

    expect(resolvePromptCommand(result.index, "first-prompt")).toMatchObject({
      kind: "found",
    });
    expect(resolvePromptCommand(result.index, "safe-prompt")).toEqual({
      kind: "not_found",
      command: "safe-prompt",
    });
    expect(resolvePromptCommand(result.index, "shared-alias")).toEqual({
      kind: "not_found",
      command: "shared-alias",
    });
  });
});

interface ValidPromptFileOptions {
  readonly alias?: string;
  readonly title?: string;
  readonly body: string;
  readonly status?: "active" | "draft";
}

function validPromptFile(slug: string, options: ValidPromptFileOptions): LoadedPromptFile {
  const aliases =
    options.alias === undefined ? "aliases: []\n" : `aliases:\n  - ${options.alias}\n`;

  return fakeLoadedPromptFile({
    sourcePath: `fake://${slug}.md`,
    rawMarkdown: `---
schema_version: "1"
slug: ${slug}
title: ${options.title ?? slug}
description: Test prompt ${slug}.
${aliases}lifecycle: one_shot
input_mode: attached_input
status: ${options.status ?? "active"}
---

${options.body}`,
  });
}

interface MutableClock {
  (): number;
  setNow(value: number): void;
}

function fixedClock(now: number): () => number {
  return () => now;
}

function mutableClock(initialNow: number): MutableClock {
  let currentNow = initialNow;
  const clock = (): number => currentNow;
  clock.setNow = (value: number): void => {
    currentNow = value;
  };

  return clock;
}

class CountingPromptSource implements PromptSource {
  readonly #promptFileResponses: readonly (readonly LoadedPromptFile[])[];
  readonly #failureAfterResponses: Error | undefined;
  #loadCount = 0;

  public constructor(
    promptFileResponses: readonly (readonly LoadedPromptFile[])[],
    failureAfterResponses?: Error,
  ) {
    this.#promptFileResponses = promptFileResponses;
    this.#failureAfterResponses = failureAfterResponses;
  }

  public get loadCount(): number {
    return this.#loadCount;
  }

  public async loadAllPrompts(): Promise<readonly LoadedPromptFile[]> {
    const response = this.#promptFileResponses[this.#loadCount];
    this.#loadCount += 1;

    if (response !== undefined) {
      return response;
    }

    if (this.#failureAfterResponses !== undefined) {
      throw this.#failureAfterResponses;
    }

    return this.#promptFileResponses.at(-1) ?? [];
  }
}
