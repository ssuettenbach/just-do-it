import { vi } from 'vitest';
import * as useThemeModule from '../../../hooks/useTheme';

class UseThemeMock {
  static DEFAULT: ReturnType<typeof useThemeModule.useTheme> = {
    preference: 'system',
    resolvedTheme: 'dark',
    setPreference: vi.fn(),
    toggle: vi.fn(),
  };

  static mock(value: Partial<ReturnType<typeof useThemeModule.useTheme>> = {}) {
    const spy = vi.spyOn(useThemeModule, 'useTheme').mockReturnValue({
      ...this.DEFAULT,
      ...value,
    });
    return spy;
  }
}

export { UseThemeMock };
