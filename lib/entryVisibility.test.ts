import { afterEach, describe, expect, it } from 'vitest';
import { canShowEntryContent } from './entryVisibility';

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe('canShowEntryContent', () => {
  it('shows completed entries in production', () => {
    process.env.NODE_ENV = 'production';
    expect(canShowEntryContent('complete')).toBe(true);
  });

  it('hides in-progress entries outside development', () => {
    process.env.NODE_ENV = 'production';
    expect(canShowEntryContent('in-progress')).toBe(false);
  });

  it('shows in-progress entries during local development', () => {
    process.env.NODE_ENV = 'development';
    expect(canShowEntryContent('in-progress')).toBe(true);
  });
});
