import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';
import { formatMessage } from '../utils/formatter.js';

export const sendMessageSchema = z.object({
  channel: z.string().describe('Channel name, ID, or @username for DM'),
  text: z.string().describe('Message text'),
  contentType: z
    .enum(['text/markdown', 'text/plain'])
    .optional()
    .default('text/markdown')
    .describe('Content type'),
  threadTs: z.string().optional().describe('Thread timestamp to reply to'),
  blocks: z.string().optional().describe('Block Kit JSON array'),
  unfurlLinks: z.boolean().optional().describe('Enable link unfurling'),
});

export const updateMessageSchema = z.object({
  channel: z.string().describe('Channel ID'),
  ts: z.string().describe('Timestamp of message to update'),
  text: z.string().describe('New message text'),
});

export const deleteMessageSchema = z.object({
  channel: z.string().describe('Channel ID'),
  ts: z.string().describe('Timestamp of message to delete'),
});

export const scheduleMessageSchema = z.object({
  channel: z.string().describe('Channel ID or name'),
  text: z.string().describe('Message text'),
  postAt: z.string().describe('ISO 8601 datetime or Unix timestamp'),
});

export const draftMessageSchema = z.object({
  channel: z.string().describe('Channel ID or name'),
  text: z.string().describe('Message text'),
  blocks: z.string().optional().describe('Block Kit JSON array'),
});

export const getThreadSchema = z.object({
  channel: z.string().describe('Channel ID'),
  threadTs: z.string().describe('Thread parent timestamp'),
  limit: z.number().optional().default(50).describe('Max messages to return'),
  cursor: z.string().optional().describe('Pagination cursor'),
  includeActivityMessages: z.boolean().optional().default(false),
});

export async function handleSendMessage(
  client: SlackClient,
  params: z.infer<typeof sendMessageSchema>
): Promise<string> {
  const blocks = params.blocks ? JSON.parse(params.blocks) : undefined;
  const result = await withRateLimit('chat.postMessage', () =>
    client.web.chat.postMessage({
      channel: params.channel,
      text: params.text,
      thread_ts: params.threadTs,
      blocks,
      unfurl_links: params.unfurlLinks,
    })
  );
  return `Message sent to ${params.channel} (ts: ${result.ts})`;
}

export async function handleUpdateMessage(
  client: SlackClient,
  params: z.infer<typeof updateMessageSchema>
): Promise<string> {
  await withRateLimit('chat.update', () =>
    client.web.chat.update({
      channel: params.channel,
      ts: params.ts,
      text: params.text,
    })
  );
  return `Message ${params.ts} updated in ${params.channel}`;
}

export async function handleDeleteMessage(
  client: SlackClient,
  params: z.infer<typeof deleteMessageSchema>
): Promise<string> {
  await withRateLimit('chat.delete', () =>
    client.web.chat.delete({
      channel: params.channel,
      ts: params.ts,
    })
  );
  return `Message ${params.ts} deleted from ${params.channel}`;
}

export async function handleScheduleMessage(
  client: SlackClient,
  params: z.infer<typeof scheduleMessageSchema>
): Promise<string> {
  const postAt = params.postAt.match(/^\d+$/)
    ? parseInt(params.postAt, 10)
    : Math.floor(new Date(params.postAt).getTime() / 1000);

  const result = await withRateLimit('chat.scheduleMessage', () =>
    client.web.chat.scheduleMessage({
      channel: params.channel,
      text: params.text,
      post_at: postAt,
    })
  );
  return `Message scheduled for ${params.channel} (scheduled_message_id: ${result.scheduled_message_id})`;
}

export async function handleDraftMessage(
  _client: SlackClient,
  params: z.infer<typeof draftMessageSchema>
): Promise<string> {
  const draft = {
    channel: params.channel,
    text: params.text,
    blocks: params.blocks ? JSON.parse(params.blocks) : undefined,
  };
  return `Draft prepared for ${params.channel}:\n${JSON.stringify(draft, null, 2)}\n\nNote: Slack Web API does not support saving drafts server-side. This draft is returned for review.`;
}

export async function handleGetThread(
  client: SlackClient,
  params: z.infer<typeof getThreadSchema>
): Promise<string> {
  const result = await withRateLimit('conversations.replies', () =>
    client.web.conversations.replies({
      channel: params.channel,
      ts: params.threadTs,
      limit: params.limit,
      cursor: params.cursor,
    })
  );

  const messages = (result.messages || []) as Record<string, unknown>[];
  if (messages.length === 0) return 'No messages found in thread.';

  const formatted = messages.map(formatMessage).join('\n');
  const nextCursor = (result.response_metadata as Record<string, string>)?.next_cursor;
  let output = `Thread ${params.threadTs} (${messages.length} messages):\n${formatted}`;
  if (nextCursor) output += `\n\n[More messages available, cursor: ${nextCursor}]`;
  return output;
}
