import { vi } from 'vitest';
import * as useCompletedTasksModule from '../../../hooks/useCompletedTasks';

class UseCompletedTasksMock {
  static DEFAULT: ReturnType<typeof useCompletedTasksModule.useCompletedTasks> = {
    tasks: [],
    isLoading: false,
  };

  static mock(value: Partial<ReturnType<typeof useCompletedTasksModule.useCompletedTasks>> = {}) {
    const spy = vi.spyOn(useCompletedTasksModule, 'useCompletedTasks').mockReturnValue({
      ...this.DEFAULT,
      ...value,
    });
    return spy;
  }
}

export { UseCompletedTasksMock };
