import { PageHeader } from '../components/PageHeader';
import { DataInfoSection } from '../components/settings/DataInfoSection';
import { ExportSection } from '../components/settings/ExportSection';
import { ImportSection } from '../components/settings/ImportSection';
import { ThemeSection } from '../components/settings/ThemeSection';
import { useBackup } from '../hooks/useBackup';

export default function SettingsPage() {
  const backup = useBackup();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <PageHeader title="Einstellungen" backTo="/manage" />
      <main className="space-y-6">
        <ThemeSection />
        <DataInfoSection />
        <ExportSection backup={backup} />
        <ImportSection backup={backup} />
        <section className="text-center text-fg-muted text-sm">
          Funktioniert offline nach dem ersten Laden
        </section>
      </main>
    </div>
  );
}
