# Slack MCP Server — VS Code Extension

VS Code extension that automatically registers the Slack MCP server, making all Slack tools available to AI assistants like GitHub Copilot.

## Features

- **Auto-registration**: Server appears in the MCP Servers panel as soon as the extension is installed
- **VS Code Settings**: All configuration via VS Code Settings UI (no manual JSON editing)
- **Live Reload**: Settings changes are picked up immediately without restart

## Installation

Install from the VSIX file:

```bash
code --install-extension slack-mcp-0.1.0.vsix
```

## Configuration

Open **Settings** → search for **"Slack MCP"**:

| Setting | Description |
|---------|-------------|
| `slackMcp.botToken` | Bot User OAuth Token (xoxb-...) |
| `slackMcp.userToken` | User OAuth Token (xoxp-...) |
| `slackMcp.xoxcToken` | Browser session token (xoxc-...) |
| `slackMcp.xoxdToken` | Browser cookie d (xoxd-...) |
| `slackMcp.teamId` | Workspace/Team ID |
| `slackMcp.channelIds` | Predefined channel IDs |
| `slackMcp.defaultChannel` | Default channel for messaging |
| `slackMcp.enabledTools` | Comma-separated tool allow-list |
| `slackMcp.maxResults` | Max results per query |
| `slackMcp.timeoutMs` | Request timeout (ms) |
| `slackMcp.cacheTtl` | Cache TTL |
| `slackMcp.logLevel` | Log level |
| `slackMcp.proxy` | Proxy URL |
| `slackMcp.govSlack` | Use slack-gov.com endpoints |
| `slackMcp.serverCaInsecure` | Trust insecure TLS |
| `slackMcp.addMessageTool` | Enable messaging |
| `slackMcp.reactionTool` | Enable reactions |
| `slackMcp.canvasTool` | Enable canvas writes |
| `slackMcp.attachmentTool` | Enable attachment reads |
| `slackMcp.markTool` | Enable mark-as-read |

## Example Prompts

After configuring a token:

- "List all channels in my Slack workspace"
- "Search for messages about the deployment issue"
- "Send a message to #general saying 'Hello from AI!'"
- "Who are the members of the #engineering channel?"
- "What are my unread messages?"

## Troubleshooting

### Server not appearing in MCP panel
1. Ensure VS Code >= 1.99.0
2. Check that the extension is enabled
3. Open the Output panel → "Slack MCP Server" for errors

### Authentication errors
1. Verify your token in Settings
2. Ensure the token has required OAuth scopes
3. Check if the token has expired

## License

MIT
