'use client';

import type { SortOption } from '@/types/github';

interface FilterControlsProps {
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export function FilterControls({
  languages,
  selectedLanguage,
  onLanguageChange,
  sort,
  onSortChange,
}: FilterControlsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        aria-label="Filter by language"
      >
        <option value="all">All Languages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
        aria-label="Sort by"
      >
        <option value="stars">Most Stars</option>
        <option value="forks">Most Forks</option>
        <option value="created">Recently Created</option>
      </select>
    </div>
  );
}
