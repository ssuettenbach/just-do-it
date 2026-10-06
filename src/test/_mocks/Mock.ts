import { UseOpenTasksMock } from './hooks/useOpenTasks.mock';
import { UseCompletedTasksMock } from './hooks/useCompletedTasks.mock';
import { UseTaskMock } from './hooks/useTask.mock';
import { UseKnownLabelsMock } from './hooks/useKnownLabels.mock';
import { UseTaskActionsMock } from './hooks/useTaskActions.mock';
import { UseBackupMock } from './hooks/useBackup.mock';

export class Mock {
  static useOpenTasks = UseOpenTasksMock;
  static useCompletedTasks = UseCompletedTasksMock;
  static useTask = UseTaskMock;
  static useKnownLabels = UseKnownLabelsMock;
  static useTaskActions = UseTaskActionsMock;
  static useBackup = UseBackupMock;
}
