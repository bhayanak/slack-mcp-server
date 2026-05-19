import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';
import { formatChannel, formatMessage } from '../utils/formatter.js';

export const listChannelsSchema = z.object({
  types: z.string().optional().default('public_channel').describe('Channel types to list'),
  sort: z.enum(['popularity']).optional().describe('Sort order'),
  limit: z.number().optional().default(100).describe('Max channels to return'),
  cursor: z.string().optional().describe('Pagination cursor'),
});

export const getChannelInfoSchema = z.object({
  channel: z.string().describe('Channel ID or name'),
});

export const getChannelHistorySchema = z.object({
  channel: z.string().describe('Channel ID or name'),
  limit: z.number().optional().default(50).describe('Max messages'),
  oldest: z.string().optional().describe('Oldest timestamp'),
  latest: z.string().optional().describe('Latest timestamp'),
  cursor: z.string().optional().describe('Pagination cursor'),
  includeActivityMessages: z.boolean().optional().default(false),
});

export const createChannelSchema = z.object({
  name: z.string().describe('Channel name'),
  isPrivate: z.boolean().optional().default(false).describe('Create as private channel'),
  description: z.string().optional().describe('Channel purpose/description'),
});

export const getChannelMembersSchema = z.object({
  channel: z.string().describe('Channel ID'),
  limit: z.number().optional().default(100).describe('Max members'),
  cursor: z.string().optional().describe('Pagination cursor'),
});

export const joinChannelSchema = z.object({
  channel: z.string().describe('Channel ID or name'),
});

export const leaveChannelSchema = z.object({
  channel: z.string().describe('Channel ID'),
});

export async function handleListChannels(
  client: SlackClient,
  params: z.infer<typeof listChannelsSchema>
): Promise<string> {
  const result = await withRateLimit('conversations.list', () =>
    client.web.conversations.list({
      types: params.types,
      limit: params.limit,
      cursor: params.cursor,
      exclude_archived: true,
    })
  );

  const channels = (result.channels || []) as Record<string, unknown>[];
  if (channels.length === 0) return 'No channels found.';

  const formatted = channels.map(formatChannel).join('\n');
  const nextCursor = (result.response_metadata as Record<string, string>)?.next_cursor;
  let output = `Channels (${channels.length}):\n${formatted}`;
  if (nextCursor) output += `\n\n[More available, cursor: ${nextCursor}]`;
  return output;
}

export async function handleGetChannelInfo(
  client: SlackClient,
  params: z.infer<typeof getChannelInfoSchema>
): Promise<string> {
  const result = await withRateLimit('conversations.info', () =>
    client.web.conversations.info({ channel: params.channel })
  );

  const ch = result.channel as Record<string, unknown>;
  return formatChannel(ch);
}

export async function handleGetChannelHistory(
  client: SlackClient,
  params: z.infer<typeof getChannelHistorySchema>
): Promise<string> {
  const result = await withRateLimit('conversations.history', () =>
    client.web.conversations.history({
      channel: params.channel,
      limit: params.limit,
      oldest: params.oldest,
      latest: params.latest,
      cursor: params.cursor,
    })
  );

  const messages = (result.messages || []) as Record<string, unknown>[];
  if (messages.length === 0) return 'No messages found.';

  const formatted = messages.map(formatMessage).join('\n');
  const nextCursor = (result.response_metadata as Record<string, string>)?.next_cursor;
  let output = `Channel history (${messages.length} messages):\n${formatted}`;
  if (nextCursor) output += `\n\n[More messages available, cursor: ${nextCursor}]`;
  return output;
}

export async function handleCreateChannel(
  client: SlackClient,
  params: z.infer<typeof createChannelSchema>
): Promise<string> {
  const result = await withRateLimit('conversations.create', () =>
    client.web.conversations.create({
      name: params.name,
      is_private: params.isPrivate,
    })
  );

  const ch = result.channel as Record<string, unknown>;
  const channelId = ch.id as string;

  if (params.description) {
    await withRateLimit('conversations.setPurpose', () =>
      client.web.conversations.setPurpose({
        channel: channelId,
        purpose: params.description!,
      })
    );
  }

  return `Channel created: #${params.name} (${channelId})`;
}

export async function handleGetChannelMembers(
  client: SlackClient,
  params: z.infer<typeof getChannelMembersSchema>
): Promise<string> {
  const result = await withRateLimit('conversations.members', () =>
    client.web.conversations.members({
      channel: params.channel,
      limit: params.limit,
      cursor: params.cursor,
    })
  );

  const members = (result.members || []) as string[];
  const nextCursor = (result.response_metadata as Record<string, string>)?.next_cursor;
  let output = `Members (${members.length}): ${members.join(', ')}`;
  if (nextCursor) output += `\n\n[More available, cursor: ${nextCursor}]`;
  return output;
}

export async function handleJoinChannel(
  client: SlackClient,
  params: z.infer<typeof joinChannelSchema>
): Promise<string> {
  await withRateLimit('conversations.join', () =>
    client.web.conversations.join({ channel: params.channel })
  );
  return `Joined channel ${params.channel}`;
}

export async function handleLeaveChannel(
  client: SlackClient,
  params: z.infer<typeof leaveChannelSchema>
): Promise<string> {
  await withRateLimit('conversations.leave', () =>
    client.web.conversations.leave({ channel: params.channel })
  );
  return `Left channel ${params.channel}`;
}
