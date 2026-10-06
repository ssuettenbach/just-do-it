import { Link } from 'react-router-dom';
import { Button } from '../Button';
import { Icon } from '../Icon';
import resetIcon from '../../images/reset.svg';
import plusIcon from '../../images/plus.svg';
import { EmptyState } from '../EmptyState';
import { OpenTaskItem } from './OpenTaskItem';
import type { Task } from '../../domain/types';

interface OpenTaskContentProps {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  activeFilters: boolean;
  onClearFilters: () => void;
  onActionError: (error: string) => void;
}

export function OpenTaskContent({
  tasks,
  filteredTasks,
  isLoading,
  activeFilters,
  onClearFilters,
  onActionError,
}: OpenTaskContentProps) {
  if (isLoading) {
    return <p className="text-fg-muted">Wird geladen...</p>;
  }

  if (tasks.length === 0) {
    return (
      <EmptyState title="Keine offenen Aufgaben">
        <Link to="/tasks/new">
          <Button variant="primary">
            <Icon src={plusIcon} />
            Aufgabe hinzufügen
          </Button>
        </Link>
      </EmptyState>
    );
  }

  if (filteredTasks.length === 0 && activeFilters) {
    return (
      <EmptyState title="Keine Aufgaben entsprechen deinen Filtern">
        <Button variant="secondary" onClick={onClearFilters}>
          <Icon src={resetIcon} />
          Filter zurücksetzen
        </Button>
        <Link to="/tasks/new">
          <Button variant="primary">
            <Icon src={plusIcon} />
            Aufgabe hinzufügen
          </Button>
        </Link>
      </EmptyState>
    );
  }

  return (
    <ul className="space-y-3">
      {filteredTasks.map((task) => (
        <OpenTaskItem key={task.id} task={task} onActionError={onActionError} />
      ))}
    </ul>
  );
}