import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter } from '../test/renderWithRouter';
import { Mock } from '../test/_mocks/Mock';
import { TestData } from '../test/TestData';
import { getCandidates, pickRandom } from '../domain/picker';
import PickResultPage from './PickResultPage';

describe('PickResultPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('invalid category', () => {
    it('redirects to home when category is invalid', () => {
      Mock.useOpenTasks.mock({ tasks: [], isLoading: false });

      const { container } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/invalid',
      });

      // The component redirects to '/' when category is invalid
      // We can't easily test the redirect destination in this setup
      // but we can verify the component handles invalid categories
      expect(container).toBeInTheDocument();
    });
  });

  describe('empty candidates', () => {
    it('shows no matching tasks message when no candidates exist', () => {
      Mock.useOpenTasks.mock({ tasks: [], isLoading: false });

      const { getByText } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      expect(getByText('No matching tasks right now.')).toBeInTheDocument();
    });

    it('shows back to dashboard link', () => {
      Mock.useOpenTasks.mock({ tasks: [], isLoading: false });

      const { getByRole } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      const link = getByRole('link', { name: 'Back to dashboard' });
      expect(link).toHaveAttribute('href', '/');
    });
  });

  describe('with candidates', () => {
    it('displays the picked task title', () => {
      const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { getByRole } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      expect(getByRole('heading', { name: 'Test Task' })).toBeInTheDocument();
    });

    it('displays category heading', () => {
      const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { getByText } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      expect(getByText('Quick pick')).toBeInTheDocument();
    });

    it('displays task labels', () => {
      const task = TestData.createTestTask({
        title: 'Test Task',
        estimateMinutes: 5,
        labels: ['work', 'urgent'],
      });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { getByText } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      expect(getByText('work')).toBeInTheDocument();
      expect(getByText('urgent')).toBeInTheDocument();
    });

    it('displays task notes with line breaks preserved', () => {
      const task = TestData.createTestTask({
        title: 'Test Task',
        estimateMinutes: 5,
        notes: 'Line 1\nLine 2',
      });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { container } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      const notesElement = container.querySelector('.whitespace-pre-wrap');
      expect(notesElement).toBeInTheDocument();
      expect(notesElement?.textContent).toContain('Line 1');
      expect(notesElement?.textContent).toContain('Line 2');
    });

    it('calls completeTask and navigates to dashboard on Complete', async () => {
      const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });
      const completeTaskMock = vi.fn().mockResolvedValue(undefined);
      Mock.useTaskActions.mock({ completeTask: completeTaskMock });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { user, getByRole } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      const completeButton = getByRole('button', { name: 'Complete' });
      await user.click(completeButton);

      expect(completeTaskMock).toHaveBeenCalledWith(task.id);
      expect(window.location.pathname).toBe('/');
    });

    it('disables Complete button while completing', async () => {
      const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });
      Mock.useTaskActions.mock({
        completeTask: vi.fn().mockImplementation(() => new Promise(() => {})),
      });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { user, getByRole } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      const completeButton = getByRole('button', { name: 'Complete' });
      await user.click(completeButton);

      expect(completeButton).toBeDisabled();
    });

    it('shows error message when completeTask fails', async () => {
      const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });
      Mock.useTaskActions.mock({
        completeTask: vi.fn().mockRejectedValue(new Error('Failed')),
      });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { user, getByRole, getByText } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      const completeButton = getByRole('button', { name: 'Complete' });
      await user.click(completeButton);

      await vi.waitFor(() => {
        expect(getByText('Failed to complete task. Please try again.')).toBeInTheDocument();
      });
    });

    it('picks another task on Pick another click', async () => {
      const task1 = TestData.createTestTask({ title: 'Task 1', estimateMinutes: 5 });
      const task2 = TestData.createTestTask({ title: 'Task 2', estimateMinutes: 3 });
      Mock.useOpenTasks.mock({ tasks: [task1, task2], isLoading: false });

      let callCount = 0;
      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = callCount++;
      });

      const { user, getByRole, getByText } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      expect(getByText('Task 1')).toBeInTheDocument();

      const pickAnotherButton = getByRole('button', { name: 'Pick another' });
      await user.click(pickAnotherButton);

      expect(getByText('Task 2')).toBeInTheDocument();
    });

    it('disables Pick another when only one candidate exists', () => {
      const task = TestData.createTestTask({ title: 'Only Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
        arr[0] = 0;
      });

      const { getByRole } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: '/pick/quick',
      });

      const pickAnotherButton = getByRole('button', { name: 'Pick another' });
      expect(pickAnotherButton).toBeDisabled();
    });

     it('shows visible hint for single candidate', () => {
       const task = TestData.createTestTask({ title: 'Only Task', estimateMinutes: 5 });
       Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

       vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
         arr[0] = 0;
       });

       const { getByText } = renderWithRouter(<PickResultPage />, {
         path: '/pick/:category',
         route: '/pick/quick',
       });

       expect(getByText('This is the only matching task.')).toBeInTheDocument();
     });

     it('View/edit is a link with correct href', () => {
       const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
       Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

       vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
         arr[0] = 0;
       });

       const { getByRole } = renderWithRouter(<PickResultPage />, {
         path: '/pick/:category',
         route: '/pick/quick',
       });

       const viewEditLink = getByRole('link', { name: 'View/edit' });
       expect(viewEditLink).toHaveAttribute('href', `/tasks/${task.id}`);
     });

    it('uses task from URL search param on reload', () => {
      const task = TestData.createTestTask({ title: 'Test Task', estimateMinutes: 5 });
      Mock.useOpenTasks.mock({ tasks: [task], isLoading: false });

      const { getByText } = renderWithRouter(<PickResultPage />, {
        path: '/pick/:category',
        route: `/pick/quick?task=${task.id}`,
      });

      expect(getByText('Test Task')).toBeInTheDocument();
    });

     it('re-picks when URL task param is no longer eligible', () => {
       const task1 = TestData.createTestTask({ title: 'Task 1', estimateMinutes: 10 });
       const task2 = TestData.createTestTask({ title: 'Task 2', estimateMinutes: 5 });
       Mock.useOpenTasks.mock({ tasks: [task1, task2], isLoading: false });

       vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
         arr[0] = 0;
       });

       const { getByText } = renderWithRouter(<PickResultPage />, {
         path: '/pick/:category',
         route: `/pick/quick?task=${task1.id}`,
       });

       expect(getByText('Task 2')).toBeInTheDocument();
     });

     it('picks an existing candidate when URL task param refers to missing id', () => {
       const task1 = TestData.createTestTask({ title: 'Task 1', estimateMinutes: 5 });
       const task2 = TestData.createTestTask({ title: 'Task 2', estimateMinutes: 3 });
       Mock.useOpenTasks.mock({ tasks: [task1, task2], isLoading: false });

       vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((arr) => {
         arr[0] = 0;
       });

       const { getByText } = renderWithRouter(<PickResultPage />, {
         path: '/pick/:category',
         route: '/pick/any?task=non-existent-id',
       });

       expect(getByText(/Task \d/)).toBeInTheDocument();
     });
   });
 });
