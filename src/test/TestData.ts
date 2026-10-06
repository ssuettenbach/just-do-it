import type { Task, TaskInput, OpenTaskFilters, HistoryFilters } from '../domain/types';
import type { BackupDocument } from '../backup/backup';

export class TestData {
  static createTestTask(overrides: Partial<Task> = {}): Task {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      title: 'Test Task',
      estimateMinutes: null,
      dueDate: null,
      notes: '',
      labels: [],
      status: 'open',
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      ...overrides,
    };
  }

  static createTestTaskInput(overrides: Partial<TaskInput> = {}): TaskInput {
    return {
      title: 'Test Task',
      estimateMinutes: null,
      dueDate: null,
      notes: '',
      labels: [],
      ...overrides,
    };
  }

  static createTestOpenTaskFilters(overrides: Partial<OpenTaskFilters> = {}): OpenTaskFilters {
    return {
      text: '',
      label: null,
      duration: 'all',
      due: 'all',
      ...overrides,
    };
  }

  static createTestHistoryFilters(overrides: Partial<HistoryFilters> = {}): HistoryFilters {
    return {
      text: '',
      label: null,
      completedFrom: null,
      completedTo: null,
      ...overrides,
    };
  }

  static createTestBackupDocument(overrides: Partial<BackupDocument> = {}): BackupDocument {
    const now = new Date().toISOString();
    return {
      format: 'just-do-it-backup',
      version: 1,
      exportedAt: now,
      tasks: [],
      ...overrides,
    };
  }
}
