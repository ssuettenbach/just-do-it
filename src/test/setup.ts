import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addListener: () => {
      },
      removeListener: () => {
      },
      addEventListener: () => {
      },
      removeEventListener: () => {
      },
      dispatchEvent: () => true,
    }),
  });
}
