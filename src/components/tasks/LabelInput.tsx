import { useState, useRef, useId, KeyboardEvent, ChangeEvent } from 'react';
import { LabelChips } from '../LabelChips';
import { normalizeLabels } from '../../domain/labels';

interface LabelInputProps {
  labels: string[];
  onChange: (labels: string[]) => void;
  knownLabels: string[];
}

export function LabelInput({ labels, onChange, knownLabels }: LabelInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const datalistId = useId();

  const handleAddLabel = () => {
    if (inputValue.trim() === '') return;

    const newLabels = normalizeLabels([...labels, inputValue]);
    onChange(newLabels);
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleRemove = (labelToRemove: string) => {
    const newLabels = labels.filter((l) => l !== labelToRemove);
    onChange(newLabels);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
        Kennzeichnung hinzufügen
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          list={datalistId}
          placeholder="Eingeben und Enter oder Komma drücken"
          className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <datalist id={datalistId}>
          {knownLabels.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={handleAddLabel}
          disabled={inputValue.trim() === ''}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Hinzufügen
        </button>
      </div>
      {labels.length > 0 && (
        <div className="mt-1">
          <LabelChips labels={labels} onRemove={handleRemove} />
        </div>
      )}
    </div>
  );
}
