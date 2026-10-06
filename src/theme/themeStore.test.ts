import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initTheme,
  getPreference,
  getResolvedTheme,
  setPreference,
  subscribe,
  getSnapshot,
  THEME_STORAGE_KEY,
  THEME_COLORS,
} from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    let metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    } else {
      metaThemeColor.setAttribute('content', '');
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.remove();
    }
  });

  describe('initTheme', () => {
    it('defaults to system when storage is empty', () => {
      localStorage.removeItem(THEME_STORAGE_KEY);
      initTheme();
      expect(getPreference()).toBe('system');
    });

    it('defaults to system when storage has invalid value', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'invalid');
      initTheme();
      expect(getPreference()).toBe('system');
    });

    it('reads persisted value from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      initTheme();
      expect(getPreference()).toBe('dark');
    });

    it('reads light preference from localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      initTheme();
      expect(getPreference()).toBe('light');
    });
  });

  describe('setPreference', () => {
    beforeEach(() => {
      initTheme();
    });

    it('persists value to localStorage', () => {
      setPreference('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    });

    it('toggles dark class on documentElement when setting dark', () => {
      setPreference('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class from documentElement when setting light', () => {
      setPreference('dark');
      setPreference('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('sets colorScheme on documentElement', () => {
      setPreference('light');
      expect(document.documentElement.style.colorScheme).toBe('light');
      setPreference('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('updates theme-color meta tag', () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');

      setPreference('light');
      expect(metaThemeColor?.getAttribute('content')).toBe(THEME_COLORS.light);

      setPreference('dark');
      expect(metaThemeColor?.getAttribute('content')).toBe(THEME_COLORS.dark);
    });
  });

  describe('system theme resolution', () => {
    beforeEach(() => {
      initTheme();
    });

    it('resolves system preference to dark when matchMedia prefers dark', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      setPreference('system');
      expect(getResolvedTheme()).toBe('dark');

      window.matchMedia = originalMatchMedia;
    });

    it('resolves system preference to light when matchMedia prefers light', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      setPreference('system');
      expect(getResolvedTheme()).toBe('light');

      window.matchMedia = originalMatchMedia;
    });

    it('resolves light preference to light regardless of system', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      setPreference('light');
      expect(getResolvedTheme()).toBe('light');

      window.matchMedia = originalMatchMedia;
    });

    it('resolves dark preference to dark regardless of system', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      setPreference('dark');
      expect(getResolvedTheme()).toBe('dark');

      window.matchMedia = originalMatchMedia;
    });
  });

  describe('subscribe', () => {
    beforeEach(() => {
      initTheme();
    });

    it('notifies subscribers when preference changes', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      setPreference('light');
      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it('unsubscribe works', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      unsubscribe();
      setPreference('light');
      expect(listener).not.toHaveBeenCalled();
    });

    it('subscribers receive updated snapshot', () => {
      let snapshot = getSnapshot();
      const listener = () => {
        snapshot = getSnapshot();
      };

      subscribe(listener);
      setPreference('dark');

      expect(snapshot.preference).toBe('dark');
      expect(snapshot.resolvedTheme).toBe('dark');
    });
  });

  describe('storage event', () => {
    beforeEach(() => {
      initTheme();
    });

    it('triggers update when storage event fires for theme key', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      const event = new StorageEvent('storage', {
        key: THEME_STORAGE_KEY,
        newValue: 'light',
        oldValue: 'dark',
      });

      window.dispatchEvent(event);
      expect(listener).toHaveBeenCalled();
      
      unsubscribe();
    });

    it('does not trigger update for unrelated storage events', () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      const event = new StorageEvent('storage', {
        key: 'other.key',
        newValue: 'value',
      });

      window.dispatchEvent(event);
      expect(listener).not.toHaveBeenCalled();
      
      unsubscribe();
    });
  });
});
