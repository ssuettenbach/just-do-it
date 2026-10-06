import { vi } from 'vitest';
import * as useKnownLabelsModule from '../../../hooks/useKnownLabels';

class UseKnownLabelsMock {
  static DEFAULT: ReturnType<typeof useKnownLabelsModule.useKnownLabels> = {
    labels: [],
  };

  static mock(value: Partial<ReturnType<typeof useKnownLabelsModule.useKnownLabels>> = {}) {
    const spy = vi.spyOn(useKnownLabelsModule, 'useKnownLabels').mockReturnValue({
      ...this.DEFAULT,
      ...value,
    });
    return spy;
  }
}

export { UseKnownLabelsMock };
