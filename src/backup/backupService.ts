import type { Task } from '../domain/types';
import { db } from '../db/database';
import { getAllTasks } from '../db/taskRepository';
import { createBackup, serializeBackup, backupFileName, parseAndValidateBackup } from './backup';
import { downloadTextFile } from './download';

export async function exportBackup(): Promise<{ fileName: string; json: string }> {
  const tasks = await getAllTasks();
  const doc = createBackup(tasks);
  const json = serializeBackup(doc);
  const fileName = backupFileName();

  return { fileName, json };
}

export async function replaceAllTasks(tasks: Task[]): Promise<number> {
  return db.transaction('rw', db.tasks, async () => {
    await db.tasks.clear();
    await db.tasks.bulkAdd(tasks);
    return tasks.length;
  });
}

export async function mergeTasks(tasks: Task[]): Promise<{ imported: number; skipped: number }> {
  return db.transaction('rw', db.tasks, async () => {
    const existing = await db.tasks.toArray();
    const existingIds = new Set(existing.map((t) => t.id));

    const toImport = tasks.filter((t) => !existingIds.has(t.id));
    const skipped = tasks.length - toImport.length;

    if (toImport.length > 0) {
      await db.tasks.bulkAdd(toImport);
    }

    return { imported: toImport.length, skipped };
  });
}
