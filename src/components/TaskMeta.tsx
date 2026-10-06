import type { Task } from '../domain/types';
import { getDueStatus } from '../domain/dates';
import { formatEstimate, formatDate } from './format';
import { LabelChips } from './LabelChips';

interface TaskMetaProps {
  task: Task;
}

export function TaskMeta({ task }: TaskMetaProps) {
  const dueStatus = getDueStatus(task.dueDate);

  let dueBadge: React.ReactNode = null;

  switch (dueStatus) {
    case 'overdue':
      dueBadge = (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium">
          Überfällig · {task.dueDate ? formatDate(task.dueDate) : ''}
        </span>
      );
      break;
    case 'today':
      dueBadge = (
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium">
          Heute fällig
        </span>
      );
      break;
    case 'upcoming':
      dueBadge = (
         <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-accent-text text-xs font-medium">
          Fällig {task.dueDate ? formatDate(task.dueDate) : ''}
        </span>
      );
      break;
    case 'none':
    default:
      dueBadge = null;
  }

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      <span className="text-fg-muted">{formatEstimate(task.estimateMinutes)}</span>
      {dueBadge}
      {task.labels.length > 0 && <LabelChips labels={task.labels} />}
    </div>
  );
}
