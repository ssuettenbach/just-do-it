import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { collectKnownLabels } from '../domain/labels';

export function useKnownLabels() {
  const tasks = useLiveQuery(() => db.tasks.toArray());

  const labels = tasks ? collectKnownLabels(tasks) : [];

  return { labels };
}
