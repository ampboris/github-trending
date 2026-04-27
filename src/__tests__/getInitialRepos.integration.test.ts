/**
 * @jest-environment node
 */
import { getInitialRepos } from '@/lib/getInitialRepos';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('getInitialRepos', () => {
  it('returns items array on successful response', async () => {
    const mockItems = [
      { id: 1, name: 'repo-1', full_name: 'user/repo-1' },
      { id: 2, name: 'repo-2', full_name: 'user/repo-2' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total_count: 2, items: mockItems }),
    });

    const result = await getInitialRepos();

    expect(result).toEqual(mockItems);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain('api.github.com/search/repositories');
  });

  it('returns empty array on non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await getInitialRepos();

    expect(result).toEqual([]);
  });

  it('returns empty array when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await getInitialRepos();

    expect(result).toEqual([]);
  });

  it('returns empty array when items is undefined', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total_count: 0 }),
    });

    const result = await getInitialRepos();

    expect(result).toEqual([]);
  });
});
