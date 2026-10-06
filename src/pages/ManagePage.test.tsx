import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithRouter } from '../test/renderWithRouter';
import ManagePage from './ManagePage';
import { Mock } from '../test/_mocks/Mock';
import { TestData } from '../test/TestData';

describe('ManagePage', () => {
  beforeEach(() => {
    Mock.useOpenTasks.mock({ tasks: [], isLoading: false });
    Mock.useCompletedTasks.mock({ tasks: [], isLoading: false });
    Mock.useKnownLabels.mock({ labels: [] });
    Mock.useTaskActions.mock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Open tasks tab', () => {
    it('shows "No open tasks" empty state when no tasks exist', () => {
      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByText('No open tasks')).toBeInTheDocument();
      expect(getByText('Add task')).toBeInTheDocument();
    });

    it('shows "No tasks match your filters" when filters exclude all tasks', () => {
      const task = TestData.createTestTask({ title: 'Test Task' });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      const { getByText, getByPlaceholderText } = renderWithRouter(
        <ManagePage tab="open" />,
        { route: '/manage', path: '/manage' }
      );

      const searchInput = getByPlaceholderText('Search tasks...');
      searchInput.setAttribute('value', 'nonexistent');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      expect(getByText('No tasks match your filters')).toBeInTheDocument();
      expect(getByText('Clear filters')).toBeInTheDocument();
    });

    it('displays open tasks', () => {
      const task1 = TestData.createTestTask({ title: 'Task 1' });
      const task2 = TestData.createTestTask({ title: 'Task 2' });
      Mock.useOpenTasks.mock({ tasks: [task1, task2], isLoading: false });

      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByText('Task 1')).toBeInTheDocument();
      expect(getByText('Task 2')).toBeInTheDocument();
    });

    it('shows overdue badge for overdue tasks', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dueDate = yesterday.toISOString().split('T')[0];

      const task = TestData.createTestTask({ title: 'Overdue Task', dueDate });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByText('Overdue')).toBeInTheDocument();
    });

    it('shows due today badge for tasks due today', () => {
      const today = new Date().toISOString().split('T')[0];
      const task = TestData.createTestTask({ title: 'Due Today Task', dueDate: today });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByText('Due today')).toBeInTheDocument();
    });

    it('opens delete confirmation dialog', async () => {
      const task = TestData.createTestTask({ title: 'Task to delete' });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      const { user, getByText, queryByText } = renderWithRouter(
        <ManagePage tab="open" />,
        { route: '/manage', path: '/manage' }
      );

      const deleteButton = getByText('Delete');
      await user.click(deleteButton);

      expect(getByText('Delete task?')).toBeInTheDocument();
      expect(getByText(/This will permanently delete "Task to delete"/)).toBeInTheDocument();
    });

    it('calls deleteTask when delete is confirmed', async () => {
      const task = TestData.createTestTask({ title: 'Task to delete' });
      const deleteTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });
      Mock.useTaskActions.mock({ deleteTask: deleteTaskMock });

      const { user, getByText, getAllByText } = renderWithRouter(
        <ManagePage tab="open" />,
        { route: '/manage', path: '/manage' }
      );

      const deleteButtons = getAllByText('Delete');
      const deleteButton = deleteButtons[0];
      await user.click(deleteButton);

      const confirmButton = getByText('Delete');
      await user.click(confirmButton);

      expect(deleteTaskMock).toHaveBeenCalledWith(task.id);
    });

    it('does not call deleteTask when delete is cancelled', async () => {
      const task = TestData.createTestTask({ title: 'Task to delete' });
      const deleteTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });
      Mock.useTaskActions.mock({ deleteTask: deleteTaskMock });

      const { user, getAllByText } = renderWithRouter(
        <ManagePage tab="open" />,
        { route: '/manage', path: '/manage' }
      );

      const deleteButtons = getAllByText('Delete');
      const deleteButton = deleteButtons[0];
      await user.click(deleteButton);

      const cancelButtons = getAllByText('Cancel');
      const dialogCancelButton = cancelButtons[1]; // The second Cancel button is in the dialog
      await user.click(dialogCancelButton);

      expect(deleteTaskMock).not.toHaveBeenCalled();
    });

    it('calls completeTask when Complete button is clicked', async () => {
      const task = TestData.createTestTask({ title: 'Task to complete' });
      const completeTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });
      Mock.useTaskActions.mock({ completeTask: completeTaskMock });

      const { user, getAllByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      const completeButtons = getAllByText('Complete');
      const completeButton = completeButtons[0];
      await user.click(completeButton);

      expect(completeTaskMock).toHaveBeenCalledWith(task.id);
    });
  });

  describe('History tab', () => {
    it('shows "No completed tasks yet" empty state when no tasks exist', () => {
      const { getByText } = renderWithRouter(<ManagePage tab="history" />, {
        route: '/manage/history',
        path: '/manage/history',
      });

      expect(getByText('No completed tasks yet')).toBeInTheDocument();
    });

    it('shows "No completed tasks match your filters" when filters exclude all tasks', () => {
      const task = TestData.createTestTask({ title: 'Completed Task', status: 'completed' });
      Mock.useCompletedTasks.mock({ tasks: [task], isLoading: false });

      const { getByText, getByPlaceholderText } = renderWithRouter(
        <ManagePage tab="history" />,
        { route: '/manage/history', path: '/manage/history' }
      );

      const searchInput = getByPlaceholderText('Search tasks...');
      searchInput.setAttribute('value', 'nonexistent');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      expect(getByText('No completed tasks match your filters')).toBeInTheDocument();
      expect(getByText('Clear filters')).toBeInTheDocument();
    });

    it('displays completed tasks with completion date', () => {
      const task = TestData.createTestTask({
        title: 'Completed Task',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      Mock.useCompletedTasks.mock({ tasks: [task], isLoading: false });

      const { getByText } = renderWithRouter(<ManagePage tab="history" />, {
        route: '/manage/history',
        path: '/manage/history',
      });

      expect(getByText('Completed Task')).toBeInTheDocument();
      expect(getByText(/Completed/)).toBeInTheDocument();
    });

    it('calls reopenTask when Reopen button is clicked', async () => {
      const task = TestData.createTestTask({
        title: 'Task to reopen',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      const reopenTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useCompletedTasks.mock({ tasks: [task], isLoading: false });
      Mock.useTaskActions.mock({ reopenTask: reopenTaskMock });

      const { user, getAllByText } = renderWithRouter(<ManagePage tab="history" />, {
        route: '/manage/history',
        path: '/manage/history',
      });

      const reopenButtons = getAllByText('Reopen');
      const reopenButton = reopenButtons[0];
      await user.click(reopenButton);

      expect(reopenTaskMock).toHaveBeenCalledWith(task.id);
    });

    it('shows newest completed tasks first', () => {
      const olderTask = TestData.createTestTask({
        title: 'Older Task',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      });
      const newerTask = TestData.createTestTask({
        title: 'Newer Task',
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      Mock.useCompletedTasks.mock({ tasks: [olderTask, newerTask], isLoading: false });

      const { getAllByRole } = renderWithRouter(<ManagePage tab="history" />, {
        route: '/manage/history',
        path: '/manage/history',
      });

      const items = getAllByRole('listitem');
      expect(items[0]).toContainElement(document.querySelector('h3') as HTMLElement);
    });
  });

  describe('Navigation', () => {
    it('has Settings link in header', () => {
      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      const settingsLink = getByText('Settings');
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute('href', '/settings');
    });

    it('shows active tab state', () => {
      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      const openTab = getByText('Open tasks');
      expect(openTab).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Filters', () => {
    it('has collapsible filters section', () => {
      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByText('Filters')).toBeInTheDocument();
    });

    it('has text search filter for open tasks', () => {
      const { getByLabelText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByLabelText('Search')).toBeInTheDocument();
    });

    it('has label filter for open tasks', () => {
      Mock.useKnownLabels.mock({ labels: ['work', 'personal'] });

      const { getByLabelText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByLabelText('Label')).toBeInTheDocument();
    });

    it('has duration filter for open tasks', () => {
      const { getByLabelText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByLabelText('Duration')).toBeInTheDocument();
    });

    it('has due filter for open tasks', () => {
      const { getByLabelText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByLabelText('Due')).toBeInTheDocument();
    });

    it('has completion date filters for history', () => {
      const { getByLabelText } = renderWithRouter(<ManagePage tab="history" />, {
        route: '/manage/history',
        path: '/manage/history',
      });

      expect(getByLabelText('Completed from')).toBeInTheDocument();
      expect(getByLabelText('Completed to')).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('shows loading state for open tasks', () => {
      Mock.useOpenTasks.mock({ tasks: [], isLoading: true });

      const { getByText } = renderWithRouter(<ManagePage tab="open" />, {
        route: '/manage',
        path: '/manage',
      });

      expect(getByText('Loading...')).toBeInTheDocument();
    });

    it('shows loading state for history', () => {
      Mock.useCompletedTasks.mock({ tasks: [], isLoading: true });

      const { getByText } = renderWithRouter(<ManagePage tab="history" />, {
        route: '/manage/history',
        path: '/manage/history',
      });

      expect(getByText('Loading...')).toBeInTheDocument();
    });
  });
});
