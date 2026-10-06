import { describe, expect, it } from 'vitest';
import { TestData } from '../test/TestData';
import { collectKnownLabels, normalizeLabels } from './labels';

describe('labels', () => {
  describe('normalizeLabels', () => {
    it('removes blank labels', () => {
      expect(normalizeLabels(['work', '', '  ', 'personal'])).toEqual(['work', 'personal']);
    });

    it('trims whitespace', () => {
      expect(normalizeLabels(['  work  ', 'personal '])).toEqual(['work', 'personal']);
    });

    it('deduplicates case-insensitively, keeping first casing', () => {
      expect(normalizeLabels(['Work', 'work', 'WORK'])).toEqual(['Work']);
      expect(normalizeLabels(['Work', 'WORK', 'work'])).toEqual(['Work']);
    });

    it('handles empty array', () => {
      expect(normalizeLabels([])).toEqual([]);
    });

    it('handles non-array input', () => {
      expect(normalizeLabels(null as any)).toEqual([]);
      expect(normalizeLabels(undefined as any)).toEqual([]);
    });

    it('preserves order of first occurrence', () => {
      expect(normalizeLabels(['z', 'a', 'Z', 'm'])).toEqual(['z', 'a', 'm']);
    });
  });

  describe('collectKnownLabels', () => {
    it('collects all unique labels from tasks', () => {
      const t1 = TestData.createTestTask({labels: ['work', 'urgent']});
      const t2 = TestData.createTestTask({labels: ['personal', 'work']});

      const result = collectKnownLabels([t1, t2]);
      expect(result).toContain('work');
      expect(result).toContain('urgent');
      expect(result).toContain('personal');
    });

    it('deduplicates case-insensitively, preserving first casing', () => {
      const t1 = TestData.createTestTask({labels: ['Work']});
      const t2 = TestData.createTestTask({labels: ['work', 'WORK']});

      const result = collectKnownLabels([t1, t2]);
      expect(result).toEqual(['Work']);
    });

    it('sorts case-insensitively', () => {
      const t1 = TestData.createTestTask({labels: ['Zebra', 'apple', 'Mango']});

      const result = collectKnownLabels([t1]);
      expect(result).toEqual(['apple', 'Mango', 'Zebra']);
    });

    it('handles tasks without labels', () => {
      const t1 = TestData.createTestTask({labels: ['work']});
      const t2 = TestData.createTestTask({labels: []});

      const result = collectKnownLabels([t1, t2]);
      expect(result).toEqual(['work']);
    });

    it('handles empty task list', () => {
      expect(collectKnownLabels([])).toEqual([]);
    });

    it('handles tasks with undefined labels gracefully', () => {
      const tasks = [
        TestData.createTestTask({labels: ['work']}),
        {...TestData.createTestTask(), labels: undefined} as any,
      ];

      const result = collectKnownLabels(tasks);
      expect(result).toEqual(['work']);
    });
  });
});
