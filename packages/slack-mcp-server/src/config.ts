export interface SlackMcpConfig {
  botToken: string;
  userToken: string;
  xoxcToken: string;
  xoxdToken: string;
  teamId: string;
  channelIds: string[];
  defaultChannel: string;
  port: number;
  host: string;
  apiKey: string;
  proxy: string;
  userAgent: string;
  customTls: boolean;
  serverCa: string;
  serverCaInsecure: boolean;
  govSlack: boolean;
  timeoutMs: number;
  maxResults: number;
  addMessageTool: string;
  addMessageMark: boolean;
  addMessageUnfurling: string;
  reactionTool: string;
  attachmentTool: string;
  markTool: string;
  canvasTool: string;
  enabledTools: string[];
  usersCache: string;
  channelsCache: string;
  cacheTtl: string;
  minRefreshInterval: string;
  logLevel: string;
}

export function loadConfig(): SlackMcpConfig {
  const env = process.env;

  const botToken = env.SLACK_MCP_BOT_TOKEN ?? '';
  const userToken = env.SLACK_MCP_USER_TOKEN ?? '';
  const xoxcToken = env.SLACK_MCP_XOXC_TOKEN ?? '';
  const xoxdToken = env.SLACK_MCP_XOXD_TOKEN ?? '';

  if (!botToken && !userToken && !xoxcToken) {
    console.error(
      'Error: At least one Slack token is required (SLACK_MCP_BOT_TOKEN, SLACK_MCP_USER_TOKEN, or SLACK_MCP_XOXC_TOKEN)'
    );
    process.exit(1);
  }

  const channelIdsRaw = env.SLACK_CHANNEL_IDS ?? '';
  const enabledToolsRaw = env.SLACK_MCP_ENABLED_TOOLS ?? '';

  return {
    botToken,
    userToken,
    xoxcToken,
    xoxdToken,
    teamId: env.SLACK_TEAM_ID ?? '',
    channelIds: channelIdsRaw ? channelIdsRaw.split(',').map((s) => s.trim()) : [],
    defaultChannel: env.SLACK_MCP_DEFAULT_CHANNEL ?? '',
    port: parseInt(env.SLACK_MCP_PORT ?? '3000', 10),
    host: env.SLACK_MCP_HOST ?? '127.0.0.1',
    apiKey: env.SLACK_MCP_API_KEY ?? '',
    proxy: env.SLACK_MCP_PROXY ?? '',
    userAgent: env.SLACK_MCP_USER_AGENT ?? '',
    customTls: env.SLACK_MCP_CUSTOM_TLS === 'true',
    serverCa: env.SLACK_MCP_SERVER_CA ?? '',
    serverCaInsecure: env.SLACK_MCP_SERVER_CA_INSECURE === 'true',
    govSlack: env.SLACK_MCP_GOVSLACK === 'true',
    timeoutMs: parseInt(env.SLACK_MCP_TIMEOUT_MS ?? '30000', 10),
    maxResults: parseInt(env.SLACK_MCP_MAX_RESULTS ?? '100', 10),
    addMessageTool: env.SLACK_MCP_ADD_MESSAGE_TOOL ?? '',
    addMessageMark: env.SLACK_MCP_ADD_MESSAGE_MARK === 'true',
    addMessageUnfurling: env.SLACK_MCP_ADD_MESSAGE_UNFURLING ?? '',
    reactionTool: env.SLACK_MCP_REACTION_TOOL ?? '',
    attachmentTool: env.SLACK_MCP_ATTACHMENT_TOOL ?? '',
    markTool: env.SLACK_MCP_MARK_TOOL ?? '',
    canvasTool: env.SLACK_MCP_CANVAS_TOOL ?? '',
    enabledTools: enabledToolsRaw ? enabledToolsRaw.split(',').map((s) => s.trim()) : [],
    usersCache: env.SLACK_MCP_USERS_CACHE ?? '',
    channelsCache: env.SLACK_MCP_CHANNELS_CACHE ?? '',
    cacheTtl: env.SLACK_MCP_CACHE_TTL ?? '24h',
    minRefreshInterval: env.SLACK_MCP_MIN_REFRESH_INTERVAL ?? '30s',
    logLevel: env.SLACK_MCP_LOG_LEVEL ?? 'info',
  };
}
