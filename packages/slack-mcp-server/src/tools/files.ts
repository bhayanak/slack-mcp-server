import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';

export const uploadFileSchema = z.object({
  channels: z.string().describe('Comma-separated channel IDs to share file to'),
  content: z.string().optional().describe('File content as text'),
  filename: z.string().describe('Filename'),
  title: z.string().optional().describe('File title'),
});

export const listFilesSchema = z.object({
  channel: z.string().optional().describe('Filter by channel'),
  types: z.string().optional().describe('File types filter'),
  limit: z.number().optional().default(20).describe('Max files'),
});

export const getAttachmentSchema = z.object({
  url: z.string().describe('Attachment URL from message metadata'),
});

export async function handleUploadFile(
  client: SlackClient,
  params: z.infer<typeof uploadFileSchema>
): Promise<string> {
  const result = await withRateLimit('files.uploadV2', () =>
    client.web.files.uploadV2({
      channel_id: params.channels.split(',')[0].trim(),
      content: params.content ?? '',
      filename: params.filename,
      title: params.title || params.filename,
    })
  );

  const file = (result as unknown as Record<string, Record<string, unknown>>).file;
  const fileId = file?.id || 'unknown';
  return `File uploaded: ${params.filename} (${fileId})`;
}

export async function handleListFiles(
  client: SlackClient,
  params: z.infer<typeof listFilesSchema>
): Promise<string> {
  const result = await withRateLimit('files.list', () =>
    client.web.files.list({
      channel: params.channel,
      types: params.types,
      count: params.limit,
    })
  );

  const files = (result.files || []) as Record<string, unknown>[];
  if (files.length === 0) return 'No files found.';

  const formatted = files
    .map((f) => {
      const name = f.name as string;
      const id = f.id as string;
      const type = f.filetype as string;
      const size = f.size as number;
      const created = f.created as number;
      const date = new Date(created * 1000).toISOString().split('T')[0];
      return `${name} (${id}) — ${type}, ${Math.round(size / 1024)}KB, ${date}`;
    })
    .join('\n');

  return `Files (${files.length}):\n${formatted}`;
}

export async function handleGetAttachment(
  client: SlackClient,
  params: z.infer<typeof getAttachmentSchema>
): Promise<string> {
  // Validate URL is a Slack file URL (SSRF protection)
  const url = new URL(params.url);
  if (!url.hostname.endsWith('slack.com') && !url.hostname.endsWith('slack-gov.com')) {
    return 'Error: URL must be a Slack file URL (*.slack.com or *.slack-gov.com)';
  }

  // Use the web client's token for auth
  const response = await fetch(params.url, {
    headers: {
      Authorization: `Bearer ${(client.web as unknown as Record<string, string>).token}`,
    },
  });

  if (!response.ok) {
    return `Error fetching attachment: ${response.status} ${response.statusText}`;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.startsWith('text/') || contentType.includes('json')) {
    const text = await response.text();
    return `Attachment content (${contentType}):\n${text.slice(0, 10000)}`;
  }

  return `Binary attachment (${contentType}, ${response.headers.get('content-length') || 'unknown'} bytes). Use the download URL directly.`;
}
