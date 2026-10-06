import type { ReactNode } from 'react';

interface LabelChipsProps {
  labels: string[];
  onRemove?: (label: string) => void;
}

export function LabelChips({ labels, onRemove }: LabelChipsProps) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 text-xs font-medium"
        >
          {label}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(label)}
              aria-label={`Kennzeichnung ${label} entfernen`}
              className="ml-1.5 text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
