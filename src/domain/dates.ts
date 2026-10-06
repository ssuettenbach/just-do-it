import type { DueStatus } from './types';

export function todayLocal(now?: Date): string {
  const d = now || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateOnly(s: string): boolean {
  if (!s || typeof s !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;

  const [yearStr, monthStr, dayStr] = s.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function isValidIsoTimestamp(s: string): boolean {
  if (!s || typeof s !== 'string') return false;
  try {
    const d = new Date(s);
    return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === s;
  } catch {
    return false;
  }
}

export function toLocalDate(iso: string): string {
  if (!isValidIsoTimestamp(iso)) {
    throw new Error(`Invalid ISO timestamp: ${iso}`);
  }
  const d = new Date(iso);
  return todayLocal(d);
}

export function getDueStatus(dueDate: string | null, today?: string): DueStatus {
  if (!dueDate) return 'none';

  const todayStr = today || todayLocal();
  if (dueDate < todayStr) return 'overdue';
  if (dueDate === todayStr) return 'today';
  return 'upcoming';
}
