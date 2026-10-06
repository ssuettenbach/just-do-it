import { parseAndValidateBackup } from '../backup/backup';
import { exportBackup, mergeTasks, replaceAllTasks } from '../backup/backupService';
import { downloadTextFile } from '../backup/download';
import type { Task } from '../domain/types';

export function useBackup() {
  return {
    exportBackup,
    downloadBackup: (fileName: string, json: string) => downloadTextFile(fileName, json),
    validateBackup: (text: string) => parseAndValidateBackup(text),
    replaceAll: (tasks: Task[]) => replaceAllTasks(tasks),
    merge: (tasks: Task[]) => mergeTasks(tasks),
  };
}
