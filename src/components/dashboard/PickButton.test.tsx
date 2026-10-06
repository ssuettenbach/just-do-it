import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithRouter } from '../../test/renderWithRouter';
import { PickButton } from './PickButton';

describe('PickButton', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders category name and subtitle', () => {
    const { getByRole, getByText } = renderWithRouter(
      <PickButton category="quick" subtitle="5 min or less" candidateCount={3} />
    );

    expect(getByRole('button')).toBeInTheDocument();
    expect(getByText('quick')).toBeInTheDocument();
    expect(getByText('5 min or less')).toBeInTheDocument();
  });

  it('shows candidate count', () => {
    const { getByText } = renderWithRouter(
      <PickButton category="quick" subtitle="5 min or less" candidateCount={3} />
    );

    expect(getByText('3 tasks')).toBeInTheDocument();
  });

  it('shows singular form for one candidate', () => {
    const { getByText } = renderWithRouter(
      <PickButton category="quick" subtitle="5 min or less" candidateCount={1} />
    );

    expect(getByText('1 task')).toBeInTheDocument();
  });

  it('navigates to pick route when clicked', async () => {
    const { user, getByRole } = renderWithRouter(
      <PickButton category="quick" subtitle="5 min or less" candidateCount={3} />,
      { route: '/' }
    );

    const button = getByRole('button');
    await user.click(button);

    expect(window.location.pathname).toBe('/pick/quick');
  });

  it('disables button when candidateCount is 0', () => {
    const { getByRole } = renderWithRouter(
      <PickButton category="quick" subtitle="5 min or less" candidateCount={0} />
    );

    expect(getByRole('button')).toBeDisabled();
  });

  it('disables button when candidateCount is 0 and disabled prop is true', () => {
    const { getByRole } = renderWithRouter(
      <PickButton
        category="quick"
        subtitle="5 min or less"
        candidateCount={0}
        disabled={true}
      />
    );

    expect(getByRole('button')).toBeDisabled();
  });

  it('shows disabled message when disabled and disabledMessage is provided', () => {
    const { container } = renderWithRouter(
      <PickButton
        category="quick"
        subtitle="5 min or less"
        candidateCount={0}
        disabledMessage="No open tasks estimated at 5 minutes or less."
      />
    );

    expect(container).toHaveTextContent('No open tasks estimated at 5 minutes or less.');
  });

  it('has accessible description for disabled button', () => {
    const { getByRole } = renderWithRouter(
      <PickButton
        category="quick"
        subtitle="5 min or less"
        candidateCount={0}
        disabledMessage="No open tasks estimated at 5 minutes or less."
      />
    );

    const button = getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'desc-quick');
  });
});
