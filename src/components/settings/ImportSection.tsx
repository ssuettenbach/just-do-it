import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '../Button';
import { ConfirmDialog } from '../ConfirmDialog';
import { readFileText } from './readFileText';
import type { Task } from '../../domain/types';
import type { ValidationResult } from '../../backup/backup';

interface ImportSectionProps {
  backup: ReturnType<typeof import('../../hooks/useBackup').useBackup>;
}

interface ImportState {
  type: 'idle' | 'reading' | 'valid' | 'invalid';
  fileName?: string;
  validationResult?: ValidationResult;
}

export function ImportSection({ backup }: ImportSectionProps) {
  const [importState, setImportState] = useState<ImportState>({ type: 'idle' });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetImport = () => {
    setImportState({ type: 'idle' });
    setStatus(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      resetImport();
      return;
    }

    setError(null);
    setStatus(null);
    setImportState({ type: 'reading', fileName: file.name });

    try {
      const text = await readFileText(file);
      const result = backup.validateBackup(text);
      setImportState({ type: result.ok ? 'valid' : 'invalid', validationResult: result });
    } catch (e) {
      setError('Die Datei konnte nicht gelesen werden.');
      setImportState({ type: 'idle' });
    }
  };

  const handleReplaceAll = async () => {
    const result = importState.validationResult;
    if (result?.ok !== true) return;

    setShowReplaceDialog(true);
  };

  const handleReplaceConfirm = async () => {
    const result = importState.validationResult;
    if (result?.ok !== true) return;

    setShowReplaceDialog(false);
    setError(null);

    try {
      const count = await backup.replaceAll(result.tasks);
      setStatus(`Alle Daten wurden durch ${count} Aufgaben ersetzt.`);
      resetImport();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unbekannter Fehler';
      setError(`Der Import ist fehlgeschlagen. Deine vorhandenen Daten wurden nicht geändert. ${message}`);
      resetImport();
    }
  };

  const handleMerge = async () => {
    const result = importState.validationResult;
    if (result?.ok !== true) return;

    setError(null);
    setStatus(null);

    try {
      const { imported, skipped } = await backup.merge(result.tasks);
      setStatus(`${imported} Aufgaben importiert, ${skipped} bereits vorhandene übersprungen.`);
      resetImport();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unbekannter Fehler';
      setError(`Der Import ist fehlgeschlagen. Deine vorhandenen Daten wurden nicht geändert. ${message}`);
      resetImport();
    }
  };

  const getTaskCounts = (tasks: Task[]) => {
    const open = tasks.filter((t) => t.status === 'open').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return { total: tasks.length, open, completed };
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium text-slate-200 mb-3">Backup importieren</h2>
      <div className="space-y-3">
        <label className="block">
          <span className="text-slate-300 mb-2 block">Backup-Datei auswählen</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            disabled={importState.type === 'reading'}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 cursor-pointer"
          />
        </label>

        {importState.type === 'invalid' && importState.validationResult && (
          <div role="alert" className="text-red-400 text-sm space-y-1">
            <p>Diese Datei kann nicht importiert werden.</p>
            <ul className="list-disc list-inside">
              {importState.validationResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {importState.type === 'valid' && importState.validationResult?.ok && (
          <div className="space-y-3">
            <p className="text-slate-300">
              {(() => {
                const { total, open, completed } = getTaskCounts(importState.validationResult.tasks);
                return `${total} Aufgaben gefunden (${open} offen, ${completed} erledigt)`;
              })()}
            </p>
            <div className="space-y-2 text-slate-400 text-sm">
              <p>
                <strong className="text-slate-200">Alle Daten ersetzen</strong> löscht alle
                aktuellen Aufgaben und ersetzt sie durch das Backup.
              </p>
              <p>
                <strong className="text-slate-200">Zusammenführen</strong> fügt nur noch nicht
                vorhandene Aufgaben hinzu und lässt bestehende Aufgaben unverändert.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleReplaceAll} size="lg">
                Alle Daten ersetzen
              </Button>
              <Button variant="secondary" onClick={handleMerge} size="lg">
                Zusammenführen
              </Button>
            </div>
          </div>
        )}

        {status && (
          <div role="status" className="text-green-400 text-sm">
            {status}
          </div>
        )}
        {error && (
          <div role="alert" className="text-red-400 text-sm">
            {error}
          </div>
        )}

        {importState.type === 'reading' && (
          <div role="status" className="text-slate-400 text-sm">
            Datei wird gelesen...
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showReplaceDialog}
        title="Alle Daten ersetzen?"
        message={`Alle aktuellen Aufgaben inklusive Verlauf werden dauerhaft durch die ${importState.validationResult?.ok ? importState.validationResult.tasks.length : 0} Aufgaben aus dem Backup ersetzt.`}
        confirmLabel="Alle Daten ersetzen"
        cancelLabel="Abbrechen"
        destructive
        onConfirm={handleReplaceConfirm}
        onCancel={() => setShowReplaceDialog(false)}
      />
    </section>
  );
}
