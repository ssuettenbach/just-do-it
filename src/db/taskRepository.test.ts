import { beforeEach, describe, expect, it } from 'vitest';
import { TestData } from '../test/TestData';
import { db } from './database';
import {
  addTask,
  completeTaskById,
  deleteTask,
  getAllTasks,
  getCompletedTasks,
  getOpenTasks,
  getTask,
  pickTask,
  reopenTaskById,
  updateTask,
} from './taskRepository';

describe('taskRepository', () => {
  beforeEach(async () => {
    await db.tasks.clear();
  });

  describe('addTask', () => {
    it('adds task to database and returns it', async () => {
      const input = TestData.createTestTaskInput({title: 'New Task'});
      const task = await addTask(input);

      expect(task.id).toBeTruthy();
      expect(task.title).toBe('New Task');
      expect(task.status).toBe('open');
    });

    it('throws on invalid input', async () => {
      const input = TestData.createTestTaskInput({title: ''});
      await expect(addTask(input)).rejects.toThrow();
    });

    it('normalizes labels on add', async () => {
      const input = TestData.createTestTaskInput({labels: ['work', 'Work', 'WORK']});
      const task = await addTask(input);
      expect(task.labels).toEqual(['work']);
    });
  });

  describe('getTask', () => {
    it('returns task by id', async () => {
      const input = TestData.createTestTaskInput({title: 'Test'});
      const added = await addTask(input);
      const retrieved = await getTask(added.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(added.id);
      expect(retrieved?.title).toBe('Test');
    });

    it('returns undefined for missing id', async () => {
      const result = await getTask('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('updateTask', () => {
    it('updates task and returns updated version', async () => {
      const input = TestData.createTestTaskInput({title: 'Original'});
      const task = await addTask(input);

      const updatedInput = TestData.createTestTaskInput({title: 'Updated'});
      const updated = await updateTask(task.id, updatedInput);

      expect(updated.id).toBe(task.id);
      expect(updated.title).toBe('Updated');
    });

    it('throws if task not found', async () => {
      const input = TestData.createTestTaskInput();
      await expect(updateTask('nonexistent', input)).rejects.toThrow('Task not found');
    });

    it('throws on invalid input', async () => {
      const input = TestData.createTestTaskInput({title: 'Valid'});
      const task = await addTask(input);

      const invalidInput = TestData.createTestTaskInput({title: ''});
      await expect(updateTask(task.id, invalidInput)).rejects.toThrow();
    });
  });

  describe('completeTaskById', () => {
    it('completes task and returns updated version', async () => {
      const task = await addTask(TestData.createTestTaskInput({title: 'To Complete'}));
      const completed = await completeTaskById(task.id);

      expect(completed.id).toBe(task.id);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).not.toBeNull();
    });

    it('throws if task not found', async () => {
      await expect(completeTaskById('nonexistent')).rejects.toThrow('Task not found');
    });

    it('is idempotent', async () => {
      const task = await addTask(TestData.createTestTaskInput());
      const completed1 = await completeTaskById(task.id);
      const completed2 = await completeTaskById(task.id);

      expect(completed1.status).toBe('completed');
      expect(completed2.status).toBe('completed');
      expect(completed1.completedAt).toBe(completed2.completedAt);
    });
  });

  describe('reopenTaskById', () => {
    it('reopens completed task', async () => {
      const task = await addTask(TestData.createTestTaskInput());
      const completed = await completeTaskById(task.id);
      const reopened = await reopenTaskById(completed.id);

      expect(reopened.status).toBe('open');
      expect(reopened.completedAt).toBeNull();
    });

    it('throws if task not found', async () => {
      await expect(reopenTaskById('nonexistent')).rejects.toThrow('Task not found');
    });

    it('is idempotent', async () => {
      const task = await addTask(TestData.createTestTaskInput());
      const reopened1 = await reopenTaskById(task.id);
      const reopened2 = await reopenTaskById(task.id);

      expect(reopened1.status).toBe('open');
      expect(reopened2.status).toBe('open');
      expect(reopened1.updatedAt).toBe(reopened2.updatedAt);
    });
  });

  describe('deleteTask', () => {
    it('deletes task from database', async () => {
      const task = await addTask(TestData.createTestTaskInput());
      await deleteTask(task.id);

      const retrieved = await getTask(task.id);
      expect(retrieved).toBeUndefined();
    });

    it('throws if task not found', async () => {
      await expect(deleteTask('nonexistent')).rejects.toThrow('Task not found');
    });
  });

  describe('getOpenTasks', () => {
    it('returns only open tasks', async () => {
      const open1 = await addTask(TestData.createTestTaskInput({title: 'Open 1'}));
      const open2 = await addTask(TestData.createTestTaskInput({title: 'Open 2'}));
      await completeTaskById(open2.id);
      const open3 = await addTask(TestData.createTestTaskInput({title: 'Open 3'}));

      const result = await getOpenTasks();
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toContain(open1.id);
      expect(result.map((t) => t.id)).toContain(open3.id);
    });

    it('returns empty array if no open tasks', async () => {
      const task = await addTask(TestData.createTestTaskInput());
      await completeTaskById(task.id);

      const result = await getOpenTasks();
      expect(result).toHaveLength(0);
    });
  });

  describe('getCompletedTasks', () => {
    it('returns only completed tasks', async () => {
      const t1 = await addTask(TestData.createTestTaskInput({title: 'Task 1'}));
      const t2 = await addTask(TestData.createTestTaskInput({title: 'Task 2'}));
      await completeTaskById(t1.id);

      const result = await getCompletedTasks();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(t1.id);
    });

    it('returns empty array if no completed tasks', async () => {
      await addTask(TestData.createTestTaskInput());
      await addTask(TestData.createTestTaskInput());

      const result = await getCompletedTasks();
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllTasks', () => {
    it('returns all tasks', async () => {
      const t1 = await addTask(TestData.createTestTaskInput());
      const t2 = await addTask(TestData.createTestTaskInput());
      await completeTaskById(t2.id);

      const result = await getAllTasks();
      expect(result).toHaveLength(2);
    });

    it('returns empty array if no tasks', async () => {
      const result = await getAllTasks();
      expect(result).toHaveLength(0);
    });
  });

  describe('pickTask', () => {
    it('returns null if no eligible candidates', async () => {
      const task = await addTask(TestData.createTestTaskInput({estimateMinutes: null}));
      const result = await pickTask('quick');

      expect(result).toBeNull();
    });

    it('returns eligible task for quick category', async () => {
      const quick = await addTask(TestData.createTestTaskInput({estimateMinutes: 3}));
      const big = await addTask(TestData.createTestTaskInput({estimateMinutes: 45}));

      const result = await pickTask('quick');
      expect(result?.id).toBe(quick.id);
    });

    it('returns eligible task for big category', async () => {
      const quick = await addTask(TestData.createTestTaskInput({estimateMinutes: 3}));
      const big = await addTask(TestData.createTestTaskInput({estimateMinutes: 45}));

      const result = await pickTask('big');
      expect(result?.id).toBe(big.id);
    });

    it('returns any open task for any category', async () => {
      const t1 = await addTask(TestData.createTestTaskInput({estimateMinutes: null}));
      const t2 = await addTask(TestData.createTestTaskInput({estimateMinutes: 50}));

      const result = await pickTask('any');
      expect(result).not.toBeNull();
      expect([t1.id, t2.id]).toContain(result?.id);
    });

    it('excludes specific id if 2+ candidates available', async () => {
      const t1 = await addTask(TestData.createTestTaskInput({estimateMinutes: 3}));
      const t2 = await addTask(TestData.createTestTaskInput({estimateMinutes: 3}));

      const result = await pickTask('quick', t1.id);
      expect(result?.id).not.toBe(t1.id);
    });

    it('returns excluded task if only 1 candidate', async () => {
      const task = await addTask(TestData.createTestTaskInput({estimateMinutes: 3}));

      const result = await pickTask('quick', task.id);
      expect(result?.id).toBe(task.id);
    });

    it('excludes completed tasks', async () => {
      const t1 = await addTask(TestData.createTestTaskInput({estimateMinutes: 3}));
      await completeTaskById(t1.id);

      const result = await pickTask('quick');
      expect(result).toBeNull();
    });
  });
});
