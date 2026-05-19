# Slack MCP Server

Standalone MCP server for Slack. Publishable to npm as a global CLI tool.

## Installation

```bash
npm install -g @fazorboy/slack-mcp-server
```

## Usage

```bash
# With environment variable
SLACK_MCP_BOT_TOKEN=xoxb-your-token slack-mcp-server

# Or via npx
SLACK_MCP_BOT_TOKEN=xoxb-your-token npx slack-mcp-server
```

## Client Configurations

### VS Code (`mcp.json`)

```json
{
  "servers": {
    "slack": {
      "command": "npx",
      "args": ["slack-mcp-server"],
      "env": {
        "SLACK_MCP_BOT_TOKEN": "xoxb-your-token"
      }
    }
  }
}
```

### Claude Desktop

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["slack-mcp-server"],
      "env": {
        "SLACK_MCP_BOT_TOKEN": "xoxb-your-token"
      }
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["slack-mcp-server"],
      "env": {
        "SLACK_MCP_BOT_TOKEN": "xoxb-your-token"
      }
    }
  }
}
```

## Tools Reference

### Messaging

| Tool | Description |
|------|-------------|
| `slack_send_message` | Send a message to a channel or DM |
| `slack_update_message` | Update an existing message |
| `slack_delete_message` | Delete a message |
| `slack_schedule_message` | Schedule a message for future delivery |
| `slack_draft_message` | Draft a message for review |
| `slack_get_thread` | Get messages from a thread |

### Channels

| Tool | Description |
|------|-------------|
| `slack_list_channels` | List workspace channels |
| `slack_get_channel_info` | Get channel details |
| `slack_get_channel_history` | Read channel message history |
| `slack_create_channel` | Create a new channel |
| `slack_get_channel_members` | List channel members |
| `slack_join_channel` | Join a channel |
| `slack_leave_channel` | Leave a channel |

### Search

| Tool | Description |
|------|-------------|
| `slack_search_messages` | Search messages (requires user/browser token) |
| `slack_search_files` | Search files |
| `slack_search_users` | Search users by name or email |
| `slack_search_channels` | Search channels |
| `slack_search_emoji` | Search custom emoji |

### Users

| Tool | Description |
|------|-------------|
| `slack_list_users` | List workspace users |
| `slack_get_user_profile` | Get user profile details |

### User Groups

| Tool | Description |
|------|-------------|
| `slack_list_usergroups` | List user groups |
| `slack_create_usergroup` | Create a user group |
| `slack_update_usergroup` | Update a user group |
| `slack_update_usergroup_members` | Update group membership |
| `slack_my_usergroups` | List/join/leave user groups |

### Reactions

| Tool | Description |
|------|-------------|
| `slack_add_reaction` | Add an emoji reaction |
| `slack_remove_reaction` | Remove an emoji reaction |

### Files

| Tool | Description |
|------|-------------|
| `slack_upload_file` | Upload a file |
| `slack_list_files` | List files |
| `slack_get_attachment` | Download an attachment |

### Canvases

| Tool | Description |
|------|-------------|
| `slack_create_canvas` | Create a canvas |
| `slack_update_canvas` | Update a canvas |
| `slack_read_canvas` | Read canvas content |

### Unreads

| Tool | Description |
|------|-------------|
| `slack_get_unreads` | Get unread messages |
| `slack_mark_read` | Mark channel as read |

### Saved Items

| Tool | Description |
|------|-------------|
| `slack_list_saved` | List saved items |
| `slack_update_saved` | Update a saved item |
| `slack_clear_completed_saved` | Clear completed saved items |

## Environment Variables

See the root [`.env.dist`](../../.env.dist) for full documentation.

## License

MIT
