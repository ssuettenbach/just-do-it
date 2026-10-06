import { Link } from 'react-router-dom';
import { useOpenTasks } from '../hooks';
import { getCandidates } from '../domain/picker';
import { EmptyState } from '../components';
import { PickButton } from '../components/dashboard/PickButton';

export default function DashboardPage() {
  const { tasks, isLoading } = useOpenTasks();

  if (isLoading) {
    return <p className="text-slate-400">Aufgaben werden geladen...</p>;
  }

  const quickCandidates = getCandidates(tasks, 'quick');
  const anyCandidates = getCandidates(tasks, 'any');
  const bigCandidates = getCandidates(tasks, 'big');

  if (anyCandidates.length === 0) {
    return (
      <EmptyState
        title="Alles erledigt"
        message="Keine offenen Aufgaben. Füge eine hinzu, um zu starten."
      >
        <Link
          to="/tasks/new"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Aufgabe hinzufügen
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Just Do It</h1>
        <p className="text-slate-400">Wähle eine Aufgabe und leg los</p>
      </div>

      <div className="space-y-4">
         <PickButton
           category="quick"
           subtitle="5 Min oder weniger"
           candidateCount={quickCandidates.length}
           disabledMessage="Keine offenen Aufgaben mit einer Schätzung von 5 Minuten oder weniger."
         />

        <PickButton
          category="any"
          subtitle="Beliebige offene Aufgabe"
          candidateCount={anyCandidates.length}
        />

         <PickButton
           category="big"
           subtitle="30 Min oder mehr"
           candidateCount={bigCandidates.length}
           disabledMessage="Keine offenen Aufgaben mit einer Schätzung von 30 Minuten oder mehr."
         />
      </div>
    </div>
  );
}
