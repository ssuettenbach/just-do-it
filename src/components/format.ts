export const LOCALE = 'de-DE';

export function formatEstimate(min: number | null): string {
  if (min === null) return 'Keine Schätzung';
  if (min === 1) return '1 Min';
  return `${min} Min`;
}

export function formatDate(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-');
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return d.toLocaleDateString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(LOCALE, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
