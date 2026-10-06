import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function useTask(id: string | undefined) {
  const task = useLiveQuery(() => (id ? db.tasks.get(id) : undefined));

  return {
    task,
    isLoading: task === undefined && id !== undefined,
  };
}
