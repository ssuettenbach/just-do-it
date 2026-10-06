import { useState } from 'react';
import { Button } from '../Button';
import type { ReturnType } from '../../hooks/useBackup';

interface ExportSectionProps {
  backup: ReturnType<typeof import('../../hooks/useBackup').useBackup>;
}

export function ExportSection({ backup }: ExportSectionProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setStatus(null);

    try {
      const { fileName, json } = await backup.exportBackup();
      backup.downloadBackup(fileName, json);
       setStatus(`Backup als ${fileName} gespeichert`);
     } catch (e) {
       const message = e instanceof Error ? e.message : 'Unbekannter Fehler';
       setError(`Das Backup konnte nicht erstellt werden. ${message}`);
     }
   };
 
   return (
     <section className="mb-8">
       <h2 className="text-lg font-medium text-slate-200 mb-3">Backup exportieren</h2>
       <div className="space-y-3">
         <Button onClick={handleExport} size="lg">
           Backup exportieren
         </Button>
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
      </div>
    </section>
  );
}
