import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';
import { formatMessage } from '../utils/formatter.js';

export const searchMessagesSchema = z.object({
  query: z.string().optional().describe('Search query'),
  filterInChannel: z.string().optional().describe('Filter to specific channel'),
  filterUsersFrom: z.string().optional().describe('Filter by sender'),
  filterDateBefore: z.string().optional().describe('Before date'),
  filterDateAfter: z.string().optional().describe('After date'),
  filterDateOn: z.string().optional().describe('On date'),
  sort: z.enum(['score', 'timestamp']).optional().default('score').describe('Sort order'),
  limit: z.number().optional().default(20).describe('Max results'),
  cursor: z.string().optional().describe('Pagination cursor'),
});

export const searchFilesSchema = z.object({
  query: z.string().describe('Search query'),
  types: z.string().optional().describe('File types filter'),
  limit: z.number().optional().default(20).describe('Max results'),
  cursor: z.string().optional().describe('Pagination cursor'),
});

export const searchUsersSchema = z.object({
  query: z.string().describe('Search query (name or email)'),
  limit: z.number().optional().default(10).describe('Max results'),
});

export const searchChannelsSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().optional().default(20).describe('Max results'),
});

export const searchEmojiSchema = z.object({
  query: z.string().optional().describe('Emoji search query'),
});

export async function handleSearchMessages(
  client: SlackClient,
  params: z.infer<typeof searchMessagesSchema>
): Promise<string> {
  const queryParts: string[] = [];
  if (params.query) queryParts.push(params.query);
  if (params.filterInChannel) queryParts.push(`in:${params.filterInChannel}`);
  if (params.filterUsersFrom) queryParts.push(`from:${params.filterUsersFrom}`);
  if (params.filterDateBefore) queryParts.push(`before:${params.filterDateBefore}`);
  if (params.filterDateAfter) queryParts.push(`after:${params.filterDateAfter}`);
  if (params.filterDateOn) queryParts.push(`on:${params.filterDateOn}`);

  const query = queryParts.join(' ') || '*';

  const result = await withRateLimit('search.messages', () =>
    client.getUserClient().search.messages({
      query,
      sort: params.sort,
      count: params.limit,
    })
  );

  const matches = (result.messages?.matches || []) as Record<string, unknown>[];
  if (matches.length === 0) return 'No messages found matching query.';

  const formatted = matches.map(formatMessage).join('\n');
  return `Search results (${matches.length} messages):\n${formatted}`;
}

export async function handleSearchFiles(
  client: SlackClient,
  params: z.infer<typeof searchFilesSchema>
): Promise<string> {
  const result = await withRateLimit('search.files', () =>
    client.getUserClient().search.files({
      query: params.query,
      count: params.limit,
    })
  );

  const matches = (result.files?.matches || []) as Record<string, unknown>[];
  if (matches.length === 0) return 'No files found.';

  const formatted = matches
    .map((f) => {
      const name = f.name as string;
      const id = f.id as string;
      const type = f.filetype as string;
      const size = f.size as number;
      return `${name} (${id}) — ${type}, ${Math.round(size / 1024)}KB`;
    })
    .join('\n');

  return `Files found (${matches.length}):\n${formatted}`;
}

export async function handleSearchUsers(
  client: SlackClient,
  params: z.infer<typeof searchUsersSchema>
): Promise<string> {
  const result = await withRateLimit('users.list', () => client.web.users.list({ limit: 200 }));

  const members = (result.members || []) as Record<string, unknown>[];
  const query = params.query.toLowerCase();

  const matches = members.filter((m) => {
    const name = ((m.name as string) || '').toLowerCase();
    const realName = ((m.real_name as string) || '').toLowerCase();
    const profile = m.profile as Record<string, string> | undefined;
    const email = (profile?.email || '').toLowerCase();
    const displayName = (profile?.display_name || '').toLowerCase();
    return (
      name.includes(query) ||
      realName.includes(query) ||
      email.includes(query) ||
      displayName.includes(query)
    );
  });

  if (matches.length === 0) return 'No users found.';

  const limited = matches.slice(0, params.limit);
  const formatted = limited
    .map((m) => {
      const id = m.id as string;
      const name = m.name as string;
      const realName = m.real_name as string;
      return `@${name} (${id}) — ${realName}`;
    })
    .join('\n');

  return `Users found (${limited.length}):\n${formatted}`;
}

export async function handleSearchChannels(
  client: SlackClient,
  params: z.infer<typeof searchChannelsSchema>
): Promise<string> {
  const result = await withRateLimit('conversations.list', () =>
    client.web.conversations.list({ limit: 999, exclude_archived: true })
  );

  const channels = (result.channels || []) as Record<string, unknown>[];
  const query = params.query.toLowerCase();

  const matches = channels.filter((ch) => {
    const name = ((ch.name as string) || '').toLowerCase();
    const topic = ((ch.topic as Record<string, string>)?.value || '').toLowerCase();
    const purpose = ((ch.purpose as Record<string, string>)?.value || '').toLowerCase();
    return name.includes(query) || topic.includes(query) || purpose.includes(query);
  });

  if (matches.length === 0) return 'No channels found.';

  const limited = matches.slice(0, params.limit);
  const formatted = limited
    .map((ch) => {
      const id = ch.id as string;
      const name = ch.name as string;
      const memberCount = ch.num_members as number;
      return `#${name} (${id}) — ${memberCount} members`;
    })
    .join('\n');

  return `Channels found (${limited.length}):\n${formatted}`;
}

export async function handleSearchEmoji(
  client: SlackClient,
  params: z.infer<typeof searchEmojiSchema>
): Promise<string> {
  const result = await withRateLimit('emoji.list', () => client.getUserClient().emoji.list());

  const emoji = (result.emoji || {}) as Record<string, string>;
  const entries = Object.entries(emoji);

  if (params.query) {
    const query = params.query.toLowerCase();
    const matches = entries.filter(([name]) => name.toLowerCase().includes(query));
    if (matches.length === 0) return 'No emoji found matching query.';
    const formatted = matches.slice(0, 50).map(([name, url]) => `:${name}: → ${url}`);
    return `Emoji found (${matches.length}):\n${formatted.join('\n')}`;
  }

  return `Custom emoji (${entries.length} total):\n${entries
    .slice(0, 50)
    .map(([name]) => `:${name}:`)
    .join(', ')}`;
}
