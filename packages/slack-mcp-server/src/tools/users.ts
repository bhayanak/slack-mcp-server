import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';
import { formatUser } from '../utils/formatter.js';

export const listUsersSchema = z.object({
  limit: z.number().optional().default(50).describe('Max users to return'),
  cursor: z.string().optional().describe('Pagination cursor'),
  includePresence: z.boolean().optional().default(false).describe('Include presence info'),
});

export const getUserProfileSchema = z.object({
  userId: z.string().optional().describe('User ID to look up'),
  email: z.string().optional().describe('Email to look up'),
});

export async function handleListUsers(
  client: SlackClient,
  params: z.infer<typeof listUsersSchema>
): Promise<string> {
  const result = await withRateLimit('users.list', () =>
    client.web.users.list({
      limit: params.limit,
      cursor: params.cursor,
      include_locale: true,
    })
  );

  const members = (result.members || []) as Record<string, unknown>[];
  const active = members.filter((m) => !(m.deleted as boolean) && !(m.is_bot as boolean));

  if (active.length === 0) return 'No users found.';

  const formatted = active.map(formatUser).join('\n');
  const nextCursor = (result.response_metadata as Record<string, string>)?.next_cursor;
  let output = `Users (${active.length}):\n${formatted}`;
  if (nextCursor) output += `\n\n[More available, cursor: ${nextCursor}]`;
  return output;
}

export async function handleGetUserProfile(
  client: SlackClient,
  params: z.infer<typeof getUserProfileSchema>
): Promise<string> {
  let userId = params.userId;

  if (!userId && params.email) {
    const lookup = await withRateLimit('users.lookupByEmail', () =>
      client.web.users.lookupByEmail({ email: params.email! })
    );
    userId = (lookup.user as Record<string, unknown>)?.id as string;
  }

  if (!userId) return 'Error: Either userId or email is required.';

  const result = await withRateLimit('users.info', () => client.web.users.info({ user: userId! }));

  const user = result.user as Record<string, unknown>;
  const profile = user.profile as Record<string, string>;

  const lines = [
    `User: @${user.name} (${user.id})`,
    `Real Name: ${profile.real_name || 'N/A'}`,
    `Display Name: ${profile.display_name || 'N/A'}`,
    `Email: ${profile.email || 'N/A'}`,
    `Title: ${profile.title || 'N/A'}`,
    `Phone: ${profile.phone || 'N/A'}`,
    `Status: ${profile.status_emoji || ''} ${profile.status_text || 'N/A'}`,
    `Timezone: ${(user.tz as string) || 'N/A'}`,
    `Is Admin: ${user.is_admin ? 'Yes' : 'No'}`,
  ];

  return lines.join('\n');
}
