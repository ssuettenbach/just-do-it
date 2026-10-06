import type { Task } from '../domain/types';
import { isValidDateOnly, isValidIsoTimestamp, todayLocal } from '../domain/dates';
import { normalizeLabels } from '../domain/labels';

export const BACKUP_FORMAT = 'just-do-it-backup' as const;
export const BACKUP_VERSION = 1;

export interface BackupDocument {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  tasks: Task[];
}

export type ValidationResult = { ok: true; tasks: Task[] } | { ok: false; errors: string[] };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function validateTaskRecord(raw: unknown, seenIds: Set<string>): string[] {
  const errors: string[] = [];

  if (!isRecord(raw)) {
    errors.push('muss ein Objekt sein');
    return errors;
  }

  const task = raw;

  if (typeof task.id !== 'string' || task.id === '') {
    errors.push('id muss ein nicht leerer String sein');
  } else if (seenIds.has(task.id)) {
    errors.push('id ist dupliziert');
  } else {
    seenIds.add(task.id);
  }

  if (typeof task.title !== 'string' || task.title === '' || typeof task.title === 'string' && task.title.trim() === '') {
    errors.push('Titel muss ein nicht leerer String sein');
  }

  if (task.estimateMinutes !== null && task.estimateMinutes !== undefined) {
    if (!Number.isInteger(task.estimateMinutes) || task.estimateMinutes < 0) {
      errors.push('estimateMinutes muss null oder eine nicht negative Ganzzahl sein');
    }
  } else if (task.estimateMinutes === undefined) {
    errors.push('estimateMinutes muss null oder eine nicht negative Ganzzahl sein');
  }

  if (task.dueDate !== null && task.dueDate !== undefined) {
    if (!isValidDateOnly(task.dueDate as string)) {
      errors.push('dueDate muss null oder gültig im Format JJJJ-MM-TT sein');
    }
  } else if (task.dueDate === undefined) {
    errors.push('dueDate muss null oder gültig im Format JJJJ-MM-TT sein');
  }

  if (typeof task.notes !== 'string') {
    errors.push('notes muss ein String sein');
  }

  if (!Array.isArray(task.labels) || !task.labels.every((l: unknown) => typeof l === 'string')) {
    errors.push('labels muss ein Array aus Strings sein');
  }

  if (task.status !== 'open' && task.status !== 'completed') {
    errors.push("status muss 'open' oder 'completed' sein");
  }

  if (!isValidIsoTimestamp(task.createdAt as string)) {
    errors.push('createdAt muss ein gültiger ISO-Zeitstempel sein');
  }

  if (!isValidIsoTimestamp(task.updatedAt as string)) {
    errors.push('updatedAt muss ein gültiger ISO-Zeitstempel sein');
  }

  if (task.status === 'completed') {
    if (!isValidIsoTimestamp(task.completedAt as string)) {
      errors.push('completedAt muss ein gültiger ISO-Zeitstempel sein, wenn der Status completed ist');
    }
  } else {
    if (task.completedAt !== null && task.completedAt !== undefined) {
      errors.push('completedAt muss null sein, wenn der Status open ist');
    } else if (task.completedAt === undefined) {
      errors.push('completedAt muss null sein, wenn der Status open ist');
    }
  }

  return errors;
}

export function createBackup(tasks: Task[], now: Date = new Date()): BackupDocument {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    tasks: tasks.map((t) => ({ ...t })),
  };
}

export function serializeBackup(doc: BackupDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function backupFileName(now: Date = new Date()): string {
  const date = todayLocal(now);
  return `just-do-it-backup-${date}.json`;
}

export function parseAndValidateBackup(text: string): ValidationResult {
  let doc: unknown;

  try {
    doc = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: ['Ungültiges JSON'] };
  }

  if (!isRecord(doc)) {
    return { ok: false, errors: ['Die Wurzel muss ein Objekt sein'] };
  }

  if (doc.format !== BACKUP_FORMAT) {
    return { ok: false, errors: [`Ungültiges Format. Erwartet '${BACKUP_FORMAT}', erhalten '${doc.format}'`] };
  }

  if (doc.version !== BACKUP_VERSION) {
    return {
      ok: false,
      errors: [`Nicht unterstützte Backup-Version ${doc.version}. Diese App unterstützt Version ${BACKUP_VERSION}`],
    };
  }

  if (!Array.isArray(doc.tasks)) {
    return { ok: false, errors: ['tasks muss ein Array sein'] };
  }

  const seenIds = new Set<string>();
  const MAX_ERRORS = 20;

  const allErrors = doc.tasks.flatMap((raw: unknown, index: number) => {
    const taskErrors = validateTaskRecord(raw, seenIds);
    return taskErrors.map((err) => `Aufgabe ${index + 1}: ${err}`);
  });

  if (allErrors.length > 0) {
    const sliced = allErrors.slice(0, MAX_ERRORS);
    if (allErrors.length > MAX_ERRORS) {
      sliced.push(`... und ${allErrors.length - MAX_ERRORS} weitere Fehler`);
    }
    return { ok: false, errors: sliced };
  }

  const validatedTasks: Task[] = doc.tasks.map((raw: unknown) => {
    const task = raw as Record<string, unknown>;
    return {
      id: task.id as string,
      title: (task.title as string).trim(),
      estimateMinutes: task.estimateMinutes as number | null,
      dueDate: task.dueDate as string | null,
      notes: task.notes as string,
      labels: normalizeLabels(task.labels as string[]),
      status: task.status as 'open' | 'completed',
      createdAt: task.createdAt as string,
      updatedAt: task.updatedAt as string,
      completedAt: task.completedAt as string | null,
    };
  });

  return { ok: true, tasks: validatedTasks };
}
