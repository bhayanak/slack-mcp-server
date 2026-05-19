<p align="center">
  <img src="logo.svg" alt="Slack MCP Server" width="50" height="50" />
</p>

<h1 align="center">Slack MCP Server</h1>

<p align="center">
  <strong>A Model Context Protocol server for Slack — enabling AI assistants to interact with your workspace</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/node-%3E%3D20-green.svg" alt="Node.js >= 20" />
  <img src="https://img.shields.io/badge/MCP-compatible-purple.svg" alt="MCP Compatible" />
  <img src="https://img.shields.io/badge/tools-38-orange.svg" alt="38 Tools" />
</p>

---

## Overview

This monorepo provides a production-ready MCP server that enables AI assistants (GitHub Copilot, Claude, Cursor, etc.) to interact with Slack workspaces. It includes:

| Package | Description |
|---------|-------------|
| [`slack-mcp-server`](packages/slack-mcp-server/) | Standalone MCP server (npm, npx, CLI) |
| [`slack-mcp-vscode-extension`](packages/slack-mcp-vscode-extension/) | VS Code extension for automatic tool registration |

## Quick Start

### VS Code Extension (Recommended)

1. Install the extension from VSIX
2. Configure your token in VS Code Settings → Slack MCP Server
3. The server appears automatically in the MCP Servers panel

### npx (Zero Install)

```bash
SLACK_MCP_BOT_TOKEN=xoxb-your-token npx slack-mcp-server
```

### Global Install

```bash
npm install -g slack-mcp-server
SLACK_MCP_BOT_TOKEN=xoxb-your-token slack-mcp-server
```

## Tools (38)

| Category | Tools | Description |
|----------|-------|-------------|
| Messaging | 6 | Send, update, delete, schedule, draft messages; read threads |
| Channels | 7 | List, create, join, leave channels; read history and members |
| Search | 5 | Search messages, files, users, channels, and emoji |
| Users | 2 | List users, get detailed profiles |
| User Groups | 5 | List, create, update groups and manage membership |
| Reactions | 2 | Add and remove emoji reactions |
| Files | 3 | Upload, list, and fetch file attachments |
| Canvases | 3 | Create, update, and read Slack canvases |
| Unreads | 2 | Get unread messages, mark channels as read |
| Saved Items | 3 | List, update, and clear saved items |

## Authentication

At least one token is required:

| Token | Variable | Use Case |
|-------|----------|----------|
| Bot (`xoxb-`) | `SLACK_MCP_BOT_TOKEN` | Standard bot access |
| User (`xoxp-`) | `SLACK_MCP_USER_TOKEN` | Full user access including search |
| Browser (`xoxc-`) | `SLACK_MCP_XOXC_TOKEN` | Stealth mode (pair with `xoxd-`) |
| Cookie (`xoxd-`) | `SLACK_MCP_XOXD_TOKEN` | Browser cookie for stealth mode |

## Configuration

See [`.env.dist`](.env.dist) for all available environment variables.

## Development

```bash
# Install dependencies
pnpm install

# Run CI checks
pnpm run ci

# Build everything
pnpm run build

# Package VS Code extension
pnpm run package
```

## License

MIT
