import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const serverPath = vscode.Uri.joinPath(
    context.extensionUri,
    'dist',
    'server',
    'index.js'
  ).fsPath;

  // Emitter to tell VS Code to re-query the provider when settings change
  const emitter = new vscode.EventEmitter<void>();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('slackMcp')) emitter.fire();
    })
  );

  const disposable = vscode.lm.registerMcpServerDefinitionProvider('slack-mcp-server', {
    onDidChangeMcpServerDefinitions: emitter.event,
    provideMcpServerDefinitions(_token: vscode.CancellationToken) {
      const config = vscode.workspace.getConfiguration('slackMcp');

      // ALWAYS return the server definition — NEVER return [] based on config state.
      // Let the MCP server itself handle missing/invalid config with a clear error message.
      return [
        new vscode.McpStdioServerDefinition(
          'Slack MCP Server',
          process.execPath,
          [serverPath],
          {
            SLACK_MCP_BOT_TOKEN: config.get<string>('botToken') ?? '',
            SLACK_MCP_USER_TOKEN: config.get<string>('userToken') ?? '',
            SLACK_MCP_XOXC_TOKEN: config.get<string>('xoxcToken') ?? '',
            SLACK_MCP_XOXD_TOKEN: config.get<string>('xoxdToken') ?? '',
            SLACK_TEAM_ID: config.get<string>('teamId') ?? '',
            SLACK_CHANNEL_IDS: config.get<string>('channelIds') ?? '',
            SLACK_MCP_DEFAULT_CHANNEL: config.get<string>('defaultChannel') ?? '',
            SLACK_MCP_ENABLED_TOOLS: config.get<string>('enabledTools') ?? '',
            SLACK_MCP_MAX_RESULTS: String(config.get<number>('maxResults') ?? 100),
            SLACK_MCP_TIMEOUT_MS: String(config.get<number>('timeoutMs') ?? 30000),
            SLACK_MCP_CACHE_TTL: config.get<string>('cacheTtl') ?? '24h',
            SLACK_MCP_LOG_LEVEL: config.get<string>('logLevel') ?? 'info',
            SLACK_MCP_PROXY: config.get<string>('proxy') ?? '',
            SLACK_MCP_GOVSLACK: config.get<boolean>('govSlack') ? 'true' : 'false',
            SLACK_MCP_SERVER_CA_INSECURE: config.get<boolean>('serverCaInsecure')
              ? 'true'
              : 'false',
            SLACK_MCP_ADD_MESSAGE_TOOL: config.get<string>('addMessageTool') ?? '',
            SLACK_MCP_REACTION_TOOL: config.get<string>('reactionTool') ?? '',
            SLACK_MCP_CANVAS_TOOL: config.get<string>('canvasTool') ?? '',
            SLACK_MCP_ATTACHMENT_TOOL: config.get<string>('attachmentTool') ?? '',
            SLACK_MCP_MARK_TOOL: config.get<string>('markTool') ?? '',
          },
          '0.1.0'
        ),
      ];
    },
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
