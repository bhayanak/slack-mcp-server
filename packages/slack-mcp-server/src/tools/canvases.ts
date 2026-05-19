import { z } from 'zod';
import type { SlackClient } from '../client/slack-client.js';
import { withRateLimit } from '../utils/rate-limit.js';

export const createCanvasSchema = z.object({
  title: z.string().describe('Canvas title'),
  content: z.string().describe('Markdown canvas content'),
  channelId: z.string().optional().describe('Channel to share canvas to'),
});

export const updateCanvasSchema = z.object({
  canvasId: z.string().describe('Canvas ID'),
  content: z.string().describe('Updated markdown content'),
});

export const readCanvasSchema = z.object({
  canvasId: z.string().describe('Canvas ID'),
});

export async function handleCreateCanvas(
  client: SlackClient,
  params: z.infer<typeof createCanvasSchema>
): Promise<string> {
  const result = await withRateLimit('canvases.create', () =>
    (client.getUserClient() as unknown as Record<string, CallableFunction>).apiCall(
      'canvases.create',
      {
        title: params.title,
        document_content: {
          type: 'markdown',
          markdown: params.content,
        },
      }
    )
  );

  const canvasId = (result as Record<string, unknown>).canvas_id as string;

  if (params.channelId && canvasId) {
    await withRateLimit('conversations.canvases.create', () =>
      (client.getUserClient() as unknown as Record<string, CallableFunction>).apiCall(
        'conversations.canvases.create',
        {
          channel_id: params.channelId,
          canvas_id: canvasId,
        }
      )
    );
  }

  return `Canvas created: ${params.title} (${canvasId || 'unknown'})`;
}

export async function handleUpdateCanvas(
  client: SlackClient,
  params: z.infer<typeof updateCanvasSchema>
): Promise<string> {
  await withRateLimit('canvases.edit', () =>
    (client.getUserClient() as unknown as Record<string, CallableFunction>).apiCall(
      'canvases.edit',
      {
        canvas_id: params.canvasId,
        changes: [
          {
            operation: 'replace',
            document_content: {
              type: 'markdown',
              markdown: params.content,
            },
          },
        ],
      }
    )
  );

  return `Canvas ${params.canvasId} updated.`;
}

export async function handleReadCanvas(
  client: SlackClient,
  params: z.infer<typeof readCanvasSchema>
): Promise<string> {
  const result = await withRateLimit('canvases.access', () =>
    (client.getUserClient() as unknown as Record<string, CallableFunction>).apiCall(
      'canvases.access',
      {
        canvas_id: params.canvasId,
      }
    )
  );

  const content = (result as Record<string, unknown>).content as string;
  return content || `Canvas ${params.canvasId} content retrieved (empty or format not available).`;
}
