import { useSyncExternalStore } from 'react';
import { getResolvedTheme, getServerSnapshot, getSnapshot, setPreference, subscribe } from '../theme/themeStore';

export function useTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const current = getResolvedTheme();
    setPreference(current === 'dark' ? 'light' : 'dark');
  };

  return {
    preference: snapshot.preference,
    resolvedTheme: snapshot.resolvedTheme,
    setPreference,
    toggle,
  };
}
