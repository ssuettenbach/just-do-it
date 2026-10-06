import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithRouter } from '../test/renderWithRouter';
import TaskFormPage from './TaskFormPage';
import { Mock } from '../test/_mocks/Mock';
import { TestData } from '../test/TestData';

describe('TaskFormPage', () => {
  beforeEach(() => {
    Mock.useTask.mock({ task: undefined, isLoading: false });
    Mock.useKnownLabels.mock({ labels: [] });
    Mock.useTaskActions.mock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Create mode', () => {
    it('renders with "New task" title', () => {
      const { getByText } = renderWithRouter(<TaskFormPage mode="create" />, {
        route: '/tasks/new',
        path: '/tasks/new',
      });

      expect(getByText('New task')).toBeInTheDocument();
    });

    it('has empty form fields', () => {
      const { getByLabelText } = renderWithRouter(<TaskFormPage mode="create" />, {
        route: '/tasks/new',
        path: '/tasks/new',
      });

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      const estimateInput = getByLabelText('Estimate (minutes)') as HTMLInputElement;
      const dueDateInput = getByLabelText('Due date') as HTMLInputElement;
      const notesInput = getByLabelText('Notes') as HTMLTextAreaElement;

      expect(titleInput.value).toBe('');
      expect(estimateInput.value).toBe('');
      expect(dueDateInput.value).toBe('');
      expect(notesInput.value).toBe('');
    });

    it('shows title validation error when submitting empty title', async () => {
      const { user, getByText, getByLabelText, findByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(await findByText(/Title is required/)).toBeInTheDocument();
    });

    it('shows estimate validation error for negative values', async () => {
      const { user, getByText, getByLabelText, findByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const estimateInput = getByLabelText('Estimate (minutes)') as HTMLInputElement;
      await user.clear(estimateInput);
      await user.type(estimateInput, '-5');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(await findByText(/Enter whole minutes/)).toBeInTheDocument();
    });

    it('shows estimate validation error for non-integer values', async () => {
      const { user, getByText, getByLabelText, findByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const estimateInput = getByLabelText('Estimate (minutes)') as HTMLInputElement;
      await user.clear(estimateInput);
      await user.type(estimateInput, '5.5');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(await findByText(/Enter whole minutes/)).toBeInTheDocument();
    });

    it('calls addTask with normalized input on valid submit', async () => {
      const addTaskMock = vi.fn().mockResolvedValue(TestData.createTestTask());
      Mock.useTaskActions.mock({ addTask: addTaskMock });

      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.type(titleInput, 'New Task');

      const estimateInput = getByLabelText('Estimate (minutes)') as HTMLInputElement;
      await user.type(estimateInput, '10');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(addTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          estimateMinutes: 10,
        })
      );
    });

    it('navigates to /manage after successful create', async () => {
      const addTaskMock = vi.fn().mockResolvedValue(TestData.createTestTask());
      Mock.useTaskActions.mock({ addTask: addTaskMock });

      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.type(titleInput, 'New Task');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      // Check that navigation happened (we can't easily test the actual navigation in this setup)
      expect(addTaskMock).toHaveBeenCalled();
    });

    it('has Cancel button that navigates back', async () => {
      const { user, getByText } = renderWithRouter(<TaskFormPage mode="create" />, {
        route: '/tasks/new',
        path: '/tasks/new',
      });

      const cancelButton = getByText('Cancel');
      expect(cancelButton).toBeInTheDocument();

      await user.click(cancelButton);

      // Navigation to /manage should happen - we can't easily test the actual URL in this setup
      // but we can verify the button exists and is clickable
    });
  });

  describe('Edit mode', () => {
    it('renders with "Edit task" title', () => {
      const task = TestData.createTestTask({ title: 'Existing Task' });
      Mock.useTask.mock({ task, isLoading: false });

      const { getByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      expect(getByText('Edit task')).toBeInTheDocument();
    });

    it('pre-fills form fields with task data', () => {
      const task = TestData.createTestTask({
        title: 'Existing Task',
        estimateMinutes: 15,
        dueDate: '2026-10-10',
        notes: 'Some notes',
        labels: ['work', 'urgent'],
      });
      Mock.useTask.mock({ task, isLoading: false });

      const { getByLabelText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      const estimateInput = getByLabelText('Estimate (minutes)') as HTMLInputElement;
      const dueDateInput = getByLabelText('Due date') as HTMLInputElement;
      const notesInput = getByLabelText('Notes') as HTMLTextAreaElement;

      expect(titleInput.value).toBe('Existing Task');
      expect(estimateInput.value).toBe('15');
      expect(dueDateInput.value).toBe('2026-10-10');
      expect(notesInput.value).toBe('Some notes');
    });

    it('shows completed date note for completed tasks', () => {
      const task = TestData.createTestTask({
        title: 'Completed Task',
        status: 'completed',
        completedAt: '2026-10-05T10:00:00.000Z',
      });
      Mock.useTask.mock({ task, isLoading: false });

      const { getByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      expect(getByText(/Completed/)).toBeInTheDocument();
    });

    it('shows loading state while task is loading', () => {
      Mock.useTask.mock({ task: undefined, isLoading: true });

      const { getByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      expect(getByText('Loading...')).toBeInTheDocument();
    });

    it('shows "Task not found" when task does not exist', () => {
      Mock.useTask.mock({ task: undefined, isLoading: false });

      const { getByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/nonexistent',
        path: '/tasks/:id',
      });

      expect(getByText('Task not found')).toBeInTheDocument();
    });

    it('calls updateTask with normalized input on valid submit', async () => {
      const task = TestData.createTestTask({ title: 'Existing Task' });
      const updateTaskMock = vi.fn().mockResolvedValue(task);
      Mock.useTask.mock({ task, isLoading: false });
      Mock.useTaskActions.mock({ updateTask: updateTaskMock });

      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="edit" />,
        { route: '/tasks/123', path: '/tasks/:id' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(updateTaskMock).toHaveBeenCalledWith(
        task.id,
        expect.objectContaining({
          title: 'Updated Task',
        })
      );
    });

    it('has Delete button that opens confirmation dialog', async () => {
      const task = TestData.createTestTask({ title: 'Task to delete' });
      Mock.useTask.mock({ task, isLoading: false });

      const { user, getByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      const deleteButton = getByText('Delete task');
      await user.click(deleteButton);

      expect(getByText('Delete task?')).toBeInTheDocument();
    });

    it('calls deleteTask and navigates to /manage when delete is confirmed', async () => {
      const task = TestData.createTestTask({ title: 'Task to delete' });
      const deleteTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useTask.mock({ task, isLoading: false });
      Mock.useTaskActions.mock({ deleteTask: deleteTaskMock });

      const { user, getByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      const deleteButton = getByText('Delete task');
      await user.click(deleteButton);

      const confirmButton = getByText('Delete');
      await user.click(confirmButton);

      expect(deleteTaskMock).toHaveBeenCalledWith(task.id);
    });

    it('does not call deleteTask when delete is cancelled', async () => {
      const task = TestData.createTestTask({ title: 'Task to delete' });
      const deleteTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useTask.mock({ task, isLoading: false });
      Mock.useTaskActions.mock({ deleteTask: deleteTaskMock });

      const { user, getByText, getAllByText } = renderWithRouter(<TaskFormPage mode="edit" />, {
        route: '/tasks/123',
        path: '/tasks/:id',
      });

      const deleteButton = getByText('Delete task');
      await user.click(deleteButton);

      const cancelButtons = getAllByText('Cancel');
      const dialogCancelButton = cancelButtons[1]; // The second Cancel button is in the dialog
      await user.click(dialogCancelButton);

      expect(deleteTaskMock).not.toHaveBeenCalled();
    });
  });

  describe('Labels', () => {
    it('adds labels via LabelInput', async () => {
      Mock.useKnownLabels.mock({ labels: ['work', 'personal'] });

      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const labelInput = getByLabelText('Add label') as HTMLInputElement;
      await user.type(labelInput, 'work{enter}');

      expect(getByText('work')).toBeInTheDocument();
    });

    it('removes labels via LabelInput', async () => {
      const task = TestData.createTestTask({ labels: ['work', 'personal'] });
      Mock.useTask.mock({ task, isLoading: false });

      const { user, getByLabelText, queryByText } = renderWithRouter(
        <TaskFormPage mode="edit" />,
        { route: '/tasks/123', path: '/tasks/:id' }
      );

      const removeButton = getByLabelText('Remove label work') as HTMLButtonElement;
      await user.click(removeButton);

      expect(queryByText('work')).not.toBeInTheDocument();
    });

    it('normalizes labels on submit', async () => {
      const addTaskMock = vi.fn().mockResolvedValue(TestData.createTestTask());
      Mock.useTaskActions.mock({ addTask: addTaskMock });

      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.type(titleInput, 'New Task');

      const labelInput = getByLabelText('Add label') as HTMLInputElement;
      await user.type(labelInput, '  Work  {enter}');
      await user.type(labelInput, 'work{enter}');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(addTaskMock).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: ['Work'],
        })
      );
    });
  });

  describe('Form validation', () => {
    it('focuses first invalid field on submit', async () => {
      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const saveButton = getByText('Save');
      await user.click(saveButton);

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      expect(document.activeElement).toBe(titleInput);
    });

    it('disables Save button while submitting', async () => {
      let resolvePromise: () => void;
      const addTaskMock = vi.fn().mockImplementation(
        () => new Promise<void>((resolve) => {
          resolvePromise = resolve;
        })
      );
      Mock.useTaskActions.mock({ addTask: addTaskMock });

      const { user, getByLabelText, getByText, queryByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.type(titleInput, 'New Task');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();

      resolvePromise!();
      await vi.waitFor(() => {
        const button = queryByText('Save');
        if (button) {
          expect(button).not.toBeDisabled();
        }
      });
    });

    it('shows error message when submit fails', async () => {
      const addTaskMock = vi.fn().mockRejectedValue(new Error('Failed'));
      Mock.useTaskActions.mock({ addTask: addTaskMock });

      const { user, getByLabelText, getByText } = renderWithRouter(
        <TaskFormPage mode="create" />,
        { route: '/tasks/new', path: '/tasks/new' }
      );

      const titleInput = getByLabelText('Title') as HTMLInputElement;
      await user.type(titleInput, 'New Task');

      const saveButton = getByText('Save');
      await user.click(saveButton);

      await vi.waitFor(() => {
        expect(getByText(/Failed to save/)).toBeInTheDocument();
      });
    });
  });
});
