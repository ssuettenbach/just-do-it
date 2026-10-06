import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { PageHeader, ConfirmDialog, Button, formatDateTime } from '../components';
import { useTask, useKnownLabels, useTaskActions } from '../hooks';
import type { TaskInput } from '../domain/types';
import {TaskForm} from "../components/tasks";

type TaskFormPageProps = {
  mode: 'create' | 'edit';
};

export default function TaskFormPage({ mode }: TaskFormPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { task, isLoading } = useTask(mode === 'edit' ? id : undefined);
  const { labels: knownLabels } = useKnownLabels();
  const { addTask, updateTask, deleteTask } = useTaskActions();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (input: TaskInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        await addTask(input);
        navigate('/manage');
      } else if (task) {
        await updateTask(task.id, input);
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/manage');
        }
      }
    } catch (err) {
      setError('Aufgabe konnte nicht gespeichert werden. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteTask(task.id);
      setShowDeleteDialog(false);
      navigate('/manage');
    } catch (err) {
      setError('Aufgabe konnte nicht gelöscht werden. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'edit' && isLoading) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <PageHeader title="Aufgabe bearbeiten" backTo="/manage" />
        <p className="text-fg-muted">Wird geladen...</p>
      </div>
    );
  }

  if (mode === 'edit' && !task) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <PageHeader title="Aufgabe bearbeiten" backTo="/manage" />
        <p className="text-fg-muted">Aufgabe nicht gefunden</p>
        <Link to="/manage" className="inline-block mt-4">
          <Button variant="secondary">Zurück zu den Aufgaben</Button>
        </Link>
      </div>
    );
  }

  const title = mode === 'create' ? 'Neue Aufgabe' : 'Aufgabe bearbeiten';

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <PageHeader title={title} backTo="/manage" />

       {mode === 'edit' && task && task.status === 'completed' && (
        <div className="mb-4 p-3 bg-surface rounded-lg border border-border">
          <p className="text-sm text-fg-muted">
            Erledigt am {formatDateTime(task.completedAt || '')}
          </p>
        </div>
       )}

       {error && (
        <div role="alert" className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-600 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
       )}

      <TaskForm
        mode={mode}
        task={task}
        knownLabels={knownLabels}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {mode === 'edit' && task && (
        <div className="mt-6">
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isSubmitting}
            className="w-full"
          >
            Aufgabe löschen
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Aufgabe löschen?"
        message={`„${task?.title || ''}“ wird dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.`}
        confirmLabel="Löschen"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

