import { isValidDateOnly } from './dates';
import { normalizeLabels } from './labels';
import type { Task, TaskInput } from './types';

export function validateTaskInput(input: TaskInput): Partial<Record<'title' | 'estimateMinutes' | 'dueDate', string>> {
  const errors: Partial<Record<'title' | 'estimateMinutes' | 'dueDate', string>> = {};

  const title = String(input.title || '').trim();
  if (!title) {
    errors.title = 'Titel ist erforderlich';
  }

  if (input.estimateMinutes !== null) {
    const est = input.estimateMinutes;
    if (typeof est !== 'number' || !Number.isInteger(est) || est < 0) {
      errors.estimateMinutes = 'Ganze Minuten eingeben (0 oder mehr)';
    }
  }

  if (input.dueDate !== null) {
    if (!isValidDateOnly(input.dueDate)) {
      errors.dueDate = 'Fälligkeitsdatum muss gültig im Format JJJJ-MM-TT sein';
    }
  }

  return errors;
}

export function createTask(input: TaskInput, now: Date = new Date()): Task {
  const errors = validateTaskInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(`Invalid task input: ${JSON.stringify(errors)}`);
  }

  const now_iso = now.toISOString();

  return {
    id: crypto.randomUUID(),
    title: String(input.title).trim(),
    estimateMinutes: input.estimateMinutes,
    dueDate: input.dueDate,
    notes: String(input.notes || ''),
    labels: normalizeLabels(input.labels || []),
    status: 'open',
    createdAt: now_iso,
    updatedAt: now_iso,
    completedAt: null,
  };
}

export function applyUpdate(task: Task, input: TaskInput, now: Date = new Date()): Task {
  const errors = validateTaskInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(`Invalid task input: ${JSON.stringify(errors)}`);
  }

  const now_iso = now.toISOString();

  return {
    ...task,
    title: String(input.title).trim(),
    estimateMinutes: input.estimateMinutes,
    dueDate: input.dueDate,
    notes: String(input.notes || ''),
    labels: normalizeLabels(input.labels || []),
    updatedAt: now_iso,
  };
}

export function completeTask(task: Task, now: Date = new Date()): Task {
  if (task.status === 'completed') return task;

  const now_iso = now.toISOString();

  return {
    ...task,
    status: 'completed',
    completedAt: now_iso,
    updatedAt: now_iso,
  };
}

export function reopenTask(task: Task, now: Date = new Date()): Task {
  if (task.status === 'open') return task;

  const now_iso = now.toISOString();

  return {
    ...task,
    status: 'open',
    completedAt: null,
    updatedAt: now_iso,
  };
}
