import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestData } from '../test/TestData';
import { BIG_MIN_MINUTES, getCandidates, isEligible, pickRandom, QUICK_MAX_MINUTES, randomIndex } from './picker';

describe('picker', () => {
  describe('constants', () => {
    it('QUICK_MAX_MINUTES is 5', () => {
      expect(QUICK_MAX_MINUTES).toBe(5);
    });

    it('BIG_MIN_MINUTES is 30', () => {
      expect(BIG_MIN_MINUTES).toBe(30);
    });
  });

  describe('isEligible', () => {
    it('excludes completed tasks', () => {
      const task = TestData.createTestTask({status: 'completed', estimateMinutes: 3});
      expect(isEligible(task, 'quick')).toBe(false);
      expect(isEligible(task, 'any')).toBe(false);
    });

    it('quick: includes tasks with 0-5 minutes', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: 0}), 'quick')).toBe(true);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 3}), 'quick')).toBe(true);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 5}), 'quick')).toBe(true);
    });

    it('quick: excludes tasks with 6+ minutes', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: 6}), 'quick')).toBe(false);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 29}), 'quick')).toBe(false);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 30}), 'quick')).toBe(false);
    });

    it('quick: excludes null estimate', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: null}), 'quick')).toBe(false);
    });

    it('big: includes tasks with 30+ minutes', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: 30}), 'big')).toBe(true);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 120}), 'big')).toBe(true);
    });

    it('big: excludes tasks with 0-29 minutes', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: 0}), 'big')).toBe(false);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 5}), 'big')).toBe(false);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 29}), 'big')).toBe(false);
    });

    it('big: excludes null estimate', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: null}), 'big')).toBe(false);
    });

    it('any: includes all open tasks including null estimate', () => {
      expect(isEligible(TestData.createTestTask({estimateMinutes: null}), 'any')).toBe(true);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 0}), 'any')).toBe(true);
      expect(isEligible(TestData.createTestTask({estimateMinutes: 120}), 'any')).toBe(true);
    });
  });

  describe('getCandidates', () => {
    it('filters tasks by category using isEligible', () => {
      const tasks = [
        TestData.createTestTask({estimateMinutes: 3}),
        TestData.createTestTask({estimateMinutes: 15}),
        TestData.createTestTask({estimateMinutes: 45}),
      ];

      expect(getCandidates(tasks, 'quick')).toHaveLength(1);
      expect(getCandidates(tasks, 'big')).toHaveLength(1);
      expect(getCandidates(tasks, 'any')).toHaveLength(3);
    });
  });

  describe('randomIndex', () => {
    it('throws if length is 0', () => {
      expect(() => randomIndex(0)).toThrow('length must be > 0');
    });

    it('throws if length is negative', () => {
      expect(() => randomIndex(-1)).toThrow('length must be > 0');
    });

    it('returns index in valid range with rejection sampling', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');
      spy.mockImplementation(((arr: Uint32Array) => {
        arr[0] = 5;
        return arr;
      }) as any);

      const index = randomIndex(10);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(10);

      spy.mockRestore();
    });

    it('uses rejection sampling to avoid modulo bias', () => {
      const callValues = [
        new Uint32Array([0xffffffff]), // > 0xffffffff - 9, should reject
        new Uint32Array([5]), // <= 0xffffffff - 9, should accept
      ];
      let callCount = 0;

      const spy = vi.spyOn(crypto, 'getRandomValues');
      spy.mockImplementation(((arr: Uint32Array) => {
        if (callCount < callValues.length) {
          arr[0] = callValues[callCount][0];
          callCount++;
        }
        return arr;
      }) as any);

      const index = randomIndex(10);
      expect(callCount).toBe(2);
      expect(index).toBe(5);

      spy.mockRestore();
    });
  });

  describe('pickRandom', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns null for empty candidates', () => {
      expect(pickRandom([])).toBe(null);
    });

    it('returns single candidate', () => {
      const task = TestData.createTestTask();
      expect(pickRandom([task])).toBe(task);
    });

    it('selects from multiple candidates', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');
      spy.mockImplementation(((arr: Uint32Array) => {
        arr[0] = 0;
        return arr;
      }) as any);

      const task1 = TestData.createTestTask({id: 'a'});
      const task2 = TestData.createTestTask({id: 'b'});

      const result = pickRandom([task1, task2]);
      expect(result).toBe(task1);

      spy.mockRestore();
    });

    it('excludes specified id when 2+ candidates available', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');
      spy.mockImplementation(((arr: Uint32Array) => {
        arr[0] = 0;
        return arr;
      }) as any);

      const task1 = TestData.createTestTask({id: 'a'});
      const task2 = TestData.createTestTask({id: 'b'});
      const task3 = TestData.createTestTask({id: 'c'});

      const result = pickRandom([task1, task2, task3], 'a');
      expect(result?.id).not.toBe('a');

      spy.mockRestore();
    });

    it('returns excluded task if it is the only one', () => {
      const task = TestData.createTestTask({id: 'a'});
      expect(pickRandom([task], 'a')).toBe(task);
    });

    it('ignores excludeId if only 1 candidate total', () => {
      const task = TestData.createTestTask({id: 'a'});
      expect(pickRandom([task], 'a')).toBe(task);
    });

    it('maps random value to task index', () => {
      const spy = vi.spyOn(crypto, 'getRandomValues');
      spy.mockImplementation(((arr: Uint32Array) => {
        arr[0] = 100;
        return arr;
      }) as any);

      const task1 = TestData.createTestTask({id: 'a'});
      const task2 = TestData.createTestTask({id: 'b'});
      const task3 = TestData.createTestTask({id: 'c'});

      const result = pickRandom([task1, task2, task3]);
      expect(result).toBe(task2); // 100 % 3 = 1

      spy.mockRestore();
    });
  });
});
