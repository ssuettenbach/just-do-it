import { describe, it, expect } from 'vitest';
import {
  DEFAULT_OPEN_FILTERS,
  DEFAULT_HISTORY_FILTERS,
  filterOpenTasks,
  filterHistory,
  hasActiveOpenFilters,
  hasActiveHistoryFilters,
} from './filters';
import { TestData } from '../test/TestData';

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
      expect(hasActiveOpenFilters({ ...DEFAULT_OPEN_FILTERS, text: 'urgent' })).toBe(true);
    });

    it('returns true when label is set', () => {
      expect(hasActiveOpenFilters({ ...DEFAULT_OPEN_FILTERS, label: 'work' })).toBe(true);
    });

    it('returns true when duration is not "all"', () => {
      expect(hasActiveOpenFilters({ ...DEFAULT_OPEN_FILTERS, duration: 'quick' })).toBe(true);
    });

    it('returns true when due is not "all"', () => {
      expect(hasActiveOpenFilters({ ...DEFAULT_OPEN_FILTERS, due: 'overdue' })).toBe(true);
    });
  });

  describe('hasActiveHistoryFilters', () => {
    it('returns false for default filters', () => {
      expect(hasActiveHistoryFilters(DEFAULT_HISTORY_FILTERS)).toBe(false);
    });

    it('returns true when text is set', () => {
      expect(hasActiveHistoryFilters({ ...DEFAULT_HISTORY_FILTERS, text: 'done' })).toBe(true);
    });

    it('returns true when label is set', () => {
      expect(hasActiveHistoryFilters({ ...DEFAULT_HISTORY_FILTERS, label: 'work' })).toBe(true);
    });

    it('returns true when completedFrom is set', () => {
      expect(hasActiveHistoryFilters({ ...DEFAULT_HISTORY_FILTERS, completedFrom: '2026-10-01' })).toBe(true);
    });

    it('returns true when completedTo is set', () => {
      expect(hasActiveHistoryFilters({ ...DEFAULT_HISTORY_FILTERS, completedTo: '2026-10-05' })).toBe(true);
    });
  });

  describe('filterOpenTasks', () => {
    it('returns only open tasks', () => {
      const open = TestData.createTestTask({ status: 'open' });
      const completed = TestData.createTestTask({ status: 'completed' });

      const result = filterOpenTasks([open, completed], DEFAULT_OPEN_FILTERS);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(open.id);
    });

    it('filters by text case-insensitively', () => {
      const t1 = TestData.createTestTask({ title: 'Buy Groceries', status: 'open' });
      const t2 = TestData.createTestTask({ title: 'Write Report', status: 'open' });

      const result = filterOpenTasks([t1, t2], { ...DEFAULT_OPEN_FILTERS, text: 'grocery' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('matches text in title, notes, and labels', () => {
      const t1 = TestData.createTestTask({ title: 'Task', notes: 'urgent project', status: 'open' });
      const t2 = TestData.createTestTask({ title: 'Task', labels: ['Project'], status: 'open' });
      const t3 = TestData.createTestTask({ title: 'Task', status: 'open' });

      const result = filterOpenTasks([t1, t2, t3], { ...DEFAULT_OPEN_FILTERS, text: 'project' });
      expect(result).toHaveLength(2);
    });

    it('filters by label case-insensitively', () => {
      const t1 = TestData.createTestTask({ labels: ['Work'], status: 'open' });
      const t2 = TestData.createTestTask({ labels: ['Personal'], status: 'open' });

      const result = filterOpenTasks([t1, t2], { ...DEFAULT_OPEN_FILTERS, label: 'work' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('filters by duration: quick (0-5)', () => {
      const quick = TestData.createTestTask({ estimateMinutes: 5, status: 'open' });
      const medium = TestData.createTestTask({ estimateMinutes: 15, status: 'open' });
      const big = TestData.createTestTask({ estimateMinutes: 45, status: 'open' });

      const result = filterOpenTasks([quick, medium, big], { ...DEFAULT_OPEN_FILTERS, duration: 'quick' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(quick.id);
    });

    it('filters by duration: medium (6-29)', () => {
      const quick = TestData.createTestTask({ estimateMinutes: 5, status: 'open' });
      const medium = TestData.createTestTask({ estimateMinutes: 15, status: 'open' });
      const big = TestData.createTestTask({ estimateMinutes: 45, status: 'open' });

      const result = filterOpenTasks([quick, medium, big], { ...DEFAULT_OPEN_FILTERS, duration: 'medium' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(medium.id);
    });

    it('filters by duration: big (30+)', () => {
      const quick = TestData.createTestTask({ estimateMinutes: 5, status: 'open' });
      const medium = TestData.createTestTask({ estimateMinutes: 15, status: 'open' });
      const big = TestData.createTestTask({ estimateMinutes: 45, status: 'open' });

      const result = filterOpenTasks([quick, medium, big], { ...DEFAULT_OPEN_FILTERS, duration: 'big' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(big.id);
    });

    it('filters by duration: unestimated', () => {
      const estimated = TestData.createTestTask({ estimateMinutes: 10, status: 'open' });
      const unestimated = TestData.createTestTask({ estimateMinutes: null, status: 'open' });

      const result = filterOpenTasks([estimated, unestimated], { ...DEFAULT_OPEN_FILTERS, duration: 'unestimated' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(unestimated.id);
    });

    it('sorts overdue first, then today, then upcoming, then none', () => {
      const overdue = TestData.createTestTask({ dueDate: '2026-10-03', status: 'open' });
      const today = TestData.createTestTask({ dueDate: '2026-10-05', status: 'open' });
      const upcoming = TestData.createTestTask({ dueDate: '2026-10-10', status: 'open' });
      const none = TestData.createTestTask({ dueDate: null, status: 'open' });

      const result = filterOpenTasks([none, upcoming, today, overdue], DEFAULT_OPEN_FILTERS, '2026-10-05');
      expect(result.map((t) => t.dueDate)).toEqual(['2026-10-03', '2026-10-05', '2026-10-10', null]);
    });

    it('sorts by dueDate ascending within same due status', () => {
      const t1 = TestData.createTestTask({ dueDate: '2026-10-10', status: 'open' });
      const t2 = TestData.createTestTask({ dueDate: '2026-10-08', status: 'open' });
      const t3 = TestData.createTestTask({ dueDate: '2026-10-12', status: 'open' });

      const result = filterOpenTasks([t1, t2, t3], DEFAULT_OPEN_FILTERS);
      expect(result.map((t) => t.dueDate)).toEqual(['2026-10-08', '2026-10-10', '2026-10-12']);
    });

    it('sorts by createdAt descending for tasks with same dueDate', () => {
      const old = TestData.createTestTask({ dueDate: '2026-10-10', createdAt: '2026-10-01T00:00:00Z', status: 'open' });
      const new_task = TestData.createTestTask({ dueDate: '2026-10-10', createdAt: '2026-10-04T00:00:00Z', status: 'open' });

      const result = filterOpenTasks([old, new_task], DEFAULT_OPEN_FILTERS);
      expect(result[0].id).toBe(new_task.id);
      expect(result[1].id).toBe(old.id);
    });

    it('filters by due status', () => {
      const overdue = TestData.createTestTask({ dueDate: '2026-10-03', status: 'open' });
      const today = TestData.createTestTask({ dueDate: '2026-10-05', status: 'open' });
      const upcoming = TestData.createTestTask({ dueDate: '2026-10-10', status: 'open' });
      const none = TestData.createTestTask({ dueDate: null, status: 'open' });

      const result = filterOpenTasks([overdue, today, upcoming, none], { ...DEFAULT_OPEN_FILTERS, due: 'overdue' }, '2026-10-05');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(overdue.id);
    });
  });

  describe('filterHistory', () => {
    it('returns only completed tasks', () => {
      const open = TestData.createTestTask({ status: 'open' });
      const completed = TestData.createTestTask({ status: 'completed' });

      const result = filterHistory([open, completed], DEFAULT_HISTORY_FILTERS);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(completed.id);
    });

    it('filters by text case-insensitively', () => {
      const t1 = TestData.createTestTask({ title: 'Finished Report', status: 'completed' });
      const t2 = TestData.createTestTask({ title: 'Pending Task', status: 'completed' });

      const result = filterHistory([t1, t2], { ...DEFAULT_HISTORY_FILTERS, text: 'report' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('filters by label case-insensitively', () => {
      const t1 = TestData.createTestTask({ labels: ['Work'], status: 'completed' });
      const t2 = TestData.createTestTask({ labels: ['Personal'], status: 'completed' });

      const result = filterHistory([t1, t2], { ...DEFAULT_HISTORY_FILTERS, label: 'work' });
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

      const result = filterHistory([t1, t2], { ...DEFAULT_HISTORY_FILTERS, completedFrom: '2026-10-05' });
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

      const result = filterHistory([t1, t2], { ...DEFAULT_HISTORY_FILTERS, completedTo: '2026-10-05' });
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
