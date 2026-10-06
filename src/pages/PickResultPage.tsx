import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useOpenTasks } from '../hooks/useOpenTasks';
import { useTaskActions } from '../hooks/useTaskActions';
import { getCandidates, pickRandom } from '../domain/picker';
import { Button } from '../components/Button';
import { PickedTaskCard } from '../components/dashboard/PickedTaskCard';

type ValidCategory = 'quick' | 'any' | 'big';

const isValidCategory = (cat: string | undefined): cat is ValidCategory =>
  cat === 'quick' || cat === 'any' || cat === 'big';

export default function PickResultPage() {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tasks, isLoading } = useOpenTasks();
  const { completeTask } = useTaskActions();

  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = getCandidates(tasks, category as ValidCategory);
  const pickedTaskId = searchParams.get('task');
  const pickedTask = tasks.find((t) => t.id === pickedTaskId);
  const candidateIds = candidates.map((t) => t.id).join(',');

  useEffect(() => {
    if (!isLoading && category && isValidCategory(category)) {
      if (!pickedTaskId) {
        const newTask = pickRandom(candidates);
        if (newTask) {
          setSearchParams({ task: newTask.id }, { replace: true });
        }
      } else if (!candidates.some((t) => t.id === pickedTaskId)) {
        if (candidates.length > 0) {
          const newTask = pickRandom(candidates);
          if (newTask) {
            setSearchParams({ task: newTask.id }, { replace: true });
          }
        } else {
          setSearchParams({}, { replace: true });
        }
      }
    }
  }, [isLoading, category, pickedTaskId, candidateIds, setSearchParams]);

  if (!category || !isValidCategory(category)) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <p role="status" className="text-slate-400">Wird geladen...</p>;
  }

  if (candidates.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-slate-300">Aktuell keine passenden Aufgaben.</p>
        <Link
          to="/"
          className="text-indigo-400 hover:text-indigo-300 transition-colors inline-block"
        >
          Zurück zum Dashboard
        </Link>
      </div>
    );
  }

  if (!pickedTask) {
    return <p role="status" className="text-slate-400">Ausgewählte Aufgabe wird geladen...</p>;
  }

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      await completeTask(pickedTask.id);
      navigate('/');
    } catch (err) {
      setError('Aufgabe konnte nicht abgeschlossen werden. Bitte erneut versuchen.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handlePickAnother = () => {
    const newTask = pickRandom(candidates, pickedTask.id);
    if (newTask) {
      setSearchParams({ task: newTask.id });
    }
  };

  const hasOnlyOneCandidate = candidates.length === 1;

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="text-red-400 text-sm">
          {error}
        </div>
      )}

      <PickedTaskCard
        category={category}
        task={pickedTask}
        actions={
          <>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              Erledigt
            </Button>
            <Button
              variant="secondary"
              onClick={handlePickAnother}
              disabled={hasOnlyOneCandidate}
              aria-describedby={hasOnlyOneCandidate ? 'only-task-hint' : undefined}
            >
              Andere wählen
            </Button>
            {hasOnlyOneCandidate && (
              <span id="only-task-hint" className="text-sm text-slate-400">
                Dies ist die einzige passende Aufgabe.
              </span>
            )}
            <Link
              to={`/tasks/${pickedTask.id}`}
              className="min-h-11 inline-flex items-center justify-center px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 hover:bg-slate-800 text-slate-300 hover:text-slate-200"
            >
              Anzeigen/bearbeiten
            </Link>
          </>
        }
      />
    </div>
  );
}
