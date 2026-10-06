import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HistoryFilterPanel,
  HistoryTaskContent,
  OpenFilterPanel,
  OpenTaskContent,
  PageHeader,
  TaskSearchInput,
} from '../components';
import {
  DEFAULT_HISTORY_FILTERS,
  DEFAULT_OPEN_FILTERS,
  filterHistory,
  filterOpenTasks,
  hasActiveHistoryFilters,
  hasActiveOpenFilters,
} from '../domain/filters';
import type { HistoryFilters, OpenTaskFilters } from '../domain/types';
import { useCompletedTasks, useKnownLabels, useOpenTasks } from '../hooks';
import settingsIcon from '../images/settings.svg';

type ManagePageProps = {
  tab: 'open' | 'history';
};

export default function ManagePage({tab}: ManagePageProps) {
  const {tasks: openTasks, isLoading: isLoadingOpen} = useOpenTasks();
  const {tasks: completedTasks, isLoading: isLoadingCompleted} = useCompletedTasks();
  const {labels: knownLabels} = useKnownLabels();

  const [openFilters, setOpenFilters] = useState<OpenTaskFilters>(DEFAULT_OPEN_FILTERS);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>(DEFAULT_HISTORY_FILTERS);
  const [error, setError] = useState<string | null>(null);

  const filteredOpenTasks = filterOpenTasks(openTasks, openFilters);
  const filteredHistoryTasks = filterHistory(completedTasks, historyFilters);

  const activeOpenFilters = hasActiveOpenFilters(openFilters);
  const activeHistoryFilters = hasActiveHistoryFilters(historyFilters);

  const clearOpenFilters = () => setOpenFilters(DEFAULT_OPEN_FILTERS);
  const clearHistoryFilters = () => setHistoryFilters(DEFAULT_HISTORY_FILTERS);

  const handleOpenFilterChange = (filter: Partial<OpenTaskFilters>) => {
    setOpenFilters((prev) => ({...prev, ...filter}));
  };

  const handleHistoryFilterChange = (filter: Partial<HistoryFilters>) => {
    setHistoryFilters((prev) => ({...prev, ...filter}));
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <PageHeader
        title="Aufgaben verwalten"
        actions={
          <Link to="/settings" className="text-fg-soft hover:text-fg transition-colors">
            <img src={settingsIcon} alt="Einstellungen" className="size-6"/>
          </Link>
        }
      />

      <nav className="flex gap-2 mb-6 border-b border-border pb-2">
        <Link
          to="/manage"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'open'
              ? 'bg-accent text-accent-fg'
              : 'text-fg-muted hover:text-fg-soft hover:bg-surface'
          }`}
          aria-current={tab === 'open' ? 'page' : undefined}
        >
          Offene Aufgaben
        </Link>
        <Link
          to="/manage/history"
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'history'
              ? 'bg-accent text-accent-fg'
              : 'text-fg-muted hover:text-fg-soft hover:bg-surface'
          }`}
          aria-current={tab === 'history' ? 'page' : undefined}
        >
          Verlauf
        </Link>
      </nav>

      {tab === 'open' ? (
        <TaskSearchInput
          id="open-text"
          value={openFilters.text}
          onChange={(text) => handleOpenFilterChange({text})}
        />
      ) : (
        <TaskSearchInput
          id="history-text"
          value={historyFilters.text}
          onChange={(text) => handleHistoryFilterChange({text})}
        />
      )}

      <details className="mb-6">
        <summary className="cursor-pointer text-sm font-medium text-fg-soft hover:text-fg py-2">
          Filter
        </summary>
        <div className="mt-4 space-y-4">
          {tab === 'open' ? (
            <OpenFilterPanel
              filters={openFilters}
              knownLabels={knownLabels}
              onChange={handleOpenFilterChange}
              onClear={clearOpenFilters}
              hasActiveFilters={activeOpenFilters}
            />
          ) : (
            <HistoryFilterPanel
              filters={historyFilters}
              knownLabels={knownLabels}
              onChange={handleHistoryFilterChange}
              onClear={clearHistoryFilters}
              hasActiveFilters={activeHistoryFilters}
            />
          )}
        </div>
      </details>

      {error && (
        <div role="alert"
             className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-600 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {tab === 'open' ? (
        <OpenTaskContent
          tasks={openTasks}
          filteredTasks={filteredOpenTasks}
          isLoading={isLoadingOpen}
          activeFilters={activeOpenFilters}
          onClearFilters={clearOpenFilters}
          onActionError={setError}
        />
      ) : (
        <HistoryTaskContent
          tasks={completedTasks}
          filteredTasks={filteredHistoryTasks}
          isLoading={isLoadingCompleted}
          activeFilters={activeHistoryFilters}
          onClearFilters={clearHistoryFilters}
          onActionError={setError}
        />
      )}
    </div>
  );
}
