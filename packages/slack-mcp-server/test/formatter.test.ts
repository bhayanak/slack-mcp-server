import { describe, it, expect } from 'vitest';
import {
  formatMessage,
  formatChannel,
  formatUser,
  formatUserGroup,
} from '../src/utils/formatter.js';

describe('formatMessage', () => {
  it('should format a basic message', () => {
    const msg = { user: 'U123', text: 'Hello world', ts: '1234567890.123456' };
    const result = formatMessage(msg);
    expect(result).toBe('[1234567890.123456] <U123>: Hello world');
  });

  it('should show thread reference', () => {
    const msg = {
      user: 'U123',
      text: 'Reply',
      ts: '1234567890.200000',
      thread_ts: '1234567890.100000',
    };
    const result = formatMessage(msg);
    expect(result).toContain('(thread: 1234567890.100000)');
  });

  it('should show reactions', () => {
    const msg = {
      user: 'U123',
      text: 'Nice!',
      ts: '1234567890.123456',
      reactions: [
        { name: 'thumbsup', count: 3 },
        { name: 'heart', count: 1 },
      ],
    };
    const result = formatMessage(msg);
    expect(result).toContain(':thumbsup: (3)');
    expect(result).toContain(':heart: (1)');
  });

  it('should handle missing fields gracefully', () => {
    const msg = { ts: '123' };
    const result = formatMessage(msg);
    expect(result).toBe('[123] <unknown>: ');
  });
});

describe('formatChannel', () => {
  it('should format a channel', () => {
    const ch = {
      id: 'C123',
      name: 'general',
      topic: { value: 'General discussion' },
      purpose: { value: 'Company-wide' },
      num_members: 42,
    };
    const result = formatChannel(ch);
    expect(result).toContain('#general (C123)');
    expect(result).toContain('Topic: General discussion');
    expect(result).toContain('Purpose: Company-wide');
    expect(result).toContain('Members: 42');
  });
});

describe('formatUser', () => {
  it('should format a user', () => {
    const user = {
      id: 'U123',
      name: 'jdoe',
      real_name: 'John Doe',
      profile: {
        real_name: 'John Doe',
        display_name: 'Johnny',
        email: 'jdoe@example.com',
      },
    };
    const result = formatUser(user);
    expect(result).toContain('@jdoe (U123)');
    expect(result).toContain('John Doe');
    expect(result).toContain('[Johnny]');
    expect(result).toContain('<jdoe@example.com>');
  });
});

describe('formatUserGroup', () => {
  it('should format a user group', () => {
    const ug = {
      id: 'S123',
      name: 'Engineering',
      handle: 'engineering',
      description: 'Engineering team',
      user_count: 15,
    };
    const result = formatUserGroup(ug);
    expect(result).toContain('@engineering');
    expect(result).toContain('Engineering');
    expect(result).toContain('(S123)');
    expect(result).toContain('Members: 15');
  });
});
