import { vi } from 'vitest';
import * as useTaskModule from '../../../hooks/useTask';

class UseTaskMock {
  static DEFAULT: ReturnType<typeof useTaskModule.useTask> = {
    task: undefined,
    isLoading: false,
  };

  static mock(value: Partial<ReturnType<typeof useTaskModule.useTask>> = {}) {
    const spy = vi.spyOn(useTaskModule, 'useTask').mockReturnValue({
      ...this.DEFAULT,
      ...value,
    });
    return spy;
  }
}

export { UseTaskMock };
