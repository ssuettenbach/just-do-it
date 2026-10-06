import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { OpenTaskItem } from '../components/tasks/OpenTaskItem';
import { HistoryTaskItem } from '../components/tasks/HistoryTaskItem';
import { useOpenTasks } from '../hooks/useOpenTasks';
import { useCompletedTasks } from '../hooks/useCompletedTasks';
import { useKnownLabels } from '../hooks/useKnownLabels';
import { useTaskActions } from '../hooks/useTaskActions';
import {
  DEFAULT_OPEN_FILTERS,
  DEFAULT_HISTORY_FILTERS,
  filterOpenTasks,
  filterHistory,
  hasActiveOpenFilters,
  hasActiveHistoryFilters,
} from '../domain/filters';
import type { OpenTaskFilters, HistoryFilters, Task } from '../domain/types';
import { todayLocal } from '../domain/dates';

type ManagePageProps = {
  tab: 'open' | 'history';
};

export default function ManagePage({ tab }: ManagePageProps) {
  const { tasks: openTasks, isLoading: isLoadingOpen } = useOpenTasks();
  const { tasks: completedTasks, isLoading: isLoadingCompleted } = useCompletedTasks();
  const { labels: knownLabels } = useKnownLabels();
  const { deleteTask } = useTaskActions();

  const [openFilters, setOpenFilters] = useState<OpenTaskFilters>(DEFAULT_OPEN_FILTERS);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>(DEFAULT_HISTORY_FILTERS);
  const [error, setError] = useState<string | null>(null);

  const isLoading = tab === 'open' ? isLoadingOpen : isLoadingCompleted;

  const filteredOpenTasks = filterOpenTasks(openTasks, openFilters);
  const filteredHistoryTasks = filterHistory(completedTasks, historyFilters);

  const activeOpenFilters = hasActiveOpenFilters(openFilters);
  const activeHistoryFilters = hasActiveHistoryFilters(historyFilters);

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err) {
      setError('Aufgabe konnte nicht gelöscht werden. Bitte erneut versuchen.');
    }
  };

  const clearOpenFilters = () => setOpenFilters(DEFAULT_OPEN_FILTERS);
  const clearHistoryFilters = () => setHistoryFilters(DEFAULT_HISTORY_FILTERS);

  const handleOpenFilterChange = (filter: Partial<OpenTaskFilters>) => {
    setOpenFilters((prev) => ({ ...prev, ...filter }));
  };

  const handleHistoryFilterChange = (filter: Partial<HistoryFilters>) => {
    setHistoryFilters((prev) => ({ ...prev, ...filter }));
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const renderOpenContent = () => {
    if (isLoadingOpen) {
      return <p className="text-slate-400">Wird geladen...</p>;
    }

    if (openTasks.length === 0) {
      return (
        <EmptyState title="Keine offenen Aufgaben">
          <Link to="/tasks/new">
            <Button variant="primary">Aufgabe hinzufügen</Button>
          </Link>
        </EmptyState>
      );
    }

    if (filteredOpenTasks.length === 0 && activeOpenFilters) {
      return (
        <EmptyState title="Keine Aufgaben entsprechen deinen Filtern">
          <Button variant="secondary" onClick={clearOpenFilters}>
            Filter zurücksetzen
          </Button>
          <Link to="/tasks/new">
            <Button variant="primary">Aufgabe hinzufügen</Button>
          </Link>
        </EmptyState>
      );
    }

    return (
      <ul className="space-y-3">
        {filteredOpenTasks.map((task) => (
          <OpenTaskItem key={task.id} task={task} onActionError={setError} />
        ))}
      </ul>
    );
  };

  const renderHistoryContent = () => {
    if (isLoadingCompleted) {
      return <p className="text-slate-400">Wird geladen...</p>;
    }

    if (completedTasks.length === 0) {
      return <EmptyState title="Noch keine erledigten Aufgaben" />;
    }

    if (filteredHistoryTasks.length === 0 && activeHistoryFilters) {
      return (
        <EmptyState title="Keine erledigten Aufgaben entsprechen deinen Filtern">
          <Button variant="secondary" onClick={clearHistoryFilters}>
            Filter zurücksetzen
          </Button>
        </EmptyState>
      );
    }

    return (
      <ul className="space-y-3">
        {filteredHistoryTasks.map((task) => (
          <HistoryTaskItem key={task.id} task={task} onActionError={setError} />
        ))}
      </ul>
    );
  };

  const renderFilters = () => {
    if (tab === 'open') {
      return (
        <OpenTaskFilters
          filters={openFilters}
          knownLabels={knownLabels}
          onChange={handleOpenFilterChange}
          onClear={clearOpenFilters}
          hasActiveFilters={activeOpenFilters}
        />
      );
    }

    return (
      <HistoryTaskFilters
        filters={historyFilters}
        knownLabels={knownLabels}
        onChange={handleHistoryFilterChange}
        onClear={clearHistoryFilters}
        hasActiveFilters={activeHistoryFilters}
      />
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <PageHeader
        title="Aufgaben verwalten"
        actions={
          <Link to="/settings" className="text-slate-300 hover:text-slate-100 transition-colors">
            Einstellungen
          </Link>
        }
      />

      <nav className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
        <Link
          to="/manage"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'open'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          aria-current={tab === 'open' ? 'page' : undefined}
        >
          Offene Aufgaben
        </Link>
        <Link
          to="/manage/history"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'history'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          aria-current={tab === 'history' ? 'page' : undefined}
        >
          Verlauf
        </Link>
      </nav>

      <details className="mb-6">
        <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-slate-100 py-2">
          Filter
        </summary>
        <div className="mt-4 space-y-4">{renderFilters()}</div>
      </details>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {tab === 'open' ? renderOpenContent() : renderHistoryContent()}
    </div>
  );
}

interface OpenTaskFiltersProps {
  filters: OpenTaskFilters;
  knownLabels: string[];
  onChange: (filter: Partial<OpenTaskFilters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function OpenTaskFilters({ filters, knownLabels, onChange, onClear, hasActiveFilters }: OpenTaskFiltersProps) {
  const today = todayLocal();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="open-text" className="block text-sm font-medium text-slate-400 mb-1">
          Suche
        </label>
        <input
          id="open-text"
          type="text"
          value={filters.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Aufgaben durchsuchen..."
          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="open-label" className="block text-sm font-medium text-slate-400 mb-1">
          Kennzeichnung
        </label>
        <select
          id="open-label"
          value={filters.label || ''}
          onChange={(e) => onChange({ label: e.target.value || null })}
          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Alle Kennzeichnungen</option>
          {knownLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="open-duration" className="block text-sm font-medium text-slate-400 mb-1">
          Dauer
        </label>
        <select
          id="open-duration"
          value={filters.duration}
          onChange={(e) => onChange({ duration: e.target.value as OpenTaskFilters['duration'] })}
          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Alle</option>
          <option value="quick">Schnell (&le;5 Min)</option>
          <option value="medium">Mittel (6-29 Min)</option>
          <option value="big">Groß (&ge;30 Min)</option>
          <option value="unestimated">Keine Schätzung</option>
        </select>
      </div>

      <div>
        <label htmlFor="open-due" className="block text-sm font-medium text-slate-400 mb-1">
          Fälligkeit
        </label>
        <select
          id="open-due"
          value={filters.due}
          onChange={(e) => onChange({ due: e.target.value as OpenTaskFilters['due'] })}
          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Alle</option>
          <option value="overdue">Überfällig</option>
          <option value="today">Heute fällig</option>
          <option value="upcoming">Anstehend</option>
          <option value="none">Kein Fälligkeitsdatum</option>
        </select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClear} className="w-full">
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}

interface HistoryTaskFiltersProps {
  filters: HistoryFilters;
  knownLabels: string[];
  onChange: (filter: Partial<HistoryFilters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function HistoryTaskFilters({ filters, knownLabels, onChange, onClear, hasActiveFilters }: HistoryTaskFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="history-text" className="block text-sm font-medium text-slate-400 mb-1">
          Suche
        </label>
        <input
          id="history-text"
          type="text"
          value={filters.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Aufgaben durchsuchen..."
          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="history-label" className="block text-sm font-medium text-slate-400 mb-1">
          Kennzeichnung
        </label>
        <select
          id="history-label"
          value={filters.label || ''}
          onChange={(e) => onChange({ label: e.target.value || null })}
          className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Alle Kennzeichnungen</option>
          {knownLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="history-from" className="block text-sm font-medium text-slate-400 mb-1">
            Erledigt ab
          </label>
          <input
            id="history-from"
            type="date"
            value={filters.completedFrom || ''}
            onChange={(e) => onChange({ completedFrom: e.target.value || null })}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="history-to" className="block text-sm font-medium text-slate-400 mb-1">
            Erledigt bis
          </label>
          <input
            id="history-to"
            type="date"
            value={filters.completedTo || ''}
            onChange={(e) => onChange({ completedTo: e.target.value || null })}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClear} className="w-full">
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
