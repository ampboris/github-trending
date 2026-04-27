import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorState } from '@/components/ErrorState';

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Rate limited by GitHub" onRetry={jest.fn()} />);
    expect(screen.getByText('Rate limited by GitHub')).toBeInTheDocument();
  });

  it('renders heading', () => {
    render(<ErrorState message="Network error" onRetry={jest.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has alert role for accessibility', () => {
    render(<ErrorState message="Error" onRetry={jest.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    await user.click(screen.getByText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
