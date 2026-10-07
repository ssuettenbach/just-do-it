import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Task } from '../../domain/types';
import { useTaskActions } from '../../hooks';
import checkIcon from '../../images/check.svg';
import editIcon from '../../images/edit.svg';
import trashIcon from '../../images/trash.svg';
import { Button } from "../Button";
import { ConfirmDialog } from "../ConfirmDialog";
import { Icon } from "../Icon";
import { TaskMeta } from "../TaskMeta";

interface OpenTaskItemProps {
  task: Task;
  onActionError?: (error: string) => void;
}

export function OpenTaskItem({task, onActionError}: OpenTaskItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {completeTask, deleteTask} = useTaskActions();

  const handleComplete = async () => {
    try {
      await completeTask(task.id);
    } catch (error) {
      onActionError?.('Aufgabe konnte nicht abgeschlossen werden. Bitte erneut versuchen.');
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
    <li className="bg-surface rounded-lg p-4 border border-border">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium text-fg truncate">{task.title}</h3>
        <TaskMeta task={task}/>
        {task.notes && <p className="text-sm text-fg-muted">{task.notes}</p>}
        <div className="flex gap-2 mt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleComplete}
            aria-label={`${task.title} erledigen`}
          >
            <Icon src={checkIcon}/>
            Erledigt
          </Button>
          <Link to={`/tasks/${task.id}`} className="flex-1">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              aria-label={`${task.title} bearbeiten`}
            >
              <Icon src={editIcon}/>
              Bearbeiten
            </Button>
          </Link>
          <Button
            variant="danger"
            size="md"
            className="max-[440px]:size-11 max-[440px]:p-0"
            onClick={() => setShowDeleteDialog(true)}
            aria-label={`${task.title} löschen`}
          >
            <Icon src={trashIcon}/>
            <span className="max-[440px]:hidden">Löschen</span>
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
