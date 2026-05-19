import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';
import { formatMessage } from '../utils/formatter.js';

export const getUnreadsSchema = z.object({
  includeMessages: z.boolean().optional().default(true).describe('Include message previews'),
  channelTypes: z
    .enum(['all', 'dm', 'group_dm', 'partner', 'internal'])
    .optional()
    .default('all')
    .describe('Channel type filter'),
  maxChannels: z.number().optional().default(50).describe('Max channels to check'),
  maxMessagesPerChannel: z.number().optional().default(10).describe('Max messages per channel'),
  mentionsOnly: z.boolean().optional().default(false).describe('Only show mentions'),
});

export const markReadSchema = z.object({
  channel: z.string().describe('Channel ID'),
  ts: z.string().optional().describe('Timestamp to mark as read up to (latest if omitted)'),
});

export async function handleGetUnreads(
  client: SlackClient,
  params: z.infer<typeof getUnreadsSchema>
): Promise<string> {
  // Get list of conversations with unread counts
  const convResult = await withRateLimit('conversations.list', () =>
    client.web.conversations.list({
      types: getChannelTypes(params.channelTypes),
      limit: params.maxChannels,
      exclude_archived: true,
    })
  );

  const channels = (convResult.channels || []) as Record<string, unknown>[];
  const unreadChannels = channels.filter(
    (ch) => (ch.unread_count as number) > 0 || (ch.unread_count_display as number) > 0
  );

  if (unreadChannels.length === 0) return 'No unread messages.';

  const results: string[] = [];
  for (const ch of unreadChannels.slice(0, params.maxChannels)) {
    const name = (ch.name as string) || (ch.id as string);
    const unreadCount = (ch.unread_count_display as number) || (ch.unread_count as number) || 0;
    let line = `#${name}: ${unreadCount} unread`;

    if (params.includeMessages && unreadCount > 0) {
      try {
        const histResult = await withRateLimit('conversations.history', () =>
          client.web.conversations.history({
            channel: ch.id as string,
            limit: params.maxMessagesPerChannel,
          })
        );
        const msgs = (histResult.messages || []) as Record<string, unknown>[];
        const preview = msgs.slice(0, 3).map(formatMessage).join('\n  ');
        if (preview) line += `\n  ${preview}`;
      } catch {
        // Skip channels we can't read
      }
    }
    results.push(line);
  }

  return `Unread messages (${unreadChannels.length} channels):\n${results.join('\n\n')}`;
}

export async function handleMarkRead(
  client: SlackClient,
  params: z.infer<typeof markReadSchema>
): Promise<string> {
  const ts = params.ts || String(Date.now() / 1000);
  await withRateLimit('conversations.mark', () =>
    client.web.conversations.mark({
      channel: params.channel,
      ts,
    })
  );
  return `Channel ${params.channel} marked as read.`;
}

function getChannelTypes(type: string): string {
  switch (type) {
    case 'dm':
      return 'im';
    case 'group_dm':
      return 'mpim';
    case 'internal':
      return 'public_channel,private_channel';
    default:
      return 'public_channel,private_channel,im,mpim';
  }
}
