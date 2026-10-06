import { Button } from '../Button';
import { EmptyState } from '../EmptyState';
import { HistoryTaskItem } from './HistoryTaskItem';
import type { Task } from '../../domain/types';

interface HistoryTaskContentProps {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  activeFilters: boolean;
  onClearFilters: () => void;
  onActionError: (error: string) => void;
}

export function HistoryTaskContent({
  tasks,
  filteredTasks,
  isLoading,
  activeFilters,
  onClearFilters,
  onActionError,
}: HistoryTaskContentProps) {
  if (isLoading) {
    return <p className="text-fg-muted">Wird geladen...</p>;
  }

  if (tasks.length === 0) {
    return <EmptyState title="Noch keine erledigten Aufgaben" />;
  }

  if (filteredTasks.length === 0 && activeFilters) {
    return (
      <EmptyState title="Keine erledigten Aufgaben entsprechen deinen Filtern">
        <Button variant="secondary" onClick={onClearFilters}>
          Filter zurücksetzen
        </Button>
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {filteredTasks.map((task) => (
        <HistoryTaskItem key={task.id} task={task} onActionError={onActionError} />
      ))}
    </ul>
  );
}