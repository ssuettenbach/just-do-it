import { useSyncExternalStore } from 'react';
import { getSnapshot, getServerSnapshot, subscribe, setPreference, getResolvedTheme, type ThemePreference, type ResolvedTheme } from '../theme/themeStore';

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
