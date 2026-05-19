import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRateLimit } from '../src/utils/rate-limit.js';

describe('withRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should call the function and return result', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRateLimit('test.method', fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should retry on rate limit error', async () => {
    const rateLimitError = { code: 'slack_webapi_rate_limited', retryAfter: 1 };
    const fn = vi
      .fn()
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce('success after retry');

    const promise = withRateLimit('test.method', fn, 3);
    await vi.advanceTimersByTimeAsync(1500);
    const result = await promise;

    expect(result).toBe('success after retry');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries', async () => {
    vi.useRealTimers();
    const rateLimitError = { code: 'slack_webapi_rate_limited', retryAfter: 0 };
    const fn = vi.fn().mockRejectedValue(rateLimitError);

    await expect(withRateLimit('test.exhaust', fn, 2)).rejects.toEqual(rateLimitError);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw non-rate-limit errors immediately', async () => {
    const error = new Error('Network error');
    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRateLimit('test.net', fn)).rejects.toThrow('Network error');
    expect(fn).toHaveBeenCalledOnce();
  });
});
