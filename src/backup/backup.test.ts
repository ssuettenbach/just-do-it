import { describe, expect, it } from 'vitest';
import { TestData } from '../test/TestData';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  backupFileName,
  createBackup,
  parseAndValidateBackup,
  serializeBackup,
} from './backup';

describe('backup', () => {
  describe('constants', () => {
    it('BACKUP_FORMAT is "just-do-it-backup"', () => {
      expect(BACKUP_FORMAT).toBe('just-do-it-backup');
    });

    it('BACKUP_VERSION is 1', () => {
      expect(BACKUP_VERSION).toBe(1);
    });
  });

  describe('createBackup', () => {
    it('creates backup document with correct structure', () => {
      const tasks = [TestData.createTestTask({title: 'Task 1'})];
      const now = new Date('2026-10-05T14:30:00.000Z');

      const backup = createBackup(tasks, now);

      expect(backup.format).toBe('just-do-it-backup');
      expect(backup.version).toBe(1);
      expect(backup.exportedAt).toBe(now.toISOString());
      expect(backup.tasks).toHaveLength(1);
    });

    it('creates deep copy of tasks', () => {
      const original = TestData.createTestTask({title: 'Original'});
      const backup = createBackup([original]);

      backup.tasks[0].title = 'Modified';
      expect(original.title).toBe('Original');
    });
  });

  describe('serializeBackup', () => {
    it('returns pretty JSON with 2-space indent', () => {
      const doc = TestData.createTestBackupDocument();
      const json = serializeBackup(doc);

      expect(json).toContain('\n');
      expect(json).toContain('  ');
      expect(JSON.parse(json)).toEqual(doc);
    });
  });

  describe('backupFileName', () => {
    it('returns filename in format just-do-it-backup-YYYY-MM-DD.json', () => {
      const now = new Date('2026-10-05T14:30:00.000Z');
      const fileName = backupFileName(now);

      expect(fileName).toBe('just-do-it-backup-2026-10-05.json');
    });
  });

  describe('parseAndValidateBackup', () => {
    it('parses valid backup document', () => {
      const task = TestData.createTestTask({id: 'task-1', title: 'Test', status: 'open'});
      const doc = TestData.createTestBackupDocument({tasks: [task]});
      const json = serializeBackup(doc);

      const result = parseAndValidateBackup(json);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].title).toBe('Test');
      }
    });

    it('rejects malformed JSON', () => {
      const result = parseAndValidateBackup('{ invalid json');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toContain('Ungültiges JSON');
      }
    });

    it('rejects wrong format', () => {
      const result = parseAndValidateBackup(JSON.stringify({format: 'wrong-format', version: 1, tasks: []}));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('Ungültiges Format'))).toBe(true);
      }
    });

    it('rejects unsupported version with version number in message', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 99,
          tasks: [],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('99') && e.includes('Version'))).toBe(true);
      }
    });

    it('rejects if tasks is not an array', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: 'not an array',
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('Array'))).toBe(true);
      }
    });

    it('validates id is non-empty string', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: '',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('id'))).toBe(true);
      }
    });

    it('validates title is non-empty string', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: '',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('Titel'))).toBe(true);
      }
    });

    it('validates estimateMinutes is null or non-negative integer', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: -1,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('estimateMinutes'))).toBe(true);
      }
    });

    it('validates dueDate is null or valid YYYY-MM-DD', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: 'invalid-date',
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('dueDate'))).toBe(true);
      }
    });

    it('validates labels is array of strings', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [123],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('labels'))).toBe(true);
      }
    });

    it('validates status is "open" or "completed"', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'invalid',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('status'))).toBe(true);
      }
    });

    it('validates createdAt is valid ISO timestamp', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: 'invalid',
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('createdAt'))).toBe(true);
      }
    });

    it('validates completedAt when status is completed', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'completed',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('completedAt'))).toBe(true);
      }
    });

    it('validates completedAt is null when status is open', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('completedAt'))).toBe(true);
      }
    });

    it('detects duplicate ids', () => {
      const now = new Date().toISOString();
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Task 1',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: now,
              updatedAt: now,
              completedAt: null,
            },
            {
              id: 'task-1',
              title: 'Task 2',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: now,
              updatedAt: now,
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('dupliziert'))).toBe(true);
      }
    });

    it('normalizes labels on success', () => {
      const now = new Date().toISOString();
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Test',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: ['work', 'Work', 'WORK'],
              status: 'open',
              createdAt: now,
              updatedAt: now,
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.tasks[0].labels).toEqual(['work']);
      }
    });

    it('reports at most 20 errors then adds "...and N more" line', () => {
      const now = new Date().toISOString();
      const invalidTasks = Array.from({length: 30}, (_, i) => ({
        id: '', // invalid: empty id
        title: 'Test',
        estimateMinutes: null,
        dueDate: null,
        notes: '',
        labels: [],
        status: 'open',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      }));

      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: invalidTasks,
        })
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.length).toBeLessThanOrEqual(21);
        expect(result.errors.some((e) => e.startsWith('... und'))).toBe(true);
      }
    });

    it('uses 1-based task numbering in error messages', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: 'Valid Task',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
            {
              id: '', // invalid: empty id
              title: 'Invalid Task',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('Aufgabe 2:'))).toBe(true);
      }
    });

    it('rejects non-object task entry', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [null],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('Aufgabe 1:') && e.includes('muss ein Objekt sein'))).toBe(true);
      }
    });

    it('rejects whitespace-only title', () => {
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: '   ',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors.some((e) => e.includes('Titel'))).toBe(true);
      }
    });

    it('trims title on success', () => {
      const now = new Date().toISOString();
      const result = parseAndValidateBackup(
        JSON.stringify({
          format: 'just-do-it-backup',
          version: 1,
          tasks: [
            {
              id: 'task-1',
              title: '  Trimmed Title  ',
              estimateMinutes: null,
              dueDate: null,
              notes: '',
              labels: [],
              status: 'open',
              createdAt: now,
              updatedAt: now,
              completedAt: null,
            },
          ],
        })
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.tasks[0].title).toBe('Trimmed Title');
      }
    });
  });
});
