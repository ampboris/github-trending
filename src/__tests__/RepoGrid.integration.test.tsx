import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepoGrid } from '@/components/RepoGrid';
import type { GitHubRepo } from '@/types/github';

// Mock next-themes to avoid provider issues
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function makeRepo(overrides: Partial<GitHubRepo> & { id: number }): GitHubRepo {
  return {
    name: `repo-${overrides.id}`,
    full_name: `user/repo-${overrides.id}`,
    owner: { login: 'user', avatar_url: 'https://example.com/avatar.png' },
    html_url: `https://github.com/user/repo-${overrides.id}`,
    description: `Description for repo ${overrides.id}`,
    stargazers_count: 100,
    forks_count: 10,
    language: 'TypeScript',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const mockRepos: GitHubRepo[] = [
  makeRepo({ id: 1, stargazers_count: 500, forks_count: 50, language: 'TypeScript', full_name: 'user/alpha', html_url: 'https://github.com/user/alpha' }),
  makeRepo({ id: 2, stargazers_count: 300, forks_count: 80, language: 'Python', full_name: 'user/beta', html_url: 'https://github.com/user/beta', description: 'A Python project' }),
  makeRepo({ id: 3, stargazers_count: 800, forks_count: 20, language: 'Rust', full_name: 'user/gamma', html_url: 'https://github.com/user/gamma' }),
];

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('RepoGrid integration', () => {
  it('renders initial repos from props', () => {
    render(<RepoGrid initialRepos={mockRepos} />);

    expect(screen.getByText('user/alpha')).toBeInTheDocument();
    expect(screen.getByText('user/beta')).toBeInTheDocument();
    expect(screen.getByText('user/gamma')).toBeInTheDocument();
  });

  it('fetches new repos when time range changes', async () => {
    const newRepos = [makeRepo({ id: 10, full_name: 'user/new-repo', stargazers_count: 999 })];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total_count: 1, items: newRepos }),
    });

    render(<RepoGrid initialRepos={mockRepos} />);
    const user = userEvent.setup();

    // Click "2 Weeks" tab
    const tab = screen.getByRole('tab', { name: '2 Weeks' });
    await user.click(tab);

    await waitFor(() => {
      expect(screen.getByText('user/new-repo')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/repos?days=14'),
    );
  });

  it('shows error state when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'GitHub API error: 500 Error' }),
    });

    render(<RepoGrid initialRepos={mockRepos} />);
    const user = userEvent.setup();

    // Trigger a fetch by changing time range
    await user.click(screen.getByRole('tab', { name: '2 Weeks' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/GitHub API error/)).toBeInTheDocument();
  });

  it('shows loading skeleton during fetch', async () => {
    // Use a fetch that never resolves to keep loading state
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    render(<RepoGrid initialRepos={mockRepos} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: '2 Weeks' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Loading repositories')).toBeInTheDocument();
    });
  });

  it('resets language filter when time range changes', async () => {
    const newRepos = [makeRepo({ id: 10, language: 'Go', full_name: 'user/go-repo' })];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total_count: 1, items: newRepos }),
    });

    render(<RepoGrid initialRepos={mockRepos} />);
    const user = userEvent.setup();

    // Select a language filter
    const langSelect = screen.getByLabelText('Filter by language');
    await user.selectOptions(langSelect, 'TypeScript');
    expect(langSelect).toHaveValue('TypeScript');

    // Change time range — should reset language to "all"
    await user.click(screen.getByRole('tab', { name: '2 Weeks' }));

    await waitFor(() => {
      expect(screen.getByText('user/go-repo')).toBeInTheDocument();
    });

    // Language select should be reset to "all"
    expect(screen.getByLabelText('Filter by language')).toHaveValue('all');
  });

  it('filters repos by search query', async () => {
    render(<RepoGrid initialRepos={mockRepos} />);
    const user = userEvent.setup();

    const searchInput = screen.getByLabelText('Search repositories');
    await user.type(searchInput, 'Python');

    // Only beta (with "Python" in description) should be visible
    await waitFor(() => {
      expect(screen.getByText('user/beta')).toBeInTheDocument();
      expect(screen.queryByText('user/alpha')).not.toBeInTheDocument();
      expect(screen.queryByText('user/gamma')).not.toBeInTheDocument();
    });
  });

  it('reorders repos when sort changes', async () => {
    render(<RepoGrid initialRepos={mockRepos} />);
    const user = userEvent.setup();

    // Default sort is stars — gamma (800) should be first
    const grid = screen.getByRole('main');
    let links = within(grid).getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://github.com/user/gamma');

    // Switch to "Most Forks"
    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'forks');

    // Now beta (80 forks) should be first
    links = within(grid).getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://github.com/user/beta');
  });
});
