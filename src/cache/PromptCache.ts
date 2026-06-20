import type { PromptDefinition } from "../domain/index.js";
import { parsePromptMarkdown } from "../prompt-parser/index.js";
import type { PromptSource } from "../prompt-source/index.js";
import { validatePromptDefinition } from "../validation/index.js";
import { buildPromptIndex, type PromptIndex } from "./PromptIndex.js";

export const DEFAULT_PROMPT_CACHE_TTL_MILLISECONDS = 5 * 60 * 1_000;

export type PromptCacheClock = () => number;

export interface PromptCacheOptions {
  readonly promptSource: PromptSource;
  readonly ttlMilliseconds?: number;
  readonly clock?: PromptCacheClock;
}

export type PromptCacheFreshness = "fresh" | "stale";

export type PromptCacheStatus =
  | {
      readonly kind: "empty";
    }
  | {
      readonly kind: "ready";
      readonly freshness: PromptCacheFreshness;
      readonly loadedAtMilliseconds: number;
      readonly expiresAtMilliseconds: number;
    };

export type PromptCacheFailureReason = "no_cache";

export interface PromptCacheError {
  readonly code: "PROMPT_CACHE_UNAVAILABLE";
  readonly reason: PromptCacheFailureReason;
  readonly message: string;
  readonly cause?: unknown;
}

export type PromptCacheGetIndexResult =
  | {
      readonly kind: "success";
      readonly status: PromptCacheFreshness;
      readonly index: PromptIndex;
      readonly loadedAtMilliseconds: number;
      readonly expiresAtMilliseconds: number;
    }
  | {
      readonly kind: "failure";
      readonly error: PromptCacheError;
    };

interface CachedPromptIndex {
  readonly index: PromptIndex;
  readonly loadedAtMilliseconds: number;
  readonly expiresAtMilliseconds: number;
}

export class PromptCache {
  readonly #promptSource: PromptSource;
  readonly #ttlMilliseconds: number;
  readonly #clock: PromptCacheClock;
  #cachedIndex?: CachedPromptIndex;

  public constructor(options: PromptCacheOptions) {
    this.#promptSource = options.promptSource;
    this.#ttlMilliseconds = options.ttlMilliseconds ?? DEFAULT_PROMPT_CACHE_TTL_MILLISECONDS;
    this.#clock = options.clock ?? Date.now;

    if (!Number.isFinite(this.#ttlMilliseconds) || this.#ttlMilliseconds <= 0) {
      throw new TypeError("PromptCache ttlMilliseconds must be greater than zero.");
    }
  }

  public status(): PromptCacheStatus {
    const cachedIndex = this.#cachedIndex;

    if (cachedIndex === undefined) {
      return {
        kind: "empty",
      };
    }

    return {
      kind: "ready",
      freshness: this.#isFresh(cachedIndex) ? "fresh" : "stale",
      loadedAtMilliseconds: cachedIndex.loadedAtMilliseconds,
      expiresAtMilliseconds: cachedIndex.expiresAtMilliseconds,
    };
  }

  public async getIndex(): Promise<PromptCacheGetIndexResult> {
    const cachedIndex = this.#cachedIndex;

    if (cachedIndex !== undefined && this.#isFresh(cachedIndex)) {
      return promptCacheSuccess(cachedIndex, "fresh");
    }

    if (cachedIndex !== undefined) {
      try {
        const refreshedIndex = await this.#buildCachedIndex();

        if (refreshedIndex.index.issues.length > 0) {
          throw new Error("Prompt cache refresh produced unsafe prompt collection issues.");
        }

        this.#cachedIndex = refreshedIndex;

        return promptCacheSuccess(refreshedIndex, "fresh");
      } catch {
        return promptCacheSuccess(cachedIndex, "stale");
      }
    }

    try {
      const refreshedIndex = await this.#buildCachedIndex();
      this.#cachedIndex = refreshedIndex;

      return promptCacheSuccess(refreshedIndex, "fresh");
    } catch (cause: unknown) {
      return {
        kind: "failure",
        error: {
          code: "PROMPT_CACHE_UNAVAILABLE",
          reason: "no_cache",
          message: "Prompt cache could not be built and no usable cache exists.",
          cause,
        },
      };
    }
  }

  async #buildCachedIndex(): Promise<CachedPromptIndex> {
    const loadedPromptFiles = await this.#promptSource.loadAllPrompts();
    const prompts: PromptDefinition[] = [];

    for (const loadedPromptFile of loadedPromptFiles) {
      const parseResult = parsePromptMarkdown(loadedPromptFile.rawMarkdown);

      if (parseResult.kind !== "success") {
        continue;
      }

      const validationResult = validatePromptDefinition(parseResult.prompt);

      if (validationResult.kind !== "success") {
        continue;
      }

      prompts.push(validationResult.prompt);
    }

    if (prompts.length === 0) {
      throw new Error("Prompt cache build produced no usable prompts.");
    }

    const loadedAtMilliseconds = this.#clock();
    const index = buildPromptIndex(prompts);

    if (index.activeCommands.length === 0) {
      throw new Error("Prompt cache build produced no active commands.");
    }

    return {
      index,
      loadedAtMilliseconds,
      expiresAtMilliseconds: loadedAtMilliseconds + this.#ttlMilliseconds,
    };
  }

  #isFresh(cachedIndex: CachedPromptIndex): boolean {
    return this.#clock() < cachedIndex.expiresAtMilliseconds;
  }
}

function promptCacheSuccess(
  cachedIndex: CachedPromptIndex,
  status: PromptCacheFreshness,
): PromptCacheGetIndexResult {
  return {
    kind: "success",
    status,
    index: cachedIndex.index,
    loadedAtMilliseconds: cachedIndex.loadedAtMilliseconds,
    expiresAtMilliseconds: cachedIndex.expiresAtMilliseconds,
  };
}
