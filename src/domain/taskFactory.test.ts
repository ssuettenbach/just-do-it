import { describe, expect, it } from 'vitest';
import { TestData } from '../test/TestData';
import { applyUpdate, completeTask, createTask, reopenTask, validateTaskInput } from './taskFactory';

describe('taskFactory', () => {
  describe('validateTaskInput', () => {
    it('rejects empty or blank title', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), title: ''});
      expect(errors.title).toBeDefined();

      const errors2 = validateTaskInput({...TestData.createTestTaskInput(), title: '   '});
      expect(errors2.title).toBeDefined();
    });

    it('accepts non-empty title after trim', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), title: '  Task  '});
      expect(errors.title).toBeUndefined();
    });

    it('accepts null estimateMinutes', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), estimateMinutes: null});
      expect(errors.estimateMinutes).toBeUndefined();
    });

    it('accepts whole number 0 to 10000', () => {
      expect(validateTaskInput({
        ...TestData.createTestTaskInput(),
        estimateMinutes: 0
      }).estimateMinutes).toBeUndefined();
      expect(validateTaskInput({
        ...TestData.createTestTaskInput(),
        estimateMinutes: 100
      }).estimateMinutes).toBeUndefined();
      expect(validateTaskInput({
        ...TestData.createTestTaskInput(),
        estimateMinutes: 10000
      }).estimateMinutes).toBeUndefined();
    });

    it('rejects negative estimate', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), estimateMinutes: -1});
      expect(errors.estimateMinutes).toBeDefined();
    });

    it('rejects non-integer estimate', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), estimateMinutes: 5.5});
      expect(errors.estimateMinutes).toBeDefined();
    });

    it('accepts null dueDate', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), dueDate: null});
      expect(errors.dueDate).toBeUndefined();
    });

    it('accepts valid YYYY-MM-DD', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), dueDate: '2026-10-05'});
      expect(errors.dueDate).toBeUndefined();
    });

    it('rejects invalid date format', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), dueDate: '10/05/2026'});
      expect(errors.dueDate).toBeDefined();
    });

    it('rejects invalid calendar date', () => {
      const errors = validateTaskInput({...TestData.createTestTaskInput(), dueDate: '2026-02-30'});
      expect(errors.dueDate).toBeDefined();
    });

    it('returns empty object for valid input', () => {
      const errors = validateTaskInput(TestData.createTestTaskInput({title: 'Valid Task'}));
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('createTask', () => {
    it('throws on invalid input', () => {
      expect(() => createTask(TestData.createTestTaskInput({title: ''}))).toThrow();
    });

    it('creates task with generated UUID', () => {
      const task = createTask(TestData.createTestTaskInput({title: 'Test'}));
      expect(task.id).toBeTruthy();
      expect(task.id.length).toBeGreaterThan(0);
    });

    it('sets status to open', () => {
      const task = createTask(TestData.createTestTaskInput());
      expect(task.status).toBe('open');
    });

    it('sets createdAt and updatedAt to now ISO', () => {
      const now = new Date('2026-10-05T14:30:00.000Z');
      const task = createTask(TestData.createTestTaskInput(), now);
      expect(task.createdAt).toBe(now.toISOString());
      expect(task.updatedAt).toBe(now.toISOString());
    });

    it('sets completedAt to null', () => {
      const task = createTask(TestData.createTestTaskInput());
      expect(task.completedAt).toBeNull();
    });

    it('trims title and normalizes labels', () => {
      const task = createTask(
        TestData.createTestTaskInput({
          title: '  Test Task  ',
          labels: ['work', 'Work', 'WORK'],
        })
      );
      expect(task.title).toBe('Test Task');
      expect(task.labels).toEqual(['work']);
    });

    it('generates unique IDs for multiple tasks', () => {
      const t1 = createTask(TestData.createTestTaskInput());
      const t2 = createTask(TestData.createTestTaskInput());
      expect(t1.id).not.toBe(t2.id);
    });
  });

  describe('applyUpdate', () => {
    it('throws on invalid input', () => {
      const task = TestData.createTestTask();
      expect(() => applyUpdate(task, TestData.createTestTaskInput({title: ''}))).toThrow();
    });

    it('updates title', () => {
      const task = TestData.createTestTask({title: 'Old Title'});
      const updated = applyUpdate(task, TestData.createTestTaskInput({title: 'New Title'}));
      expect(updated.title).toBe('New Title');
    });

    it('preserves id', () => {
      const task = TestData.createTestTask({id: 'task-1'});
      const updated = applyUpdate(task, TestData.createTestTaskInput());
      expect(updated.id).toBe('task-1');
    });

    it('preserves status', () => {
      const task = TestData.createTestTask({status: 'open'});
      const updated = applyUpdate(task, TestData.createTestTaskInput());
      expect(updated.status).toBe('open');
    });

    it('preserves createdAt', () => {
      const createdAt = '2026-10-01T00:00:00.000Z';
      const task = TestData.createTestTask({createdAt});
      const updated = applyUpdate(task, TestData.createTestTaskInput());
      expect(updated.createdAt).toBe(createdAt);
    });

    it('updates updatedAt to now', () => {
      const task = TestData.createTestTask({updatedAt: '2026-10-01T00:00:00.000Z'});
      const now = new Date('2026-10-05T14:30:00.000Z');
      const updated = applyUpdate(task, TestData.createTestTaskInput(), now);
      expect(updated.updatedAt).toBe(now.toISOString());
    });

    it('preserves completedAt if task is completed', () => {
      const completedAt = '2026-10-04T12:00:00.000Z';
      const task = TestData.createTestTask({status: 'completed', completedAt});
      const updated = applyUpdate(task, TestData.createTestTaskInput());
      expect(updated.completedAt).toBe(completedAt);
    });

    it('trims title and normalizes labels', () => {
      const task = TestData.createTestTask();
      const updated = applyUpdate(
        task,
        TestData.createTestTaskInput({
          title: '  Updated  ',
          labels: ['a', 'A', 'a'],
        })
      );
      expect(updated.title).toBe('Updated');
      expect(updated.labels).toEqual(['a']);
    });
  });

  describe('completeTask', () => {
    it('sets status to completed', () => {
      const task = TestData.createTestTask({status: 'open'});
      const completed = completeTask(task);
      expect(completed.status).toBe('completed');
    });

    it('sets completedAt to now', () => {
      const task = TestData.createTestTask();
      const now = new Date('2026-10-05T14:30:00.000Z');
      const completed = completeTask(task, now);
      expect(completed.completedAt).toBe(now.toISOString());
    });

    it('updates updatedAt to now', () => {
      const task = TestData.createTestTask();
      const now = new Date('2026-10-05T14:30:00.000Z');
      const completed = completeTask(task, now);
      expect(completed.updatedAt).toBe(now.toISOString());
    });

    it('preserves other fields', () => {
      const task = TestData.createTestTask({title: 'Test', id: 'task-1'});
      const completed = completeTask(task);
      expect(completed.title).toBe('Test');
      expect(completed.id).toBe('task-1');
    });

    it('is idempotent: completing a completed task returns it unchanged', () => {
      const completedAt = '2026-10-04T12:00:00.000Z';
      const task = TestData.createTestTask({status: 'completed', completedAt});
      const now = new Date('2026-10-05T14:30:00.000Z');
      const result = completeTask(task, now);
      expect(result).toBe(task);
    });
  });

  describe('reopenTask', () => {
    it('sets status to open', () => {
      const task = TestData.createTestTask({status: 'completed'});
      const reopened = reopenTask(task);
      expect(reopened.status).toBe('open');
    });

    it('sets completedAt to null', () => {
      const task = TestData.createTestTask({status: 'completed', completedAt: '2026-10-04T12:00:00.000Z'});
      const reopened = reopenTask(task);
      expect(reopened.completedAt).toBeNull();
    });

    it('updates updatedAt to now', () => {
      const task = TestData.createTestTask({status: 'completed'});
      const now = new Date('2026-10-05T14:30:00.000Z');
      const reopened = reopenTask(task, now);
      expect(reopened.updatedAt).toBe(now.toISOString());
    });

    it('preserves other fields', () => {
      const task = TestData.createTestTask({title: 'Test', id: 'task-1'});
      const reopened = reopenTask(task);
      expect(reopened.title).toBe('Test');
      expect(reopened.id).toBe('task-1');
    });

    it('is idempotent: reopening an open task returns it unchanged', () => {
      const task = TestData.createTestTask({status: 'open'});
      const now = new Date('2026-10-05T14:30:00.000Z');
      const result = reopenTask(task, now);
      expect(result).toBe(task);
    });
  });

  describe('lifecycle transitions', () => {
    it('can create, complete, and reopen a task', () => {
      const input = TestData.createTestTaskInput({title: 'Lifecycle Test'});
      const created = createTask(input);

      expect(created.status).toBe('open');
      expect(created.completedAt).toBeNull();

      const completed = completeTask(created);
      expect(completed.status).toBe('completed');
      expect(completed.completedAt).not.toBeNull();

      const reopened = reopenTask(completed);
      expect(reopened.status).toBe('open');
      expect(reopened.completedAt).toBeNull();
    });

    it('updates preserves lifecycle state', () => {
      const created = createTask(TestData.createTestTaskInput({title: 'Original'}));
      const completed = completeTask(created);
      const updated = applyUpdate(completed, TestData.createTestTaskInput({title: 'Updated'}));

      expect(updated.title).toBe('Updated');
      expect(updated.status).toBe('completed');
      expect(updated.completedAt).not.toBeNull();
    });
  });
});
