# MCP Ops Notes

Current
- `.kiro/settings/mcp.json` defines `ai-browser-mcp` via `uvx ai-browser-mcp` (autoApprove for newContext/goto/screenshot).
- Ensure `uv` installed (macOS: `brew install uv`).

Desired
- Add `kiro-mcp` once command/binary is available.

Example config snippet
```json
{
  "mcpServers": {
    "kiro-mcp": {
      "command": "kiro-mcp",
      "args": ["--port", "3333"],
      "disabled": false
    }
  }
}
```

## Operational Notes
- Approval policy: restrict destructive ops; log to `/logs/mcp/*.json` (future)
- Monitor MCP server health and restart automatically if needed
- Rate limiting: 100 requests/minute per server to prevent abuse
- Security: All MCP communications over secure channels only

## Troubleshooting
- **Server won't start**: Check `uv` installation, verify port availability
- **Connection timeouts**: Increase timeout values in config, check network
- **Permission errors**: Verify autoApprove settings, check file permissions
- **High memory usage**: Monitor server processes, implement cleanup routines

## Future Enhancements
- Add `kiro-mcp` server for enhanced Kiro integration
- Implement request/response logging for debugging
- Add health check endpoints for monitoring
- Create MCP server dashboard for operational visibility

---

**Related Specs:** [Integration Plan](integration-plan.md) • [Titan Contracts](titan-contracts.md) • [Risk Log](risk-log.md)

**What to Test on Video:**
- Show MCP server status and connectivity
- Demonstrate browser automation capabilities (if applicable)
- Highlight security and approval mechanisms
- Show operational monitoring (if available)

---

*Last updated: September 14, 2024 by Kiro*

