import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Task } from '../domain/types';

export function useCompletedTasks() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('completed').toArray());

  return {
    tasks: tasks ?? [],
    isLoading: tasks === undefined,
  };
}
