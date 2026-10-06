import {PageHeader, DataInfoSection, ExportSection, ImportSection, ThemeSection} from '../components';
import {useBackup} from '../hooks';

export default function SettingsPage() {
    const backup = useBackup();

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <PageHeader title="Einstellungen" backTo="/manage"/>
            <main className="space-y-6">
                <ThemeSection/>
                <DataInfoSection/>
                <ExportSection backup={backup}/>
                <ImportSection backup={backup}/>
                <section className="text-center text-fg-muted text-sm">
                    Funktioniert offline nach dem ersten Laden
                </section>
            </main>
        </div>
    );
}
