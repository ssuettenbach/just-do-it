export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'justdoit.theme';
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#f8fafc',
  dark: '#020617',
};

type Listener = () => void;
type ThemeState = { preference: ThemePreference; resolvedTheme: ResolvedTheme };

let preference: ThemePreference = 'system';
let resolvedTheme: ResolvedTheme = 'dark';
let state: ThemeState = {preference, resolvedTheme};
const SERVER_SNAPSHOT: ThemeState = {preference: 'system', resolvedTheme: 'dark'};
const listeners = new Set<Listener>();
let initialized = false;

function applyTheme(resolved: ResolvedTheme) {
  const html = document.documentElement;

  if (resolved === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  html.style.colorScheme = resolved;

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', THEME_COLORS[resolved]);
  }
}

function updateState(newPreference: ThemePreference, newResolved: ResolvedTheme) {
  if (newPreference !== preference || newResolved !== resolvedTheme) {
    preference = newPreference;
    resolvedTheme = newResolved;
    state = {preference, resolvedTheme};
  }
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark';
  }

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') {
    return getSystemTheme();
  }
  return pref;
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage not available or access denied
  }
  return 'system';
}

export function getPreference(): ThemePreference {
  return preference;
}

export function getResolvedTheme(): ResolvedTheme {
  return resolvedTheme;
}

export function setPreference(newPreference: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, newPreference);
  } catch {
    // localStorage not available or quota exceeded
  }

  const resolved = resolveTheme(newPreference);
  const prevResolved = resolvedTheme;
  updateState(newPreference, resolved);

  if (resolved !== prevResolved) {
    applyTheme(resolvedTheme);
  }

  notifyListeners();
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);

  if (!initialized) {
    initializeListeners();
  }

  return () => {
    listeners.delete(listener);
  };
}

function initializeListeners() {
  if (initialized) return;
  initialized = true;

  if (typeof window === 'undefined') return;

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (preference === 'system') {
        const newResolved = getSystemTheme();
        if (newResolved !== resolvedTheme) {
          updateState(preference, newResolved);
          applyTheme(resolvedTheme);
          notifyListeners();
        }
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }

  window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY) {
      const newPreference = readPreference();
      if (newPreference !== preference) {
        const newResolved = resolveTheme(newPreference);
        updateState(newPreference, newResolved);
        if (newResolved !== resolvedTheme) {
          applyTheme(resolvedTheme);
        }
        notifyListeners();
      }
    }
  });
}

export function initTheme() {
  preference = readPreference();
  resolvedTheme = resolveTheme(preference);
  state = {preference, resolvedTheme};
  applyTheme(resolvedTheme);
  initializeListeners();
}

export function getSnapshot(): ThemeState {
  return state;
}

export function getServerSnapshot(): ThemeState {
  return SERVER_SNAPSHOT;
}
