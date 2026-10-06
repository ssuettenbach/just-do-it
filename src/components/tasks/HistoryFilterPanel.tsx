import type { HistoryFilters } from '../../domain/types';
import resetIcon from '../../images/reset.svg';
import { Button } from '../Button';
import { Icon } from '../Icon';

interface HistoryFilterPanelProps {
  filters: HistoryFilters;
  knownLabels: string[];
  onChange: (filter: Partial<HistoryFilters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function HistoryFilterPanel({
                                     filters,
                                     knownLabels,
                                     onChange,
                                     onClear,
                                     hasActiveFilters
                                   }: HistoryFilterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="history-label" className="block text-sm font-medium text-fg-muted mb-1">
          Kennzeichnung
        </label>
        <select
          id="history-label"
          value={filters.label || ''}
          onChange={(e) => onChange({label: e.target.value || null})}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="history-from" className="block text-sm font-medium text-fg-muted mb-1">
            Erledigt ab
          </label>
          <input
            id="history-from"
            type="date"
            value={filters.completedFrom || ''}
            onChange={(e) => onChange({completedFrom: e.target.value || null})}
            className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="history-to" className="block text-sm font-medium text-fg-muted mb-1">
            Erledigt bis
          </label>
          <input
            id="history-to"
            type="date"
            value={filters.completedTo || ''}
            onChange={(e) => onChange({completedTo: e.target.value || null})}
            className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus [color-scheme:dark]"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={onClear} className="w-full">
          <Icon src={resetIcon}/>
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}