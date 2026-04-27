import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterControls } from '@/components/FilterControls';

const defaultProps = {
  languages: ['TypeScript', 'Python', 'Rust'],
  selectedLanguage: 'all',
  onLanguageChange: jest.fn(),
  sort: 'stars' as const,
  onSortChange: jest.fn(),
};

describe('FilterControls', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders language dropdown with all options', () => {
    render(<FilterControls {...defaultProps} />);
    const langSelect = screen.getByLabelText('Filter by language');
    expect(langSelect).toBeInTheDocument();
    expect(screen.getByText('All Languages')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });

  it('renders sort dropdown with options', () => {
    render(<FilterControls {...defaultProps} />);
    const sortSelect = screen.getByLabelText('Sort by');
    expect(sortSelect).toBeInTheDocument();
    expect(screen.getByText('Most Stars')).toBeInTheDocument();
    expect(screen.getByText('Most Forks')).toBeInTheDocument();
    expect(screen.getByText('Recently Created')).toBeInTheDocument();
  });

  it('calls onLanguageChange when language is selected', async () => {
    const user = userEvent.setup();
    render(<FilterControls {...defaultProps} />);
    const langSelect = screen.getByLabelText('Filter by language');
    await user.selectOptions(langSelect, 'Python');
    expect(defaultProps.onLanguageChange).toHaveBeenCalledWith('Python');
  });

  it('calls onSortChange when sort is changed', async () => {
    const user = userEvent.setup();
    render(<FilterControls {...defaultProps} />);
    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'forks');
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('forks');
  });

  it('reflects selected language', () => {
    render(<FilterControls {...defaultProps} selectedLanguage="Rust" />);
    const langSelect = screen.getByLabelText('Filter by language') as HTMLSelectElement;
    expect(langSelect.value).toBe('Rust');
  });
});
