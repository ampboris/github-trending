import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeRangeTabs } from '@/components/TimeRangeTabs';

const defaultProps = {
  value: '7' as const,
  onChange: jest.fn(),
  loading: false,
};

describe('TimeRangeTabs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all three tabs', () => {
    render(<TimeRangeTabs {...defaultProps} />);
    expect(screen.getByText('7 Days')).toBeInTheDocument();
    expect(screen.getByText('2 Weeks')).toBeInTheDocument();
    expect(screen.getByText('3 Weeks')).toBeInTheDocument();
  });

  it('marks selected tab with aria-selected', () => {
    render(<TimeRangeTabs {...defaultProps} value="14" />);
    expect(screen.getByText('7 Days')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('2 Weeks')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('3 Weeks')).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with correct value on click', async () => {
    const user = userEvent.setup();
    render(<TimeRangeTabs {...defaultProps} />);
    await user.click(screen.getByText('3 Weeks'));
    expect(defaultProps.onChange).toHaveBeenCalledWith('21');
  });

  it('disables all tabs when loading', () => {
    render(<TimeRangeTabs {...defaultProps} loading={true} />);
    const buttons = screen.getAllByRole('tab');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('has tablist role on container', () => {
    render(<TimeRangeTabs {...defaultProps} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});
