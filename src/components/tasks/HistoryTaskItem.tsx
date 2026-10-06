import { useState } from 'react';
import type { Task } from '../../domain/types';
import { TaskMeta } from '../TaskMeta';
import { ConfirmDialog } from '../ConfirmDialog';
import { Button } from '../Button';
import { useTaskActions } from '../../hooks/useTaskActions';
import { formatDateTime } from '../format';

interface HistoryTaskItemProps {
  task: Task;
  onActionError?: (error: string) => void;
}

export function HistoryTaskItem({ task, onActionError }: HistoryTaskItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { reopenTask, deleteTask } = useTaskActions();

  const handleReopen = async () => {
    try {
      await reopenTask(task.id);
    } catch (error) {
      onActionError?.('Aufgabe konnte nicht wieder geöffnet werden. Bitte erneut versuchen.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
    } catch (error) {
      onActionError?.('Aufgabe konnte nicht gelöscht werden. Bitte erneut versuchen.');
    }
  };

  return (
    <li className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-slate-100 truncate">{task.title}</h3>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            Erledigt am {formatDateTime(task.completedAt || '')}
          </span>
        </div>
        <TaskMeta task={task} />
        {task.notes && <p className="text-sm text-slate-400">{task.notes}</p>}
        <div className="flex gap-2 mt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleReopen}
            aria-label={`${task.title} wieder öffnen`}
          >
            Wieder öffnen
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => setShowDeleteDialog(true)}
            aria-label={`${task.title} löschen`}
          >
            Löschen
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Aufgabe löschen?"
        message={`„${task.title}“ wird dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.`}
        confirmLabel="Löschen"
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          handleDelete();
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </li>
  );
}
