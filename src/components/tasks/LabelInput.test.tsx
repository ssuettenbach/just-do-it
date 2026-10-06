import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { renderWithRouter } from '../../test/renderWithRouter';
import { LabelInput } from './LabelInput';
import { Mock } from '../../test/_mocks/Mock';

describe('LabelInput', () => {
  beforeEach(() => {
    Mock.useKnownLabels.mock({ labels: ['work', 'personal', 'urgent'] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with empty labels', () => {
    const { container } = renderWithRouter(
      <LabelInput labels={[]} onChange={vi.fn()} knownLabels={['work', 'personal']} />
    );

    expect(container.querySelector('input')).toBeInTheDocument();
    expect(container.querySelector('datalist')).toBeInTheDocument();
  });

  it('displays existing labels as chips', () => {
    const { getByText } = renderWithRouter(
      <LabelInput labels={['work', 'personal']} onChange={vi.fn()} knownLabels={[]} />
    );

    expect(getByText('work')).toBeInTheDocument();
    expect(getByText('personal')).toBeInTheDocument();
  });

  it('calls onChange when adding a label via Enter key', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={[]} onChange={onChange} knownLabels={[]} />
    );

    const input = document.querySelector('input') as HTMLInputElement;
    await user.type(input, 'new label{enter}');

    expect(onChange).toHaveBeenCalledWith(['new label']);
  });

  it('calls onChange when adding a label via comma', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={[]} onChange={onChange} knownLabels={[]} />
    );

    const input = document.querySelector('input') as HTMLInputElement;
    await user.type(input, 'new label,');

    expect(onChange).toHaveBeenCalledWith(['new label']);
  });

  it('calls onChange when adding a label via Add button', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={[]} onChange={onChange} knownLabels={[]} />
    );

    const input = document.querySelector('input') as HTMLInputElement;
    await user.type(input, 'new label');
    await user.click(document.querySelector('button[type="button"]') as HTMLButtonElement);

    expect(onChange).toHaveBeenCalledWith(['new label']);
  });

  it('deduplicates labels when adding', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={['work']} onChange={onChange} knownLabels={[]} />
    );

    const input = document.querySelector('input') as HTMLInputElement;
    await user.type(input, 'work{enter}');

    expect(onChange).toHaveBeenCalledWith(['work']);
  });

  it('normalizes labels (trims and case-insensitive deduplication)', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={[]} onChange={onChange} knownLabels={[]} />
    );

    const input = document.querySelector('input') as HTMLInputElement;
    await user.type(input, '  Work  {enter}');
    await user.type(input, 'work{enter}');

    expect(onChange).toHaveBeenCalledWith(['Work']);
  });

  it('calls onChange when removing a label', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={['work', 'personal']} onChange={onChange} knownLabels={[]} />
    );

    const removeButton = document.querySelector('button[aria-label*="Remove label"]') as HTMLButtonElement;
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(['personal']);
  });

  it('shows suggestions from knownLabels in datalist', () => {
    const { container } = renderWithRouter(
      <LabelInput labels={[]} onChange={vi.fn()} knownLabels={['work', 'personal', 'urgent']} />
    );

    const datalist = container.querySelector('datalist');
    const options = datalist?.querySelectorAll('option');

    expect(options).toHaveLength(3);
    expect(options?.[0].value).toBe('work');
    expect(options?.[1].value).toBe('personal');
    expect(options?.[2].value).toBe('urgent');
  });

  it('does not add empty labels', async () => {
    const onChange = vi.fn();
    const { user } = renderWithRouter(
      <LabelInput labels={[]} onChange={onChange} knownLabels={[]} />
    );

    const input = document.querySelector('input') as HTMLInputElement;
    await user.type(input, '   {enter}');

    expect(onChange).not.toHaveBeenCalled();
  });
});
