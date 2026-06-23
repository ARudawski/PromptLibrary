# Golden Tests

Golden tests freeze exact response payloads and absence of forbidden keys.

Do not update golden snapshots unless the contract intentionally changed and the report explains the semantic reason.

Current coverage:

- source/cache behavior in `source-cache-behavior.test.ts` and `source-cache-behavior.golden.json`;
- fresh cache;
- stale refresh success;
- failed refresh preserving last-known-good;
- partial valid cache;
- cold cache failure;
- invalid/conflicting prompt exclusion;
- invocation payload hygiene for cache-derived indexes.
- read-only API tool payloads in `read-only-api-tools.test.ts` and `read-only-api-tools.golden.json`;
- raw tool result top-level key guarding before golden projection;
- invoke active success plus unknown, draft/not-invokable, and ambiguous failures;
- inspect active success plus unknown, draft/not-invokable, and ambiguous failures;
- list active success and invalid-index failure;
- draft exclusion and prompt-body exclusion from list output.
- real MVP prompt payloads in the M4 prompt-specific goldens;
- coherent local MVP catalog coverage in `m4-local-mvp.test.ts` and
  `m4-local-mvp.golden.json`, including all three active prompts, aliases,
  list behavior, and prompt body hashes.
