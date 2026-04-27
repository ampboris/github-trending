import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  it('renders input with placeholder', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search repositories...')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<SearchBar value="react" onChange={jest.fn()} />);
    const input = screen.getByLabelText('Search repositories') as HTMLInputElement;
    expect(input.value).toBe('react');
  });

  it('calls onChange when user types', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={onChange} />);
    const input = screen.getByLabelText('Search repositories');
    await user.type(input, 'test');
    // Controlled input fires onChange per keystroke
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenCalledWith(expect.any(String));
  });

  it('has accessible label', () => {
    render(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByLabelText('Search repositories')).toBeInTheDocument();
  });
});
