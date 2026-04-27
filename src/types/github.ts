export interface GitHubOwner {
  login: string;
  avatar_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubOwner;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
}

export interface GitHubSearchResponse {
  total_count: number;
  items: GitHubRepo[];
}

export type TimeRange = '7' | '14' | '21' | '180';
export type SortOption = 'stars' | 'forks' | 'created';

export interface TopicPreset {
  value: string;
  label: string;
  query: string;
}

export const TOPIC_PRESETS: TopicPreset[] = [
  { value: 'all', label: 'All Topics', query: '' },
  { value: 'claude-code', label: 'Claude Code', query: 'claude-code OR claude+code OR anthropic+cli' },
  { value: 'mcp-server', label: 'MCP Server', query: 'mcp-server OR model-context-protocol' },
  { value: 'claude-plugin', label: 'Claude Plugins', query: 'claude+plugin OR claude+extension' },
  { value: 'ai-llm', label: 'AI / LLM', query: 'llm OR large-language-model OR ai-agent OR langchain OR openai' },
];
