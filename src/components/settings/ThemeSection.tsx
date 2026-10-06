import { useTheme } from '../../hooks/useTheme';

export function ThemeSection() {
  const { preference, resolvedTheme, setPreference } = useTheme();

  const options = [
    { value: 'light', label: 'Hell', icon: SunIcon },
    { value: 'dark', label: 'Dunkel', icon: MoonIcon },
    { value: 'system', label: 'System', icon: MonitorIcon },
  ] as const;

  const selectedIndex = options.findIndex((o) => o.value === preference);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = index <= 0 ? options.length - 1 : index - 1;
      setPreference(options[newIndex].value);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = index >= options.length - 1 ? 0 : index + 1;
      setPreference(options[newIndex].value);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPreference(options[0].value);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPreference(options[options.length - 1].value);
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-medium text-fg mb-3">Darstellung</h2>
      <div className="space-y-3">
        <div
          role="radiogroup"
          aria-label="Farbschema"
          className="flex rounded-lg bg-surface-muted p-1"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setPreference(option.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-4 rounded-md transition-colors ${
                  isSelected
                    ? 'bg-accent text-accent-fg'
                    : 'bg-surface-muted text-fg-soft hover:bg-surface-strong'
                }`}
              >
                <Icon className="w-5 h-5" stroke="currentColor" aria-hidden />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
        {preference === 'system' && (
          <p className="text-sm text-fg-muted">
            Folgt der Systemeinstellung (aktuell: {resolvedTheme === 'dark' ? 'Dunkel' : 'Hell'})
          </p>
        )}
      </div>
    </section>
  );
}

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
