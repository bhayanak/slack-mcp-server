import type { WebClient } from '@slack/web-api';

export interface PaginationOptions {
  limit?: number;
  cursor?: string;
}

export async function paginateAll<T>(
  fetchPage: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string }>,
  maxItems: number
): Promise<T[]> {
  const results: T[] = [];
  let cursor: string | undefined;

  while (results.length < maxItems) {
    const page = await fetchPage(cursor);
    results.push(...page.items);
    if (!page.nextCursor || page.nextCursor === '') break;
    cursor = page.nextCursor;
  }

  return results.slice(0, maxItems);
}

export async function fetchChannelHistory(
  client: WebClient,
  channel: string,
  options: { limit?: number; oldest?: string; latest?: string; cursor?: string }
): Promise<{ messages: Record<string, unknown>[]; nextCursor?: string }> {
  const response = await client.conversations.history({
    channel,
    limit: options.limit ?? 100,
    oldest: options.oldest,
    latest: options.latest,
    cursor: options.cursor,
  });

  return {
    messages: (response.messages as Record<string, unknown>[]) || [],
    nextCursor: (response.response_metadata as Record<string, string>)?.next_cursor,
  };
}
