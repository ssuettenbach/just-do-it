import { vi } from 'vitest';
import * as useOpenTasksModule from '../../../hooks/useOpenTasks';

class UseOpenTasksMock {
  static DEFAULT: ReturnType<typeof useOpenTasksModule.useOpenTasks> = {
    tasks: [],
    isLoading: false,
  };

  static mock(value: Partial<ReturnType<typeof useOpenTasksModule.useOpenTasks>> = {}) {
    const spy = vi.spyOn(useOpenTasksModule, 'useOpenTasks').mockReturnValue({
      ...this.DEFAULT,
      ...value,
    });
    return spy;
  }
}

export { UseOpenTasksMock };
