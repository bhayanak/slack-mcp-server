import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';

export const addReactionSchema = z.object({
  channel: z.string().describe('Channel ID'),
  timestamp: z.string().describe('Message timestamp'),
  emoji: z.string().describe('Emoji name without colons'),
});

export const removeReactionSchema = z.object({
  channel: z.string().describe('Channel ID'),
  timestamp: z.string().describe('Message timestamp'),
  emoji: z.string().describe('Emoji name without colons'),
});

export async function handleAddReaction(
  client: SlackClient,
  params: z.infer<typeof addReactionSchema>
): Promise<string> {
  await withRateLimit('reactions.add', () =>
    client.web.reactions.add({
      channel: params.channel,
      timestamp: params.timestamp,
      name: params.emoji,
    })
  );
  return `Reaction :${params.emoji}: added to message ${params.timestamp} in ${params.channel}`;
}

export async function handleRemoveReaction(
  client: SlackClient,
  params: z.infer<typeof removeReactionSchema>
): Promise<string> {
  await withRateLimit('reactions.remove', () =>
    client.web.reactions.remove({
      channel: params.channel,
      timestamp: params.timestamp,
      name: params.emoji,
    })
  );
  return `Reaction :${params.emoji}: removed from message ${params.timestamp} in ${params.channel}`;
}
