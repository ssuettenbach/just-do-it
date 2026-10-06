import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeLabels } from '../../domain/labels';
import { validateTaskInput } from '../../domain/taskFactory';
import type { Task, TaskInput } from '../../domain/types';
import { Button } from "../Button";
import { LabelInput } from "./LabelInput";

const ESTIMATE_PRESETS = [5, 15, 30, 45];
const DEFAULT_ESTIMATE = ESTIMATE_PRESETS[0];

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: Task;
  knownLabels: string[];
  onSubmit: (input: TaskInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function TaskForm({mode, task, knownLabels, onSubmit, isSubmitting = false}: TaskFormProps) {
  const navigate = useNavigate();
  const titleId = useId();
  const estimateId = useId();
  const dueDateId = useId();
  const notesId = useId();

  const [input, setInput] = useState<TaskInput>({
    title: '',
    estimateMinutes: DEFAULT_ESTIMATE,
    dueDate: null,
    notes: '',
    labels: [],
  });

  const [errors, setErrors] = useState<Partial<Record<'title' | 'estimateMinutes' | 'dueDate', string>>>({});

  const titleRef = useRef<HTMLInputElement>(null);
  const estimateRef = useRef<HTMLSelectElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit' && task) {
      setInput({
        title: task.title,
        estimateMinutes: task.estimateMinutes,
        dueDate: task.dueDate,
        notes: task.notes,
        labels: [...task.labels],
      });
    }
  }, [mode, task]);

  const handleChange = (field: keyof TaskInput, value: string | number | null) => {
    setInput((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEstimateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    handleChange('estimateMinutes', value === '' ? null : parseInt(value, 10));
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange('dueDate', value === '' ? null : value);
  };

  const handleLabelsChange = (labels: string[]) => {
    setInput((prev) => ({
      ...prev,
      labels: labels,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedInput: TaskInput = {
      ...input,
      title: input.title.trim(),
      labels: normalizeLabels(input.labels),
    };

    const validationErrors = validateTaskInput(normalizedInput);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0] as keyof typeof validationErrors;
      if (firstErrorField === 'title') {
        titleRef.current?.focus();
      } else if (firstErrorField === 'estimateMinutes') {
        estimateRef.current?.focus();
      } else if (firstErrorField === 'dueDate') {
        dueDateRef.current?.focus();
      }
      return;
    }

    await onSubmit(normalizedInput);
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/manage');
    }
  };

  const isLegacyEstimate = input.estimateMinutes === null || !ESTIMATE_PRESETS.includes(input.estimateMinutes);
  const hasEstimateError = errors.estimateMinutes !== undefined;
  const estimateErrorId = `${estimateId}-error`;
  const hasDueDateError = errors.dueDate !== undefined;
  const dueDateErrorId = `${dueDateId}-error`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor={titleId} className="block text-sm font-medium text-fg-soft mb-1">
          Titel
        </label>
        <input
          id={titleId}
          ref={titleRef}
          type="text"
          value={input.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          aria-required="true"
          aria-invalid={errors.title !== undefined}
          aria-describedby={errors.title ? `${titleId}-error` : undefined}
          className={`w-full rounded-lg bg-surface-muted border ${errors.title ? 'border-red-600 dark:border-red-400' : 'border-border-strong'} px-3 py-2 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent`}
        />
        {errors.title && (
          <p id={`${titleId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={estimateId} className="block text-sm font-medium text-fg-soft mb-1">
          Schätzung (Minuten)
        </label>
        <select
          id={estimateId}
          ref={estimateRef}
          value={input.estimateMinutes ?? ''}
          onChange={handleEstimateChange}
          aria-invalid={hasEstimateError}
          aria-describedby={hasEstimateError ? estimateErrorId : undefined}
          className={`w-full rounded-lg bg-surface-muted border ${hasEstimateError ? 'border-red-600 dark:border-red-400' : 'border-border-strong'} px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent`}
        >
          {isLegacyEstimate && (
            <option value={input.estimateMinutes ?? ''}>
              {input.estimateMinutes === null ? 'Keine Schätzung' : `${input.estimateMinutes} Minuten`}
            </option>
          )}
          {ESTIMATE_PRESETS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} Minuten
            </option>
          ))}
        </select>
        {hasEstimateError && (
          <p id={estimateErrorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.estimateMinutes}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={dueDateId} className="block text-sm font-medium text-fg-soft mb-1">
          Fälligkeitsdatum
        </label>
        <input
          id={dueDateId}
          ref={dueDateRef}
          type="date"
          value={input.dueDate ?? ''}
          onChange={handleDueDateChange}
          aria-invalid={hasDueDateError}
          aria-describedby={hasDueDateError ? dueDateErrorId : undefined}
          className={`w-full rounded-lg bg-surface-muted border ${hasDueDateError ? 'border-red-600 dark:border-red-400' : 'border-border-strong'} px-3 py-2 text-fg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent [color-scheme:dark]`}
        />
        {hasDueDateError && (
          <p id={dueDateErrorId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.dueDate}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={notesId} className="block text-sm font-medium text-fg-soft mb-1">
          Notizen
        </label>
        <textarea
          id={notesId}
          value={input.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-surface-muted border border-border-strong px-3 py-2 text-fg placeholder:text-fg-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent resize-none"
        />
      </div>

      <div>
        <LabelInput labels={input.labels} onChange={handleLabelsChange} knownLabels={knownLabels}/>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="secondary" onClick={handleCancel} type="button" disabled={isSubmitting}>
          Abbrechen
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          Speichern
        </Button>
      </div>
    </form>
  );
}
