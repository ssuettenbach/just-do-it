export function DataInfoSection() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium text-fg mb-3">Deine Daten bleiben auf diesem Gerät</h2>
      <div className="space-y-2 text-fg-muted text-sm">
        <p>
          Aufgaben werden ausschließlich im lokalen Speicher (IndexedDB) dieses Browsers auf diesem
          Gerät gespeichert. Es gibt kein Konto, keinen Server, keine Synchronisierung und keine Analyse.
        </p>
        <p>Daten bleiben nach dem Schließen der App und nach Updates erhalten.</p>
        <p className="text-amber-400">
          Daten gehen VERLOREN, wenn Website-/Browserdaten gelöscht, der Browser oder die App
          zurückgesetzt oder deinstalliert wird oder das Gerät verloren geht.
        </p>
        <p>Wir empfehlen, regelmäßig ein Backup zu exportieren.</p>
      </div>
    </section>
  );
}
