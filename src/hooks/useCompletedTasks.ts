import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useCompletedTasks() {
  const tasks = useLiveQuery(() => db.tasks.where('status').equals('completed').toArray());

  return {
    tasks: tasks ?? [],
    isLoading: tasks === undefined,
  };
}
