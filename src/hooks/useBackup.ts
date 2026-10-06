import type { Task } from '../domain/types';
import type { ValidationResult } from '../backup/backup';
import { exportBackup, replaceAllTasks, mergeTasks } from '../backup/backupService';
import { downloadTextFile } from '../backup/download';
import { parseAndValidateBackup } from '../backup/backup';

export function useBackup() {
  return {
    exportBackup,
    downloadBackup: (fileName: string, json: string) => downloadTextFile(fileName, json),
    validateBackup: (text: string) => parseAndValidateBackup(text),
    replaceAll: (tasks: Task[]) => replaceAllTasks(tasks),
    merge: (tasks: Task[]) => mergeTasks(tasks),
  };
}
