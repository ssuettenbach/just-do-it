interface TaskSearchInputProps {
  id: string;
  value: string;
  onChange: (text: string) => void;
}

export function TaskSearchInput({id, value, onChange}: TaskSearchInputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-fg-muted mb-1">
        Suche
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Aufgaben durchsuchen..."
        className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-focus"
      />
    </div>
  );
}
