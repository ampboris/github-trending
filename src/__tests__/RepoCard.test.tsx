import { render, screen } from '@testing-library/react';
import { RepoCard } from '@/components/RepoCard';
import type { GitHubRepo } from '@/types/github';

const mockRepo: GitHubRepo = {
  id: 1,
  name: 'test-repo',
  full_name: 'user/test-repo',
  owner: { login: 'user', avatar_url: 'https://example.com/avatar.png' },
  html_url: 'https://github.com/user/test-repo',
  description: 'A test repository for unit testing',
  stargazers_count: 1500,
  forks_count: 200,
  language: 'TypeScript',
  created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
};

describe('RepoCard', () => {
  it('renders repo name', () => {
    render(<RepoCard repo={mockRepo} />);
    expect(screen.getByText('user/test-repo')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<RepoCard repo={mockRepo} />);
    expect(screen.getByText('A test repository for unit testing')).toBeInTheDocument();
  });

  it('renders formatted star count', () => {
    render(<RepoCard repo={mockRepo} />);
    expect(screen.getByText('1.5k')).toBeInTheDocument();
  });

  it('renders formatted fork count', () => {
    render(<RepoCard repo={mockRepo} />);
    expect(screen.getByText('200')).toBeInTheDocument();
  });

  it('renders language', () => {
    render(<RepoCard repo={mockRepo} />);
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('links to the GitHub repo', () => {
    render(<RepoCard repo={mockRepo} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/user/test-repo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders owner avatar', () => {
    render(<RepoCard repo={mockRepo} />);
    // alt="" gives the img a presentation role, so query by role presentation
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('handles missing description', () => {
    const repoNoDesc = { ...mockRepo, description: null };
    render(<RepoCard repo={repoNoDesc} />);
    expect(screen.getByText('user/test-repo')).toBeInTheDocument();
    expect(screen.queryByText('A test repository')).not.toBeInTheDocument();
  });

  it('handles missing language', () => {
    const repoNoLang = { ...mockRepo, language: null };
    render(<RepoCard repo={repoNoLang} />);
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
