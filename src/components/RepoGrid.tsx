'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GitHubRepo, SortOption, TimeRange } from '@/types/github';
import { TOPIC_PRESETS } from '@/types/github';
import { Header } from './Header';
import { TimeRangeTabs } from './TimeRangeTabs';
import { SearchBar } from './SearchBar';
import { FilterControls } from './FilterControls';
import { TopicFilter } from './TopicFilter';
import { RepoCard } from './RepoCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';

interface RepoGridProps {
  initialRepos: GitHubRepo[];
}

export function RepoGrid({ initialRepos }: RepoGridProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('stars');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(
    new Date().toLocaleTimeString()
  );

  const fetchRepos = useCallback(async (days: TimeRange, topic?: string) => {
    setLoading(true);
    setError(null);
    try {
      const topicQuery = topic !== undefined ? topic : selectedTopic;
      const preset = TOPIC_PRESETS.find((p) => p.value === topicQuery);
      const topicParam = preset?.query ? `&topic=${encodeURIComponent(preset.query)}` : '';
      const res = await fetch(`/api/repos?days=${days}${topicParam}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch (${res.status})`);
      }
      const data = await res.json();
      setRepos(data.items ?? []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [selectedTopic]);

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setTimeRange(range);
      fetchRepos(range);
    },
    [fetchRepos]
  );

  const handleRefresh = useCallback(() => {
    fetchRepos(timeRange);
  }, [fetchRepos, timeRange]);

  const handleTopicChange = useCallback(
    (topic: string) => {
      setSelectedTopic(topic);
      fetchRepos(timeRange, topic);
    },
    [fetchRepos, timeRange]
  );

  // Derive unique languages from current repos
  const languages = useMemo(() => {
    const langs = new Set<string>();
    for (const repo of repos) {
      if (repo.language) langs.add(repo.language);
    }
    return Array.from(langs).sort();
  }, [repos]);

  // Filter + sort
  const filteredRepos = useMemo(() => {
    let result = repos;

    // Language filter
    if (selectedLanguage !== 'all') {
      result = result.filter((r) => r.language === selectedLanguage);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          (r.description?.toLowerCase().includes(q) ?? false)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [repos, selectedLanguage, search, sort]);

  // Reset language filter when repos change (new time range may not have that language)
  useEffect(() => {
    setSelectedLanguage('all');
  }, [repos]);

  return (
    <>
      <Header onRefresh={handleRefresh} loading={loading} lastUpdated={lastUpdated} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <TimeRangeTabs value={timeRange} onChange={handleTimeRangeChange} loading={loading} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchBar value={search} onChange={setSearch} />
          <TopicFilter value={selectedTopic} onChange={handleTopicChange} />
          <FilterControls
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            sort={sort}
            onSortChange={setSort}
          />
        </div>

        <div aria-live="polite">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={handleRefresh} />
          ) : filteredRepos.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-16">
              No repositories found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepos.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
