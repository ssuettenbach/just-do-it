import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as themeStore from '../theme/themeStore';

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  it('returns preference from store', () => {
    themeStore.initTheme();
    themeStore.setPreference('dark');
    const snapshot = themeStore.getSnapshot();
    expect(snapshot.preference).toBe('dark');
  });

  it('returns resolvedTheme from store', () => {
    themeStore.initTheme();
    themeStore.setPreference('light');
    const snapshot = themeStore.getSnapshot();
    expect(snapshot.resolvedTheme).toBe('light');
  });

  it('setPreference updates the store', () => {
    themeStore.initTheme();
    themeStore.setPreference('light');
    expect(themeStore.getPreference()).toBe('light');
    expect(localStorage.getItem('justdoit.theme')).toBe('light');
  });

  it('toggle flips from light to dark', () => {
    themeStore.initTheme();
    themeStore.setPreference('light');
    const current = themeStore.getResolvedTheme();
    themeStore.setPreference(current === 'dark' ? 'light' : 'dark');
    expect(themeStore.getPreference()).toBe('dark');
    expect(themeStore.getResolvedTheme()).toBe('dark');
  });

  it('toggle flips from dark to light', () => {
    themeStore.initTheme();
    themeStore.setPreference('dark');
    const current = themeStore.getResolvedTheme();
    themeStore.setPreference(current === 'dark' ? 'light' : 'dark');
    expect(themeStore.getPreference()).toBe('light');
    expect(themeStore.getResolvedTheme()).toBe('light');
  });

  it('exposes setPreference function', () => {
    themeStore.initTheme();
    expect(typeof themeStore.setPreference).toBe('function');
  });
});
