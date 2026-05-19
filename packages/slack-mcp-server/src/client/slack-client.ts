import { WebClient } from '@slack/web-api';
import type { SlackMcpConfig } from '../config.js';

export class SlackClient {
  private client: WebClient;
  private config: SlackMcpConfig;

  constructor(config: SlackMcpConfig) {
    this.config = config;
    const token = config.userToken || config.botToken || config.xoxcToken;

    const options: Record<string, unknown> = {
      token,
      timeout: config.timeoutMs,
    };

    if (config.xoxcToken && config.xoxdToken) {
      options.headers = { cookie: `d=${config.xoxdToken}` };
    }

    if (config.serverCaInsecure) {
      options.tls = { rejectUnauthorized: false };
    }

    if (config.govSlack) {
      options.slackApiUrl = 'https://slack-gov.com/api/';
    }

    this.client = new WebClient(token, options);
  }

  get web(): WebClient {
    return this.client;
  }

  get hasUserToken(): boolean {
    return !!this.config.userToken;
  }

  get hasBotToken(): boolean {
    return !!this.config.botToken;
  }

  get hasBrowserToken(): boolean {
    return !!this.config.xoxcToken && !!this.config.xoxdToken;
  }

  getUserClient(): WebClient {
    if (this.config.userToken) {
      return new WebClient(this.config.userToken, { timeout: this.config.timeoutMs });
    }
    return this.client;
  }

  getBotClient(): WebClient {
    if (this.config.botToken) {
      return new WebClient(this.config.botToken, { timeout: this.config.timeoutMs });
    }
    return this.client;
  }
}
