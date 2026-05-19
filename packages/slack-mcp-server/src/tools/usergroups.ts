import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';
import { formatUserGroup } from '../utils/formatter.js';

export const listUsergroupsSchema = z.object({
  includeUsers: z.boolean().optional().default(false).describe('Include user list'),
  includeCount: z.boolean().optional().default(true).describe('Include user count'),
  includeDisabled: z.boolean().optional().default(false).describe('Include disabled groups'),
});

export const createUsergroupSchema = z.object({
  name: z.string().describe('User group name'),
  handle: z.string().optional().describe('Group handle (mention name)'),
  description: z.string().optional().describe('Group description'),
  channels: z.string().optional().describe('Comma-separated default channel IDs'),
});

export const updateUsergroupSchema = z.object({
  usergroupId: z.string().describe('User group ID'),
  name: z.string().optional().describe('New name'),
  handle: z.string().optional().describe('New handle'),
  description: z.string().optional().describe('New description'),
  channels: z.string().optional().describe('Comma-separated default channel IDs'),
});

export const updateUsergroupMembersSchema = z.object({
  usergroupId: z.string().describe('User group ID'),
  users: z.string().describe('Comma-separated user IDs'),
});

export const myUsergroupsSchema = z.object({
  action: z.enum(['list', 'join', 'leave']).describe('Action to perform'),
  usergroupId: z.string().optional().describe('Group ID for join/leave'),
});

export async function handleListUsergroups(
  client: SlackClient,
  params: z.infer<typeof listUsergroupsSchema>
): Promise<string> {
  const result = await withRateLimit('usergroups.list', () =>
    client.web.usergroups.list({
      include_users: params.includeUsers,
      include_count: params.includeCount,
      include_disabled: params.includeDisabled,
    })
  );

  const groups = (result.usergroups || []) as Record<string, unknown>[];
  if (groups.length === 0) return 'No user groups found.';

  const formatted = groups.map(formatUserGroup).join('\n');
  return `User Groups (${groups.length}):\n${formatted}`;
}

export async function handleCreateUsergroup(
  client: SlackClient,
  params: z.infer<typeof createUsergroupSchema>
): Promise<string> {
  const result = await withRateLimit('usergroups.create', () =>
    client.web.usergroups.create({
      name: params.name,
      handle: params.handle,
      description: params.description,
      channels: params.channels,
    })
  );

  const group = result.usergroup as Record<string, unknown>;
  return `User group created: @${group.handle} (${group.id})`;
}

export async function handleUpdateUsergroup(
  client: SlackClient,
  params: z.infer<typeof updateUsergroupSchema>
): Promise<string> {
  await withRateLimit('usergroups.update', () =>
    client.web.usergroups.update({
      usergroup: params.usergroupId,
      ...(params.name && { name: params.name }),
      ...(params.handle && { handle: params.handle }),
      ...(params.description && { description: params.description }),
      ...(params.channels && { channels: params.channels }),
    })
  );

  return `User group ${params.usergroupId} updated.`;
}

export async function handleUpdateUsergroupMembers(
  client: SlackClient,
  params: z.infer<typeof updateUsergroupMembersSchema>
): Promise<string> {
  await withRateLimit('usergroups.users.update', () =>
    client.web.usergroups.users.update({
      usergroup: params.usergroupId,
      users: params.users,
    })
  );

  return `Members updated for group ${params.usergroupId}.`;
}

export async function handleMyUsergroups(
  client: SlackClient,
  params: z.infer<typeof myUsergroupsSchema>
): Promise<string> {
  if (params.action === 'list') {
    const result = await withRateLimit('usergroups.list', () =>
      client.web.usergroups.list({ include_users: true })
    );
    const groups = (result.usergroups || []) as Record<string, unknown>[];
    const formatted = groups.map(formatUserGroup).join('\n');
    return `My user groups (${groups.length}):\n${formatted}`;
  }

  if (!params.usergroupId) return 'Error: usergroupId required for join/leave.';

  if (params.action === 'join') {
    return `To join group ${params.usergroupId}, use slack_update_usergroup_members to add yourself.`;
  }

  return `To leave group ${params.usergroupId}, use slack_update_usergroup_members to remove yourself.`;
}
