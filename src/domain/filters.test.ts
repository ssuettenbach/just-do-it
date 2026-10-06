import { describe, expect, it } from 'vitest';
import { TestData } from '../test/TestData';
import {
  DEFAULT_HISTORY_FILTERS,
  DEFAULT_OPEN_FILTERS,
  filterHistory,
  hasActiveHistoryFilters,
  hasActiveOpenFilters,
} from './filters';

describe('filters', () => {
  describe('defaults', () => {
    it('DEFAULT_OPEN_FILTERS has all fields empty/default', () => {
      expect(DEFAULT_OPEN_FILTERS).toEqual({
        text: '',
        label: null,
        duration: 'all',
        due: 'all',
      });
    });

    it('DEFAULT_HISTORY_FILTERS has all fields empty/null', () => {
      expect(DEFAULT_HISTORY_FILTERS).toEqual({
        text: '',
        label: null,
        completedFrom: null,
        completedTo: null,
      });
    });
  });

  describe('hasActiveOpenFilters', () => {
    it('returns false for default filters', () => {
      expect(hasActiveOpenFilters(DEFAULT_OPEN_FILTERS)).toBe(false);
    });

    it('returns true when text is set', () => {
      expect(hasActiveOpenFilters({...DEFAULT_OPEN_FILTERS, text: 'urgent'})).toBe(true);
    });

    it('returns true when label is set', () => {
      expect(hasActiveOpenFilters({...DEFAULT_OPEN_FILTERS, label: 'work'})).toBe(true);
    });

    it('returns true when duration is not "all"', () => {
      expect(hasActiveOpenFilters({...DEFAULT_OPEN_FILTERS, duration: 'quick'})).toBe(true);
    });

    it('returns true when due is not "all"', () => {
      expect(hasActiveOpenFilters({...DEFAULT_OPEN_FILTERS, due: 'overdue'})).toBe(true);
    });
  });

  describe('hasActiveHistoryFilters', () => {
    it('returns false for default filters', () => {
      expect(hasActiveHistoryFilters(DEFAULT_HISTORY_FILTERS)).toBe(false);
    });

    it('returns true when text is set', () => {
      expect(hasActiveHistoryFilters({...DEFAULT_HISTORY_FILTERS, text: 'done'})).toBe(true);
    });

    it('returns true when label is set', () => {
      expect(hasActiveHistoryFilters({...DEFAULT_HISTORY_FILTERS, label: 'work'})).toBe(true);
    });

    it('returns true when completedFrom is set', () => {
      expect(hasActiveHistoryFilters({...DEFAULT_HISTORY_FILTERS, completedFrom: '2026-10-01'})).toBe(true);
    });

    it('returns true when completedTo is set', () => {
      expect(hasActiveHistoryFilters({...DEFAULT_HISTORY_FILTERS, completedTo: '2026-10-05'})).toBe(true);
    });
  });

  describe('filterHistory', () => {
    it('returns only completed tasks', () => {
      const open = TestData.createTestTask({status: 'open'});
      const completed = TestData.createTestTask({status: 'completed'});

      const result = filterHistory([open, completed], DEFAULT_HISTORY_FILTERS);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(completed.id);
    });

    it('filters by text case-insensitively', () => {
      const t1 = TestData.createTestTask({title: 'Finished Report', status: 'completed'});
      const t2 = TestData.createTestTask({title: 'Pending Task', status: 'completed'});

      const result = filterHistory([t1, t2], {...DEFAULT_HISTORY_FILTERS, text: 'report'});
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('filters by label case-insensitively', () => {
      const t1 = TestData.createTestTask({labels: ['Work'], status: 'completed'});
      const t2 = TestData.createTestTask({labels: ['Personal'], status: 'completed'});

      const result = filterHistory([t1, t2], {...DEFAULT_HISTORY_FILTERS, label: 'work'});
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('filters by completedFrom date (inclusive)', () => {
      const t1 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-04T10:00:00.000Z',
      });
      const t2 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-06T10:00:00.000Z',
      });

      const result = filterHistory([t1, t2], {...DEFAULT_HISTORY_FILTERS, completedFrom: '2026-10-05'});
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t2.id);
    });

    it('filters by completedTo date (inclusive)', () => {
      const t1 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-04T10:00:00.000Z',
      });
      const t2 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-06T10:00:00.000Z',
      });

      const result = filterHistory([t1, t2], {...DEFAULT_HISTORY_FILTERS, completedTo: '2026-10-05'});
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('sorts by completedAt descending', () => {
      const t1 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-04T10:00:00.000Z',
      });
      const t2 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-06T10:00:00.000Z',
      });
      const t3 = TestData.createTestTask({
        status: 'completed',
        completedAt: '2026-10-05T10:00:00.000Z',
      });

      const result = filterHistory([t1, t2, t3], DEFAULT_HISTORY_FILTERS);
      expect(result.map((t) => t.completedAt)).toEqual([
        '2026-10-06T10:00:00.000Z',
        '2026-10-05T10:00:00.000Z',
        '2026-10-04T10:00:00.000Z',
      ]);
    });
  });
});
