import { describe, expect, it } from 'vitest';
import { getDueStatus, isValidDateOnly, isValidIsoTimestamp, todayLocal, toLocalDate } from '../domain/dates';

describe('dates', () => {
  describe('todayLocal', () => {
    it('returns YYYY-MM-DD format for current date', () => {
      const now = new Date('2026-10-05T14:30:00Z');
      const result = todayLocal(now);
      expect(result).toBe('2026-10-05');
    });

    it('pads month and day with zeros', () => {
      const now = new Date('2026-01-02T00:00:00Z');
      const result = todayLocal(now);
      expect(result).toBe('2026-01-02');
    });
  });

  describe('isValidDateOnly', () => {
    it('accepts valid YYYY-MM-DD', () => {
      expect(isValidDateOnly('2026-10-05')).toBe(true);
    });

    it('rejects invalid format', () => {
      expect(isValidDateOnly('10/05/2026')).toBe(false);
      expect(isValidDateOnly('2026-10-5')).toBe(false);
      expect(isValidDateOnly('2026-13-01')).toBe(false);
    });

    it('rejects invalid calendar dates', () => {
      expect(isValidDateOnly('2026-02-30')).toBe(false);
      expect(isValidDateOnly('2026-13-01')).toBe(false);
      expect(isValidDateOnly('2026-00-01')).toBe(false);
    });

    it('rejects non-string input', () => {
      expect(isValidDateOnly(null as any)).toBe(false);
      expect(isValidDateOnly(undefined as any)).toBe(false);
      expect(isValidDateOnly(123 as any)).toBe(false);
    });

    it('accepts leap year dates', () => {
      expect(isValidDateOnly('2024-02-29')).toBe(true);
      expect(isValidDateOnly('2023-02-29')).toBe(false);
    });
  });

  describe('isValidIsoTimestamp', () => {
    it('accepts valid ISO 8601 timestamp', () => {
      expect(isValidIsoTimestamp('2026-10-05T14:30:00.000Z')).toBe(true);
    });

    it('rejects invalid ISO format', () => {
      expect(isValidIsoTimestamp('2026-10-05 14:30:00')).toBe(false);
      expect(isValidIsoTimestamp('not-a-date')).toBe(false);
    });

    it('rejects non-string input', () => {
      expect(isValidIsoTimestamp(null as any)).toBe(false);
      expect(isValidIsoTimestamp(undefined as any)).toBe(false);
    });
  });

  describe('toLocalDate', () => {
    it('converts ISO timestamp to local YYYY-MM-DD', () => {
      const iso = new Date('2026-10-05T14:30:00Z').toISOString();
      const result = toLocalDate(iso);
      expect(result).toBe('2026-10-05');
    });

    it('throws on invalid ISO timestamp', () => {
      expect(() => toLocalDate('invalid')).toThrow();
    });
  });

  describe('getDueStatus', () => {
    it('returns "none" for null dueDate', () => {
      expect(getDueStatus(null)).toBe('none');
    });

    it('returns "overdue" when dueDate < today', () => {
      expect(getDueStatus('2026-10-04', '2026-10-05')).toBe('overdue');
    });

    it('returns "today" when dueDate === today', () => {
      expect(getDueStatus('2026-10-05', '2026-10-05')).toBe('today');
    });

    it('returns "upcoming" when dueDate > today', () => {
      expect(getDueStatus('2026-10-06', '2026-10-05')).toBe('upcoming');
    });

    it('uses current date when today not provided', () => {
      const now = new Date();
      const today = todayLocal(now);
      const result = getDueStatus(today);
      expect(result).toBe('today');
    });
  });
});
