import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Mock } from '../../test/_mocks/Mock';
import { renderWithRouter } from '../../test/renderWithRouter';
import * as themeStore from '../../theme/themeStore';
import { ThemeSection } from './ThemeSection';

describe('ThemeSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders radiogroup with label "Farbschema"', () => {
    Mock.useTheme.mock();

    const {getByRole} = renderWithRouter(<ThemeSection/>);
    expect(getByRole('radiogroup', {name: 'Farbschema'})).toBeInTheDocument();
  });

  it('renders 3 radio buttons for light, dark, and system', () => {
    Mock.useTheme.mock();

    const {getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('renders radio buttons with correct labels', () => {
    Mock.useTheme.mock();

    const {getByText} = renderWithRouter(<ThemeSection/>);
    expect(getByText('Hell')).toBeInTheDocument();
    expect(getByText('Dunkel')).toBeInTheDocument();
    expect(getByText('System')).toBeInTheDocument();
  });

  it('aria-checked matches preference for light', () => {
    Mock.useTheme.mock({preference: 'light'});

    const {getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('aria-checked matches preference for dark', () => {
    Mock.useTheme.mock({preference: 'dark'});

    const {getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('aria-checked matches preference for system', () => {
    Mock.useTheme.mock({preference: 'system'});

    const {getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking "Dunkel" calls setPreference with dark', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock});

    const {user, getByText} = renderWithRouter(<ThemeSection/>);
    await user.click(getByText('Dunkel'));

    expect(setPreferenceMock).toHaveBeenCalledWith('dark');
  });

  it('clicking "Hell" calls setPreference with light', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock});

    const {user, getByText} = renderWithRouter(<ThemeSection/>);
    await user.click(getByText('Hell'));

    expect(setPreferenceMock).toHaveBeenCalledWith('light');
  });

  it('clicking "System" calls setPreference with system', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock});

    const {user, getByText} = renderWithRouter(<ThemeSection/>);
    await user.click(getByText('System'));

    expect(setPreferenceMock).toHaveBeenCalledWith('system');
  });

  it('ArrowRight keyboard nav calls setPreference with next value', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock, preference: 'light'});

    const {user, getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');

    await user.type(radios[0], '{ArrowRight}');

    expect(setPreferenceMock).toHaveBeenCalledWith('dark');
  });

  it('ArrowLeft keyboard nav calls setPreference with previous value', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock, preference: 'dark'});

    const {user, getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');

    await user.type(radios[1], '{ArrowLeft}');

    expect(setPreferenceMock).toHaveBeenCalledWith('light');
  });

  it('ArrowUp keyboard nav calls setPreference with previous value', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock, preference: 'system'});

    const {user, getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');

    await user.type(radios[2], '{ArrowUp}');

    expect(setPreferenceMock).toHaveBeenCalledWith('dark');
  });

  it('ArrowDown keyboard nav calls setPreference with next value', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock, preference: 'light'});

    const {user, getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');

    await user.type(radios[0], '{ArrowDown}');

    expect(setPreferenceMock).toHaveBeenCalledWith('dark');
  });

  it('Home keyboard nav calls setPreference with first value', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock, preference: 'system'});

    const {user, getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');

    await user.type(radios[2], '{Home}');

    expect(setPreferenceMock).toHaveBeenCalledWith('light');
  });

  it('End keyboard nav calls setPreference with last value', async () => {
    const setPreferenceMock = vi.fn();
    Mock.useTheme.mock({setPreference: setPreferenceMock, preference: 'light'});

    const {user, getAllByRole} = renderWithRouter(<ThemeSection/>);
    const radios = getAllByRole('radio');

    await user.type(radios[0], '{End}');

    expect(setPreferenceMock).toHaveBeenCalledWith('system');
  });

  it('shows helper text for system preference', () => {
    Mock.useTheme.mock({preference: 'system', resolvedTheme: 'dark'});

    const {getByText} = renderWithRouter(<ThemeSection/>);
    expect(getByText(/Folgt der Systemeinstellung/)).toBeInTheDocument();
    expect(getByText('Dunkel')).toBeInTheDocument();
  });

  it('shows helper text with light when system resolves to light', () => {
    Mock.useTheme.mock({preference: 'system', resolvedTheme: 'light'});

    const {getByText} = renderWithRouter(<ThemeSection/>);
    expect(getByText(/Folgt der Systemeinstellung/)).toBeInTheDocument();
    expect(getByText('Hell')).toBeInTheDocument();
  });

  it('does not show helper text when preference is not system', () => {
    Mock.useTheme.mock({preference: 'light'});

    const {queryByText} = renderWithRouter(<ThemeSection/>);
    expect(queryByText(/Folgt der Systemeinstellung/)).not.toBeInTheDocument();
  });
});

describe('ThemeSection - real hook integration', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
    themeStore.initTheme();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = '';
  });

  it('renders without throwing with real hook', () => {
    const {getByRole} = renderWithRouter(<ThemeSection/>);
    expect(getByRole('radiogroup', {name: 'Farbschema'})).toBeInTheDocument();
  });

  it('clicking Dunkel applies dark class and updates aria-checked', async () => {
    const {user, getAllByRole, getByText} = renderWithRouter(<ThemeSection/>);

    const button = getByText('Dunkel').closest('button');
    await user.click(button!);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    const radios = getAllByRole('radio');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('getSnapshot returns same reference on consecutive calls', () => {
    const snapshot1 = themeStore.getSnapshot();
    const snapshot2 = themeStore.getSnapshot();
    expect(snapshot1).toBe(snapshot2);
  });

  it('getServerSnapshot returns same reference on consecutive calls', () => {
    const serverSnapshot1 = themeStore.getServerSnapshot();
    const serverSnapshot2 = themeStore.getServerSnapshot();
    expect(serverSnapshot1).toBe(serverSnapshot2);
  });

  it('console.error is not called with getSnapshot warning', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');

    renderWithRouter(<ThemeSection/>);

    const getSnapshotWarnings = consoleErrorSpy.mock.calls.filter(
      (call) => call[0]?.toString?.().includes('getSnapshot')
    );
    expect(getSnapshotWarnings).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});
