import { describe, it, expect } from 'vitest';
import { SwrCache, parseDuration } from '../src/cache/swr-cache.js';

describe('parseDuration', () => {
  it('should parse milliseconds', () => {
    expect(parseDuration('500ms')).toBe(500);
  });

  it('should parse seconds', () => {
    expect(parseDuration('30s')).toBe(30000);
  });

  it('should parse minutes', () => {
    expect(parseDuration('5m')).toBe(300000);
  });

  it('should parse hours', () => {
    expect(parseDuration('24h')).toBe(86400000);
  });

  it('should parse days', () => {
    expect(parseDuration('7d')).toBe(604800000);
  });

  it('should default to seconds for plain numbers', () => {
    expect(parseDuration('3600')).toBe(3600000);
  });

  it('should return 24h for invalid input', () => {
    expect(parseDuration('invalid')).toBe(86400000);
  });
});

describe('SwrCache', () => {
  it('should store and retrieve values', () => {
    const cache = new SwrCache<string>('1h', '30s');
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    const cache = new SwrCache<string>('1h', '30s');
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should report stale for missing keys', () => {
    const cache = new SwrCache<string>('1h', '30s');
    expect(cache.isStale('nonexistent')).toBe(true);
  });

  it('should not be stale immediately after set', () => {
    const cache = new SwrCache<string>('1h', '30s');
    cache.set('key', 'val');
    expect(cache.isStale('key')).toBe(false);
  });

  it('should track refreshing state', () => {
    const cache = new SwrCache<string>('1h', '30s');
    expect(cache.isRefreshing('key')).toBe(false);
    cache.markRefreshing('key');
    expect(cache.isRefreshing('key')).toBe(true);
    cache.clearRefreshing('key');
    expect(cache.isRefreshing('key')).toBe(false);
  });

  it('should clear all entries', () => {
    const cache = new SwrCache<string>('1h', '30s');
    cache.set('key1', 'val1');
    cache.set('key2', 'val2');
    cache.markRefreshing('key1');
    cache.clear();
    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
    expect(cache.isRefreshing('key1')).toBe(false);
  });
});
