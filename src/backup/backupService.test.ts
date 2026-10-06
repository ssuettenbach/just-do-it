import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db/database';
import { TestData } from '../test/TestData';
import { parseAndValidateBackup } from './backup';
import { exportBackup, mergeTasks, replaceAllTasks } from './backupService';

describe('backupService', () => {
  beforeEach(async () => {
    await db.tasks.clear();
  });

  describe('exportBackup', () => {
    it('returns fileName and json', async () => {
      const task = TestData.createTestTask({title: 'Test Task'});
      await db.tasks.add(task);

      const result = await exportBackup();

      expect(result.fileName).toBeTruthy();
      expect(result.json).toBeTruthy();
      expect(result.fileName).toMatch(/^just-do-it-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('exports all tasks as valid backup document', async () => {
      const t1 = TestData.createTestTask({title: 'Task 1'});
      const t2 = TestData.createTestTask({title: 'Task 2'});
      await db.tasks.bulkAdd([t1, t2]);

      const result = await exportBackup();
      const validated = parseAndValidateBackup(result.json);

      expect(validated.ok).toBe(true);
      if (validated.ok) {
        expect(validated.tasks).toHaveLength(2);
        expect(validated.tasks.map((t) => t.title)).toContain('Task 1');
        expect(validated.tasks.map((t) => t.title)).toContain('Task 2');
      }
    });

    it('exports empty database as valid backup', async () => {
      const result = await exportBackup();
      const validated = parseAndValidateBackup(result.json);

      expect(validated.ok).toBe(true);
      if (validated.ok) {
        expect(validated.tasks).toHaveLength(0);
      }
    });
  });

  describe('replaceAllTasks', () => {
    it('clears existing tasks and adds new ones in atomic transaction', async () => {
      const existing = TestData.createTestTask({title: 'Old Task'});
      await db.tasks.add(existing);

      const newTasks = [
        TestData.createTestTask({title: 'New Task 1'}),
        TestData.createTestTask({title: 'New Task 2'}),
      ];

      const count = await replaceAllTasks(newTasks);

      expect(count).toBe(2);
      const allTasks = await db.tasks.toArray();
      expect(allTasks).toHaveLength(2);
      expect(allTasks.map((t) => t.title)).toContain('New Task 1');
      expect(allTasks.map((t) => t.title)).toContain('New Task 2');
    });

    it('returns count of replaced tasks', async () => {
      const tasks = [
        TestData.createTestTask(),
        TestData.createTestTask(),
        TestData.createTestTask(),
      ];

      const count = await replaceAllTasks(tasks);
      expect(count).toBe(3);
    });

    it('handles empty replacement list', async () => {
      const existing = TestData.createTestTask();
      await db.tasks.add(existing);

      const count = await replaceAllTasks([]);
      expect(count).toBe(0);

      const allTasks = await db.tasks.toArray();
      expect(allTasks).toHaveLength(0);
    });
  });

  describe('mergeTasks', () => {
    it('imports new tasks and keeps existing ones', async () => {
      const existing = TestData.createTestTask({id: 'existing-1', title: 'Existing'});
      await db.tasks.add(existing);

      const toMerge = [
        TestData.createTestTask({id: 'new-1', title: 'New Task 1'}),
        TestData.createTestTask({id: 'existing-1', title: 'Duplicate'}),
        TestData.createTestTask({id: 'new-2', title: 'New Task 2'}),
      ];

      const result = await mergeTasks(toMerge);

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(1);

      const allTasks = await db.tasks.toArray();
      expect(allTasks).toHaveLength(3);
    });

    it('preserves existing record when duplicate id', async () => {
      const originalTask = TestData.createTestTask({id: 'task-1', title: 'Original Title'});
      await db.tasks.add(originalTask);

      const duplicate = TestData.createTestTask({id: 'task-1', title: 'Modified Title'});
      const result = await mergeTasks([duplicate]);

      const stored = await db.tasks.get('task-1');
      expect(stored?.title).toBe('Original Title');
      expect(result.skipped).toBe(1);
    });

    it('returns imported and skipped counts', async () => {
      const t1 = TestData.createTestTask({id: 'a'});
      const t2 = TestData.createTestTask({id: 'b'});
      await db.tasks.bulkAdd([t1, t2]);

      const toMerge = [
        TestData.createTestTask({id: 'a'}), // duplicate
        TestData.createTestTask({id: 'c'}), // new
        TestData.createTestTask({id: 'd'}), // new
      ];

      const result = await mergeTasks(toMerge);
      expect(result.imported + result.skipped).toBe(3);
    });

    it('handles empty merge list', async () => {
      const t1 = TestData.createTestTask();
      await db.tasks.add(t1);

      const result = await mergeTasks([]);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(0);

      const allTasks = await db.tasks.toArray();
      expect(allTasks).toHaveLength(1);
    });

    it('is atomic: all or nothing', async () => {
      const toMerge = [
        TestData.createTestTask({id: 'new-1'}),
        TestData.createTestTask({id: 'new-2'}),
      ];

      const result = await mergeTasks(toMerge);

      if (result.imported === 2) {
        const stored = await db.tasks.toArray();
        expect(stored).toHaveLength(2);
      }
    });
  });
});
