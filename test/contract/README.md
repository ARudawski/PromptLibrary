# Contract Tests

Contract tests start when MCP-facing tool shapes exist.

They should verify:

- tool input schemas;
- tool output schemas;
- `structuredContent` result shape;
- compact `content` receipts;
- no prompt body hidden only in `_meta`;
- no forbidden metadata in normal invocation payload.
