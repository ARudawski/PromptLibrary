# Golden Tests

Golden tests freeze exact response payloads and absence of forbidden keys.

Do not update golden snapshots unless the contract intentionally changed and the report explains the semantic reason.

Planned coverage:

- valid active invocation;
- alias invocation;
- unknown command with non-executing suggestion;
- draft not invokable;
- invalid prompt excluded;
- alias conflict;
- inspection result;
- list result;
- cache/failure behavior in later slices.
