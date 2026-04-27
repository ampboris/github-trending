'use client';

import type { TimeRange } from '@/types/github';

interface TimeRangeTabsProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  loading: boolean;
}

const tabs: { value: TimeRange; label: string }[] = [
  { value: '7', label: '7 Days' },
  { value: '14', label: '2 Weeks' },
  { value: '21', label: '3 Weeks' },
  { value: '180', label: '6 Months' },
];

export function TimeRangeTabs({ value, onChange, loading }: TimeRangeTabsProps) {
  return (
    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1" role="tablist" aria-label="Time range">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          disabled={loading}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all disabled:opacity-50 ${
            value === tab.value
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
