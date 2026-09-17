import { describe, it, expect } from 'vitest';
import { formatDateRange } from './format';

describe('formatDateRange', () => {
  it('shows a month/year span', () => {
    expect(formatDateRange('2025-01-01', '2025-08-01')).toBe('Jan 2025 – Aug 2025');
  });

  it('shows a span across years', () => {
    expect(formatDateRange('2024-09-01', '2025-04-01')).toBe('Sep 2024 – Apr 2025');
  });

  it('shows an open span to Present when there is no end date', () => {
    expect(formatDateRange('2025-06-01')).toBe('Jun 2025 – Present');
  });
});
