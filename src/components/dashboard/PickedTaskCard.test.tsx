import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { PickedTaskCard } from './PickedTaskCard';
import { TestData } from '../../test/TestData';

describe('PickedTaskCard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders category heading', () => {
    const task = TestData.createTestTask({ title: 'Test Task' });
    const { getByText } = render(
      <PickedTaskCard
        category="quick"
        task={task}
        actions={<button>Action</button>}
      />
    );

    expect(getByText('Quick pick')).toBeInTheDocument();
  });

  it('renders task title as h2', () => {
    const task = TestData.createTestTask({ title: 'Test Task' });
    const { getByRole } = render(
      <PickedTaskCard
        category="quick"
        task={task}
        actions={<button>Action</button>}
      />
    );

    expect(getByRole('heading', { name: 'Test Task' })).toBeInTheDocument();
  });

  it('renders task notes with whitespace-pre-wrap', () => {
    const task = TestData.createTestTask({
      title: 'Test Task',
      notes: 'Line 1\nLine 2',
    });
    const { container } = render(
      <PickedTaskCard
        category="quick"
        task={task}
        actions={<button>Action</button>}
      />
    );

    const notesElement = container.querySelector('.whitespace-pre-wrap');
    expect(notesElement).toBeInTheDocument();
    expect(notesElement?.textContent).toContain('Line 1');
    expect(notesElement?.textContent).toContain('Line 2');
  });

  it('does not render notes section when notes are empty', () => {
    const task = TestData.createTestTask({ title: 'Test Task', notes: '' });
    const { container } = render(
      <PickedTaskCard
        category="quick"
        task={task}
        actions={<button>Action</button>}
      />
    );

    const notesElement = container.querySelector('.whitespace-pre-wrap');
    expect(notesElement).not.toBeInTheDocument();
  });

  it('renders actions', () => {
    const task = TestData.createTestTask({ title: 'Test Task' });
    const { getByRole } = render(
      <PickedTaskCard
        category="quick"
        task={task}
        actions={<button>Complete</button>}
      />
    );

    expect(getByRole('button', { name: 'Complete' })).toBeInTheDocument();
  });

  it('renders Any pick heading for any category', () => {
    const task = TestData.createTestTask({ title: 'Test Task' });
    const { getByText } = render(
      <PickedTaskCard
        category="any"
        task={task}
        actions={<button>Action</button>}
      />
    );

    expect(getByText('Any pick')).toBeInTheDocument();
  });

  it('renders Big pick heading for big category', () => {
    const task = TestData.createTestTask({ title: 'Test Task' });
    const { getByText } = render(
      <PickedTaskCard
        category="big"
        task={task}
        actions={<button>Action</button>}
      />
    );

    expect(getByText('Big pick')).toBeInTheDocument();
  });
});
