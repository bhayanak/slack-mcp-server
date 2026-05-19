export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export class SwrCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private refreshing: Set<string> = new Set();
  private ttlMs: number;
  private minRefreshMs: number;

  constructor(ttl: string, minRefresh: string) {
    this.ttlMs = parseDuration(ttl);
    this.minRefreshMs = parseDuration(minRefresh);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttlMs: this.ttlMs });
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttlMs;
  }

  isRefreshing(key: string): boolean {
    return this.refreshing.has(key);
  }

  markRefreshing(key: string): void {
    this.refreshing.add(key);
  }

  clearRefreshing(key: string): void {
    this.refreshing.delete(key);
  }

  canRefresh(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > this.minRefreshMs;
  }

  clear(): void {
    this.cache.clear();
    this.refreshing.clear();
  }
}

export function parseDuration(input: string): number {
  const match = input.match(/^(\d+)(ms|s|m|h|d)?$/);
  if (!match) return 86400000; // default 24h
  const value = parseInt(match[1], 10);
  const unit = match[2] ?? 's';
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return value * 1000;
  }
}
