import { Button } from '../Button';
import { Icon } from '../Icon';
import resetIcon from '../../images/reset.svg';
import { todayLocal } from '../../domain/dates';
import type { OpenTaskFilters } from '../../domain/types';

interface OpenFilterPanelProps {
  filters: OpenTaskFilters;
  knownLabels: string[];
  onChange: (filter: Partial<OpenTaskFilters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function OpenFilterPanel({ filters, knownLabels, onChange, onClear, hasActiveFilters }: OpenFilterPanelProps) {
  const today = todayLocal();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="open-label" className="block text-sm font-medium text-fg-muted mb-1">
          Kennzeichnung
        </label>
        <select
          id="open-label"
          value={filters.label || ''}
          onChange={(e) => onChange({ label: e.target.value || null })}
          className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus"
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
        <label htmlFor="open-duration" className="block text-sm font-medium text-fg-muted mb-1">
          Dauer
        </label>
        <select
          id="open-duration"
          value={filters.duration}
          onChange={(e) => onChange({ duration: e.target.value as OpenTaskFilters['duration'] })}
          className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus"
        >
          <option value="all">Alle</option>
          <option value="quick">Schnell (&le;5 Min)</option>
          <option value="medium">Mittel (6-29 Min)</option>
          <option value="big">Groß (&ge;30 Min)</option>
          <option value="unestimated">Keine Schätzung</option>
        </select>
      </div>

      <div>
        <label htmlFor="open-due" className="block text-sm font-medium text-fg-muted mb-1">
          Fälligkeit
        </label>
        <select
          id="open-due"
          value={filters.due}
          onChange={(e) => onChange({ due: e.target.value as OpenTaskFilters['due'] })}
          className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus"
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
          <Icon src={resetIcon} />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}