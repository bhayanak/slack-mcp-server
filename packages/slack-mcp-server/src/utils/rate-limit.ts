const retryAfterMap = new Map<string, number>();

export async function withRateLimit<T>(
  method: string,
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const retryAfter = retryAfterMap.get(method);
    if (retryAfter && Date.now() < retryAfter) {
      const waitMs = retryAfter - Date.now();
      await sleep(waitMs);
    }

    try {
      const result = await fn();
      retryAfterMap.delete(method);
      return result;
    } catch (error: unknown) {
      if (isRateLimitError(error) && attempt < maxRetries) {
        const waitSec = getRateLimitDelay(error);
        retryAfterMap.set(method, Date.now() + waitSec * 1000);
        await sleep(waitSec * 1000);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Rate limit exceeded for ${method} after ${maxRetries} retries`);
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    return e.code === 'slack_webapi_rate_limited' || e.statusCode === 429;
  }
  return false;
}

function getRateLimitDelay(error: unknown): number {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const retryAfter =
      e.retryAfter ?? (e.headers as Record<string, unknown> | undefined)?.['retry-after'];
    if (typeof retryAfter === 'number') return retryAfter;
    if (typeof retryAfter === 'string') return parseInt(retryAfter, 10) || 5;
  }
  return 5;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
