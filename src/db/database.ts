import Dexie, { type Table } from 'dexie';
import type { Task } from '../domain/types';

export class JustDoItDB extends Dexie {
  tasks!: Table<Task, string>;

  constructor() {
    super('just-do-it');
    this.version(1).stores({
      tasks: 'id, status, dueDate, completedAt, estimateMinutes, *labels, createdAt',
    });
  }
}

export const db = new JustDoItDB();
