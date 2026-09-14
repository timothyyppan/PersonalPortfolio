import { describe, it, expect, vi, afterEach } from 'vitest';
import { isAdminEnabled } from './devGuard';

describe('isAdminEnabled', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns true in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isAdminEnabled()).toBe(true);
  });

  it('returns false in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(isAdminEnabled()).toBe(false);
  });
});
