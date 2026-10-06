import { vi } from 'vitest';
import * as useTaskActionsModule from '../../../hooks/useTaskActions';
import { TestData } from '../../TestData';

class UseTaskActionsMock {
  static get DEFAULT() {
    return {
      addTask: vi.fn().mockResolvedValue(TestData.createTestTask()),
      updateTask: vi.fn().mockResolvedValue(TestData.createTestTask()),
      completeTask: vi.fn().mockResolvedValue(TestData.createTestTask({status: 'completed'})),
      reopenTask: vi.fn().mockResolvedValue(TestData.createTestTask()),
      deleteTask: vi.fn().mockResolvedValue(undefined),
    };
  }

  static mock(value: Partial<ReturnType<typeof useTaskActionsModule.useTaskActions>> = {}) {
    const mockReturn = {
      ...UseTaskActionsMock.DEFAULT,
      ...value,
    };

    const spy = vi.spyOn(useTaskActionsModule, 'useTaskActions').mockReturnValue(mockReturn);
    return spy;
  }
}

export { UseTaskActionsMock };
