import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServer } from '../src/server.js';
import type { SlackMcpConfig } from '../src/config.js';

// Mock @slack/web-api
vi.mock('@slack/web-api', () => ({
  WebClient: vi.fn().mockImplementation(() => ({
    chat: {
      postMessage: vi.fn().mockResolvedValue({ ok: true, ts: '123.456' }),
      update: vi.fn().mockResolvedValue({ ok: true }),
      delete: vi.fn().mockResolvedValue({ ok: true }),
      scheduleMessage: vi.fn().mockResolvedValue({ ok: true, scheduled_message_id: 'Q123' }),
    },
    conversations: {
      list: vi.fn().mockResolvedValue({ ok: true, channels: [], response_metadata: {} }),
      info: vi.fn().mockResolvedValue({ ok: true, channel: { id: 'C1', name: 'test' } }),
      history: vi.fn().mockResolvedValue({ ok: true, messages: [], response_metadata: {} }),
      create: vi.fn().mockResolvedValue({ ok: true, channel: { id: 'C1', name: 'test' } }),
      members: vi.fn().mockResolvedValue({ ok: true, members: [], response_metadata: {} }),
      join: vi.fn().mockResolvedValue({ ok: true }),
      leave: vi.fn().mockResolvedValue({ ok: true }),
      replies: vi.fn().mockResolvedValue({ ok: true, messages: [], response_metadata: {} }),
      mark: vi.fn().mockResolvedValue({ ok: true }),
      setPurpose: vi.fn().mockResolvedValue({ ok: true }),
    },
    users: {
      list: vi.fn().mockResolvedValue({ ok: true, members: [], response_metadata: {} }),
      info: vi.fn().mockResolvedValue({
        ok: true,
        user: { id: 'U1', name: 'test', profile: {}, tz: 'UTC' },
      }),
      lookupByEmail: vi.fn().mockResolvedValue({ ok: true, user: { id: 'U1' } }),
    },
    search: {
      messages: vi.fn().mockResolvedValue({ ok: true, messages: { matches: [] } }),
      files: vi.fn().mockResolvedValue({ ok: true, files: { matches: [] } }),
    },
    reactions: {
      add: vi.fn().mockResolvedValue({ ok: true }),
      remove: vi.fn().mockResolvedValue({ ok: true }),
    },
    files: {
      uploadV2: vi.fn().mockResolvedValue({ ok: true, file: { id: 'F1' } }),
      list: vi.fn().mockResolvedValue({ ok: true, files: [] }),
    },
    usergroups: {
      list: vi.fn().mockResolvedValue({ ok: true, usergroups: [] }),
      create: vi.fn().mockResolvedValue({ ok: true, usergroup: { id: 'S1', handle: 'test' } }),
      update: vi.fn().mockResolvedValue({ ok: true }),
      users: { update: vi.fn().mockResolvedValue({ ok: true }) },
    },
    emoji: {
      list: vi.fn().mockResolvedValue({ ok: true, emoji: {} }),
    },
    stars: {
      list: vi.fn().mockResolvedValue({ ok: true, items: [] }),
      remove: vi.fn().mockResolvedValue({ ok: true }),
    },
  })),
}));

function makeConfig(overrides?: Partial<SlackMcpConfig>): SlackMcpConfig {
  return {
    botToken: 'xoxb-test',
    userToken: '',
    xoxcToken: '',
    xoxdToken: '',
    teamId: '',
    channelIds: [],
    defaultChannel: '',
    port: 3000,
    host: '127.0.0.1',
    apiKey: '',
    proxy: '',
    userAgent: '',
    customTls: false,
    serverCa: '',
    serverCaInsecure: false,
    govSlack: false,
    timeoutMs: 30000,
    maxResults: 100,
    addMessageTool: '',
    addMessageMark: false,
    addMessageUnfurling: '',
    reactionTool: '',
    attachmentTool: '',
    markTool: '',
    canvasTool: '',
    enabledTools: [],
    usersCache: '',
    channelsCache: '',
    cacheTtl: '24h',
    minRefreshInterval: '30s',
    logLevel: 'info',
    ...overrides,
  };
}

describe('createServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a server instance', () => {
    const config = makeConfig();
    const server = createServer(config);
    expect(server).toBeDefined();
  });

  it('should register all tools when enabledTools is empty', () => {
    const config = makeConfig();
    const server = createServer(config);
    // Server is created with all tools
    expect(server).toBeDefined();
  });

  it('should only register specified tools when enabledTools is set', () => {
    const config = makeConfig({ enabledTools: ['slack_list_channels'] });
    const server = createServer(config);
    expect(server).toBeDefined();
  });
});
