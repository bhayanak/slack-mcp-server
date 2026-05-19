import { describe, it, expect, vi } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('should load config from environment variables', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SLACK_MCP_BOT_TOKEN: 'xoxb-test-token',
      SLACK_MCP_USER_TOKEN: '',
      SLACK_MCP_XOXC_TOKEN: '',
      SLACK_MCP_XOXD_TOKEN: '',
      SLACK_TEAM_ID: 'T12345',
      SLACK_CHANNEL_IDS: 'C1,C2,C3',
      SLACK_MCP_DEFAULT_CHANNEL: 'general',
      SLACK_MCP_PORT: '4000',
      SLACK_MCP_HOST: '0.0.0.0',
      SLACK_MCP_TIMEOUT_MS: '60000',
      SLACK_MCP_MAX_RESULTS: '50',
      SLACK_MCP_ENABLED_TOOLS: 'slack_send_message,slack_list_channels',
      SLACK_MCP_CACHE_TTL: '12h',
      SLACK_MCP_LOG_LEVEL: 'debug',
    };

    const config = loadConfig();

    expect(config.botToken).toBe('xoxb-test-token');
    expect(config.teamId).toBe('T12345');
    expect(config.channelIds).toEqual(['C1', 'C2', 'C3']);
    expect(config.defaultChannel).toBe('general');
    expect(config.port).toBe(4000);
    expect(config.host).toBe('0.0.0.0');
    expect(config.timeoutMs).toBe(60000);
    expect(config.maxResults).toBe(50);
    expect(config.enabledTools).toEqual(['slack_send_message', 'slack_list_channels']);
    expect(config.cacheTtl).toBe('12h');
    expect(config.logLevel).toBe('debug');

    process.env = originalEnv;
  });

  it('should use defaults for unset optional values', () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      SLACK_MCP_BOT_TOKEN: 'xoxb-test',
    };

    const config = loadConfig();

    expect(config.port).toBe(3000);
    expect(config.host).toBe('127.0.0.1');
    expect(config.timeoutMs).toBe(30000);
    expect(config.maxResults).toBe(100);
    expect(config.cacheTtl).toBe('24h');
    expect(config.logLevel).toBe('info');
    expect(config.govSlack).toBe(false);
    expect(config.serverCaInsecure).toBe(false);
    expect(config.enabledTools).toEqual([]);
    expect(config.channelIds).toEqual([]);

    process.env = originalEnv;
  });

  it('should exit if no tokens provided', () => {
    const originalEnv = process.env;
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    process.env = {
      ...originalEnv,
      SLACK_MCP_BOT_TOKEN: '',
      SLACK_MCP_USER_TOKEN: '',
      SLACK_MCP_XOXC_TOKEN: '',
      SLACK_MCP_XOXD_TOKEN: '',
    };

    expect(() => loadConfig()).toThrow('process.exit called');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalled();

    mockExit.mockRestore();
    mockError.mockRestore();
    process.env = originalEnv;
  });
});
