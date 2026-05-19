import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SlackMcpConfig } from './config.js';
import { SlackClient } from './client/slack-client.js';

// Tool schemas and handlers
import {
  sendMessageSchema,
  updateMessageSchema,
  deleteMessageSchema,
  scheduleMessageSchema,
  draftMessageSchema,
  getThreadSchema,
  handleSendMessage,
  handleUpdateMessage,
  handleDeleteMessage,
  handleScheduleMessage,
  handleDraftMessage,
  handleGetThread,
} from './tools/messages.js';

import {
  listChannelsSchema,
  getChannelInfoSchema,
  getChannelHistorySchema,
  createChannelSchema,
  getChannelMembersSchema,
  joinChannelSchema,
  leaveChannelSchema,
  handleListChannels,
  handleGetChannelInfo,
  handleGetChannelHistory,
  handleCreateChannel,
  handleGetChannelMembers,
  handleJoinChannel,
  handleLeaveChannel,
} from './tools/channels.js';

import {
  searchMessagesSchema,
  searchFilesSchema,
  searchUsersSchema,
  searchChannelsSchema,
  searchEmojiSchema,
  handleSearchMessages,
  handleSearchFiles,
  handleSearchUsers,
  handleSearchChannels,
  handleSearchEmoji,
} from './tools/search.js';

import {
  listUsersSchema,
  getUserProfileSchema,
  handleListUsers,
  handleGetUserProfile,
} from './tools/users.js';

import {
  listUsergroupsSchema,
  createUsergroupSchema,
  updateUsergroupSchema,
  updateUsergroupMembersSchema,
  myUsergroupsSchema,
  handleListUsergroups,
  handleCreateUsergroup,
  handleUpdateUsergroup,
  handleUpdateUsergroupMembers,
  handleMyUsergroups,
} from './tools/usergroups.js';

import {
  addReactionSchema,
  removeReactionSchema,
  handleAddReaction,
  handleRemoveReaction,
} from './tools/reactions.js';

import {
  uploadFileSchema,
  listFilesSchema,
  getAttachmentSchema,
  handleUploadFile,
  handleListFiles,
  handleGetAttachment,
} from './tools/files.js';

import {
  createCanvasSchema,
  updateCanvasSchema,
  readCanvasSchema,
  handleCreateCanvas,
  handleUpdateCanvas,
  handleReadCanvas,
} from './tools/canvases.js';

import {
  getUnreadsSchema,
  markReadSchema,
  handleGetUnreads,
  handleMarkRead,
} from './tools/unreads.js';

import {
  listSavedSchema,
  updateSavedSchema,
  clearCompletedSavedSchema,
  handleListSaved,
  handleUpdateSaved,
  handleClearCompletedSaved,
} from './tools/saved.js';

