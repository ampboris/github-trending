export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading repositories">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 animate-pulse"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-3 w-1/4 rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
