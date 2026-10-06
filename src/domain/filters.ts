import type { Task, OpenTaskFilters, HistoryFilters, DurationFilter } from './types';
import { getDueStatus } from './dates';
import { todayLocal } from './dates';

export const DEFAULT_OPEN_FILTERS: OpenTaskFilters = {
  text: '',
  label: null,
  duration: 'all',
  due: 'all',
};

export const DEFAULT_HISTORY_FILTERS: HistoryFilters = {
  text: '',
  label: null,
  completedFrom: null,
  completedTo: null,
};

function matchesText(task: Task, text: string): boolean {
  const query = text.toLowerCase();
  return (
    task.title.toLowerCase().includes(query) ||
    task.notes.toLowerCase().includes(query) ||
    task.labels.some((label) => label.toLowerCase().includes(query))
  );
}

function matchesDuration(task: Task, duration: DurationFilter): boolean {
  if (duration === 'all') return true;

  const est = task.estimateMinutes;

  if (duration === 'quick') {
    return est !== null && est >= 0 && est <= 5;
  }

  if (duration === 'medium') {
    return est !== null && est >= 6 && est <= 29;
  }

  if (duration === 'big') {
    return est !== null && est >= 30;
  }

  if (duration === 'unestimated') {
    return est === null;
  }

  return true;
}

export function filterOpenTasks(tasks: Task[], filters: OpenTaskFilters, today?: string): Task[] {
  const todayStr = today || todayLocal();
  const openTasks = tasks.filter((t) => t.status === 'open');

  let result = openTasks;

  if (filters.text) {
    result = result.filter((t) => matchesText(t, filters.text));
  }

  if (filters.label) {
    result = result.filter((t) => t.labels.some((l) => l.toLowerCase() === filters.label!.toLowerCase()));
  }

  if (filters.duration !== 'all') {
    result = result.filter((t) => matchesDuration(t, filters.duration));
  }

  if (filters.due !== 'all') {
    result = result.filter((t) => {
      const status = getDueStatus(t.dueDate, todayStr);
      return status === filters.due;
    });
  }

  result.sort((a, b) => {
    const aStatus = getDueStatus(a.dueDate, todayStr);
    const bStatus = getDueStatus(b.dueDate, todayStr);

    const statusOrder: Record<string, number> = { overdue: 0, today: 1, upcoming: 2, none: 3 };
    const aOrder = statusOrder[aStatus];
    const bOrder = statusOrder[bStatus];

    if (aOrder !== bOrder) return aOrder - bOrder;

    const aDate = a.dueDate || '\uffff';
    const bDate = b.dueDate || '\uffff';
    if (aDate !== bDate) return aDate.localeCompare(bDate);

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return result;
}

export function filterHistory(tasks: Task[], filters: HistoryFilters): Task[] {
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  let result = completedTasks;

  if (filters.text) {
    result = result.filter((t) => matchesText(t, filters.text));
  }

  if (filters.label) {
    result = result.filter((t) => t.labels.some((l) => l.toLowerCase() === filters.label!.toLowerCase()));
  }

  if (filters.completedFrom) {
    result = result.filter((t) => {
      const completedDate = t.completedAt ? t.completedAt.split('T')[0] : '';
      return completedDate >= filters.completedFrom!;
    });
  }

  if (filters.completedTo) {
    result = result.filter((t) => {
      const completedDate = t.completedAt ? t.completedAt.split('T')[0] : '';
      return completedDate <= filters.completedTo!;
    });
  }

  result.sort((a, b) => {
    return new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime();
  });

  return result;
}

export function hasActiveOpenFilters(filters: OpenTaskFilters): boolean {
  return filters.text !== '' || filters.label !== null || filters.duration !== 'all' || filters.due !== 'all';
}

export function hasActiveHistoryFilters(filters: HistoryFilters): boolean {
  return filters.text !== '' || filters.label !== null || filters.completedFrom !== null || filters.completedTo !== null;
}