export function createServer(config: SlackMcpConfig): McpServer {
  const server = new McpServer({
    name: 'slack-mcp-server',
    version: '0.1.0',
  });

  const client = new SlackClient(config);

  const isToolEnabled = (toolName: string): boolean => {
    if (config.enabledTools.length === 0) return true;
    return config.enabledTools.includes(toolName);
  };

  // --- Messaging Tools ---
  if (isToolEnabled('slack_send_message')) {
    server.tool(
      'slack_send_message',
      'Send a message to a Slack channel or DM',
      sendMessageSchema.shape,
      async ({ channel, text, contentType, threadTs, blocks, unfurlLinks }) => {
        const result = await handleSendMessage(client, {
          channel,
          text,
          contentType,
          threadTs,
          blocks,
          unfurlLinks,
        });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_update_message')) {
    server.tool(
      'slack_update_message',
      'Update an existing Slack message',
      updateMessageSchema.shape,
      async ({ channel, ts, text }) => {
        const result = await handleUpdateMessage(client, { channel, ts, text });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_delete_message')) {
    server.tool(
      'slack_delete_message',
      'Delete a Slack message',
      deleteMessageSchema.shape,
      async ({ channel, ts }) => {
        const result = await handleDeleteMessage(client, { channel, ts });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_schedule_message')) {
    server.tool(
      'slack_schedule_message',
      'Schedule a message for future delivery',
      scheduleMessageSchema.shape,
      async ({ channel, text, postAt }) => {
        const result = await handleScheduleMessage(client, { channel, text, postAt });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_draft_message')) {
    server.tool(
      'slack_draft_message',
      'Draft a message for review before sending',
      draftMessageSchema.shape,
      async ({ channel, text, blocks }) => {
        const result = await handleDraftMessage(client, { channel, text, blocks });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_get_thread')) {
    server.tool(
      'slack_get_thread',
      'Get messages from a thread',
      getThreadSchema.shape,
      async ({ channel, threadTs, limit, cursor, includeActivityMessages }) => {
        const result = await handleGetThread(client, {
          channel,
          threadTs,
          limit,
          cursor,
          includeActivityMessages,
        });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- Channel Tools ---
  if (isToolEnabled('slack_list_channels')) {
    server.tool(
      'slack_list_channels',
      'List Slack channels in the workspace',
      listChannelsSchema.shape,
      async ({ types, sort, limit, cursor }) => {
        const result = await handleListChannels(client, { types, sort, limit, cursor });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_get_channel_info')) {
    server.tool(
      'slack_get_channel_info',
      'Get detailed information about a channel',
      getChannelInfoSchema.shape,
      async ({ channel }) => {
        const result = await handleGetChannelInfo(client, { channel });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_get_channel_history')) {
    server.tool(
      'slack_get_channel_history',
      'Get message history from a channel',
      getChannelHistorySchema.shape,
      async ({ channel, limit, oldest, latest, cursor, includeActivityMessages }) => {
        const result = await handleGetChannelHistory(client, {
          channel,
          limit,
          oldest,
          latest,
          cursor,
          includeActivityMessages,
        });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_create_channel')) {
    server.tool(
      'slack_create_channel',
      'Create a new Slack channel',
      createChannelSchema.shape,
      async ({ name, isPrivate, description }) => {
        const result = await handleCreateChannel(client, { name, isPrivate, description });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_get_channel_members')) {
    server.tool(
      'slack_get_channel_members',
      'List members of a channel',
      getChannelMembersSchema.shape,
      async ({ channel, limit, cursor }) => {
        const result = await handleGetChannelMembers(client, { channel, limit, cursor });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_join_channel')) {
    server.tool(
      'slack_join_channel',
      'Join a Slack channel',
      joinChannelSchema.shape,
      async ({ channel }) => {
        const result = await handleJoinChannel(client, { channel });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_leave_channel')) {
    server.tool(
      'slack_leave_channel',
      'Leave a Slack channel',
      leaveChannelSchema.shape,
      async ({ channel }) => {
        const result = await handleLeaveChannel(client, { channel });
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- Search Tools ---
  if (isToolEnabled('slack_search_messages')) {
    server.tool(
      'slack_search_messages',
      'Search messages across the workspace',
      searchMessagesSchema.shape,
      async (params) => {
        const result = await handleSearchMessages(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_search_files')) {
    server.tool(
      'slack_search_files',
      'Search files in the workspace',
      searchFilesSchema.shape,
      async (params) => {
        const result = await handleSearchFiles(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_search_users')) {
    server.tool(
      'slack_search_users',
      'Search users by name or email',
      searchUsersSchema.shape,
      async (params) => {
        const result = await handleSearchUsers(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_search_channels')) {
    server.tool(
      'slack_search_channels',
      'Search channels by name or topic',
      searchChannelsSchema.shape,
      async (params) => {
        const result = await handleSearchChannels(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_search_emoji')) {
    server.tool(
      'slack_search_emoji',
      'Search custom emoji in the workspace',
      searchEmojiSchema.shape,
      async (params) => {
        const result = await handleSearchEmoji(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- User Tools ---
  if (isToolEnabled('slack_list_users')) {
    server.tool(
      'slack_list_users',
      'List users in the workspace',
      listUsersSchema.shape,
      async (params) => {
        const result = await handleListUsers(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_get_user_profile')) {
    server.tool(
      'slack_get_user_profile',
      'Get detailed profile for a user',
      getUserProfileSchema.shape,
      async (params) => {
        const result = await handleGetUserProfile(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- User Group Tools ---
  if (isToolEnabled('slack_list_usergroups')) {
    server.tool(
      'slack_list_usergroups',
      'List user groups in the workspace',
      listUsergroupsSchema.shape,
      async (params) => {
        const result = await handleListUsergroups(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_create_usergroup')) {
    server.tool(
      'slack_create_usergroup',
      'Create a new user group',
      createUsergroupSchema.shape,
      async (params) => {
        const result = await handleCreateUsergroup(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_update_usergroup')) {
    server.tool(
      'slack_update_usergroup',
      'Update a user group',
      updateUsergroupSchema.shape,
      async (params) => {
        const result = await handleUpdateUsergroup(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_update_usergroup_members')) {
    server.tool(
      'slack_update_usergroup_members',
      'Update members of a user group',
      updateUsergroupMembersSchema.shape,
      async (params) => {
        const result = await handleUpdateUsergroupMembers(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_my_usergroups')) {
    server.tool(
      'slack_my_usergroups',
      'List, join, or leave user groups',
      myUsergroupsSchema.shape,
      async (params) => {
        const result = await handleMyUsergroups(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- Reaction Tools ---
  if (isToolEnabled('slack_add_reaction')) {
    server.tool(
      'slack_add_reaction',
      'Add a reaction emoji to a message',
      addReactionSchema.shape,
      async (params) => {
        const result = await handleAddReaction(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_remove_reaction')) {
    server.tool(
      'slack_remove_reaction',
      'Remove a reaction emoji from a message',
      removeReactionSchema.shape,
      async (params) => {
        const result = await handleRemoveReaction(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- File Tools ---
  if (isToolEnabled('slack_upload_file')) {
    server.tool(
      'slack_upload_file',
      'Upload a file to Slack',
      uploadFileSchema.shape,
      async (params) => {
        const result = await handleUploadFile(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_list_files')) {
    server.tool(
      'slack_list_files',
      'List files in a channel or workspace',
      listFilesSchema.shape,
      async (params) => {
        const result = await handleListFiles(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_get_attachment')) {
    server.tool(
      'slack_get_attachment',
      'Download and read an attachment from a message',
      getAttachmentSchema.shape,
      async (params) => {
        const result = await handleGetAttachment(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- Canvas Tools ---
  if (isToolEnabled('slack_create_canvas')) {
    server.tool(
      'slack_create_canvas',
      'Create a new Slack canvas',
      createCanvasSchema.shape,
      async (params) => {
        const result = await handleCreateCanvas(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_update_canvas')) {
    server.tool(
      'slack_update_canvas',
      'Update an existing Slack canvas',
      updateCanvasSchema.shape,
      async (params) => {
        const result = await handleUpdateCanvas(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_read_canvas')) {
    server.tool(
      'slack_read_canvas',
      'Read content from a Slack canvas',
      readCanvasSchema.shape,
      async (params) => {
        const result = await handleReadCanvas(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- Unread Tools ---
  if (isToolEnabled('slack_get_unreads')) {
    server.tool(
      'slack_get_unreads',
      'Get unread messages across channels',
      getUnreadsSchema.shape,
      async (params) => {
        const result = await handleGetUnreads(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_mark_read')) {
    server.tool(
      'slack_mark_read',
      'Mark a channel as read',
      markReadSchema.shape,
      async (params) => {
        const result = await handleMarkRead(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  // --- Saved Item Tools ---
  if (isToolEnabled('slack_list_saved')) {
    server.tool(
      'slack_list_saved',
      'List saved/bookmarked items',
      listSavedSchema.shape,
      async (params) => {
        const result = await handleListSaved(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_update_saved')) {
    server.tool(
      'slack_update_saved',
      'Update a saved item (mark complete, set due date)',
      updateSavedSchema.shape,
      async (params) => {
        const result = await handleUpdateSaved(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  if (isToolEnabled('slack_clear_completed_saved')) {
    server.tool(
      'slack_clear_completed_saved',
      'Clear all completed saved items',
      clearCompletedSavedSchema.shape,
      async (params) => {
        const result = await handleClearCompletedSaved(client, params);
        return { content: [{ type: 'text', text: result }] };
      }
    );
  }

  return server;
}
