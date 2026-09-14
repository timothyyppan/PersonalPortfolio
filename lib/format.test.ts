import { describe, it, expect } from 'vitest';
import { formatPlayed } from './format';

describe('formatPlayed', () => {
  it('shows a single year when start and end share one', () => {
    expect(formatPlayed('2025-01-01', '2025-08-01', 'complete')).toBe('2025');
  });

  it('shows an abbreviated span across years', () => {
    expect(formatPlayed('2024-09-01', '2025-04-01', 'complete')).toBe('2024–25');
  });

  it('shows the start year alone when complete with no end date', () => {
    expect(formatPlayed('2024-05-01', undefined, 'complete')).toBe('2024');
  });

  it('shows an open span when in progress', () => {
    expect(formatPlayed('2025-06-01', undefined, 'in-progress')).toBe('2025–');
  });

  it('shows an open span when in progress even if a stale end date is set', () => {
    expect(formatPlayed('2025-06-01', '2025-12-01', 'in-progress')).toBe('2025–');
  });
});
