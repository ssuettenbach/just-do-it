import { vi } from 'vitest';
import * as useBackupModule from '../../../hooks/useBackup';

class UseBackupMock {
  static get DEFAULT() {
    return {
      exportBackup: vi.fn().mockResolvedValue({fileName: 'test-backup.json', json: '{}'}),
      downloadBackup: vi.fn(),
      validateBackup: vi.fn().mockReturnValue({ok: true, tasks: []}),
      replaceAll: vi.fn().mockResolvedValue(0),
      merge: vi.fn().mockResolvedValue({imported: 0, skipped: 0}),
    };
  }

  static mock(value: Partial<ReturnType<typeof useBackupModule.useBackup>> = {}) {
    const mockReturn = {
      ...UseBackupMock.DEFAULT,
      ...value,
    };

    const spy = vi.spyOn(useBackupModule, 'useBackup').mockReturnValue(mockReturn);
    return spy;
  }
}

export { UseBackupMock };
