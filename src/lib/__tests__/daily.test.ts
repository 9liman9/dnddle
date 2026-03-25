import { describe, it, expect } from 'vitest';
import { getDailyMonsterIndex, getDailyNumber, getDateString } from '../daily';

describe('getDailyMonsterIndex', () => {
  it('returns same index for same date', () => {
    const date = new Date('2026-04-01');
    const idx1 = getDailyMonsterIndex(100, date);
    const idx2 = getDailyMonsterIndex(100, date);
    expect(idx1).toBe(idx2);
  });

  it('returns different index for different dates', () => {
    const date1 = new Date('2026-04-01');
    const date2 = new Date('2026-04-02');
    const idx1 = getDailyMonsterIndex(100, date1);
    const idx2 = getDailyMonsterIndex(100, date2);
    expect(idx1).not.toBe(idx2);
  });

  it('returns index within bounds', () => {
    for (let i = 0; i < 100; i++) {
      const date = new Date(`2026-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`);
      const idx = getDailyMonsterIndex(2000, date);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(2000);
    }
  });
});

describe('getDailyNumber', () => {
  it('returns 1 on launch date', () => {
    const num = getDailyNumber(new Date('2026-03-25'));
    expect(num).toBe(1);
  });

  it('increments by 1 each day', () => {
    const num1 = getDailyNumber(new Date('2026-03-26'));
    const num2 = getDailyNumber(new Date('2026-03-27'));
    expect(num2 - num1).toBe(1);
  });
});

describe('getDateString', () => {
  it('returns ISO date string', () => {
    const result = getDateString(new Date('2026-03-25T15:30:00Z'));
    expect(result).toBe('2026-03-25');
  });
});
