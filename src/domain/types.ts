export type TaskStatus = 'open' | 'completed';

export interface Task {
  id: string;
  title: string;
  estimateMinutes: number | null;
  dueDate: string | null;
  notes: string;
  labels: string[];
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export type TaskInput = {
  title: string;
  estimateMinutes: number | null;
  dueDate: string | null;
  notes: string;
  labels: string[];
};

export type PickCategory = 'quick' | 'any' | 'big';

export type DueStatus = 'overdue' | 'today' | 'upcoming' | 'none';

export type DurationFilter = 'all' | 'quick' | 'medium' | 'big' | 'unestimated';

export type DueFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'none';

export interface OpenTaskFilters {
  text: string;
  label: string | null;
  duration: DurationFilter;
  due: DueFilter;
}

export interface HistoryFilters {
  text: string;
  label: string | null;
  completedFrom: string | null;
  completedTo: string | null;
}
