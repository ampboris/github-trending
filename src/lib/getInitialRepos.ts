import type { GitHubSearchResponse } from '@/types/github';

export async function getInitialRepos() {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const dateStr = since.toISOString().split('T')[0];

  const url = `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=10`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const data: GitHubSearchResponse = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}
