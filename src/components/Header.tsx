import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: string | null;
}

export function Header({ onRefresh, loading, lastUpdated }: HeaderProps) {
  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="text-yellow-500">&#9733;</span>
            GitHub Trending
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Your daily dashboard for top repos
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Updated {lastUpdated}
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            aria-label="Refresh data"
          >
            <span className={loading ? 'animate-spin inline-block' : 'inline-block'}>&#8635;</span>
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
