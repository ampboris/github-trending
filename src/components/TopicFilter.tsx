'use client';

import { TOPIC_PRESETS } from '@/types/github';

interface TopicFilterProps {
  value: string;
  onChange: (topic: string) => void;
}

export function TopicFilter({ value, onChange }: TopicFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
      aria-label="Filter by topic"
    >
      {TOPIC_PRESETS.map((preset) => (
        <option key={preset.value} value={preset.value}>
          {preset.label}
        </option>
      ))}
    </select>
  );
}
