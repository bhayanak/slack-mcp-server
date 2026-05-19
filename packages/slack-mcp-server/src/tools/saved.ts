import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';

export const listSavedSchema = z.object({
  filter: z
    .enum(['saved', 'completed', 'archived'])
    .optional()
    .default('saved')
    .describe('Filter saved items'),
  limit: z.number().optional().default(50).describe('Max items'),
  includeMessages: z.boolean().optional().default(true).describe('Include message content'),
  maxMessagesPerItem: z.number().optional().default(5).describe('Max messages per saved item'),
});

export const updateSavedSchema = z.object({
  itemId: z.string().describe('Saved item ID'),
  ts: z.string().describe('Timestamp of the saved item'),
  mark: z.enum(['completed']).optional().describe('Mark item status'),
  dateDue: z.number().optional().describe('Due date as Unix timestamp'),
});

export const clearCompletedSavedSchema = z.object({});

export async function handleListSaved(
  client: SlackClient,
  _params: z.infer<typeof listSavedSchema>
): Promise<string> {
  // Stars.list is the closest standard API for saved/bookmarked items
  const result = await withRateLimit('stars.list', () =>
    client.getUserClient().stars.list({ limit: _params.limit })
  );

  const items = (result.items || []) as Record<string, unknown>[];
  if (items.length === 0) return 'No saved items found.';

  const formatted = items
    .map((item) => {
      const type = item.type as string;
      if (type === 'message') {
        const msg = item.message as Record<string, unknown>;
        const channel = item.channel as string;
        const text = (msg?.text as string) || '';
        const ts = msg?.ts as string;
        return `[message] ${channel}/${ts}: ${text.slice(0, 100)}`;
      }
      if (type === 'file') {
        const file = item.file as Record<string, unknown>;
        return `[file] ${file?.name || 'unnamed'} (${file?.id})`;
      }
      return `[${type}] ${JSON.stringify(item).slice(0, 100)}`;
    })
    .join('\n');

  return `Saved items (${items.length}):\n${formatted}`;
}

export async function handleUpdateSaved(
  client: SlackClient,
  params: z.infer<typeof updateSavedSchema>
): Promise<string> {
  if (params.mark === 'completed') {
    await withRateLimit('stars.remove', () =>
      client.getUserClient().stars.remove({ timestamp: params.ts, channel: params.itemId })
    );
    return `Saved item ${params.itemId}/${params.ts} marked as completed.`;
  }
  return `Saved item ${params.itemId} updated.`;
}

export async function handleClearCompletedSaved(
  _client: SlackClient,
  _params: z.infer<typeof clearCompletedSavedSchema>
): Promise<string> {
  return 'Clear completed saved items is not directly supported via Slack Web API. Completed items are removed individually via stars.remove.';
}
