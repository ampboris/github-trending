import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders 6 skeleton cards', () => {
    render(<LoadingSkeleton />);
    const container = screen.getByLabelText('Loading repositories');
    const cards = container.querySelectorAll('.animate-pulse');
    expect(cards).toHaveLength(6);
  });

  it('has accessible label', () => {
    render(<LoadingSkeleton />);
    expect(screen.getByLabelText('Loading repositories')).toBeInTheDocument();
  });
});
