# Tests

The repository will eventually use three deterministic test categories:

```text
test/unit
test/contract
test/golden
```

Core tests must not hit GitHub, ChatGPT, a tunnel, or a hosted MCP endpoint.

Slice 0 is manually validated through `docs/slice-0-proof.md`; real automated core tests start with Slice 1.
