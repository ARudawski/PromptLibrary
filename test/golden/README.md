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

Planned later coverage:

- valid active invocation;
- alias invocation;
- unknown command with non-executing suggestion;
- draft not invokable;
- invalid prompt excluded;
- alias conflict;
- inspection result;
- list result;
