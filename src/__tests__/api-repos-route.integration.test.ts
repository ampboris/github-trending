/**
 * @jest-environment node
 */
import { GET } from '@/app/api/repos/route';
import { NextRequest } from 'next/server';

const GITHUB_API_BASE = 'https://api.github.com/search/repositories';

function makeRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost/api/repos');
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return new NextRequest(url);
}

function mockFetchSuccess(data: unknown) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
    headers: new Headers(),
  });
}

function mockFetchStatus(status: number, headers?: Record<string, string>) {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve({ message: 'error' }),
    headers: new Headers(headers),
  });
}

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

/** Extract the date from the GitHub API URL and assert it's ~N days ago. */
function expectDateDaysAgo(calledUrl: string, expectedDays: number) {
  const decoded = decodeURIComponent(calledUrl);
  const dateMatch = decoded.match(/created:>(\d{4}-\d{2}-\d{2})/);
  expect(dateMatch).not.toBeNull();
  const urlDate = new Date(dateMatch![1]);
  const expected = new Date();
  expected.setDate(expected.getDate() - expectedDays);
  expect(Math.abs(urlDate.getTime() - expected.getTime())).toBeLessThan(1.5 * 86400000);
}

describe('GET /api/repos', () => {
  it('uses default 7-day window when no days param', async () => {
    const mockData = { total_count: 1, items: [{ id: 1 }] };
    global.fetch = mockFetchSuccess(mockData);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(body).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain(GITHUB_API_BASE);
    expectDateDaysAgo(calledUrl, 7);
  });

  it('uses custom days param (14)', async () => {
    global.fetch = mockFetchSuccess({ items: [] });

    await GET(makeRequest({ days: '14' }));

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expectDateDaysAgo(calledUrl, 14);
  });

  it('treats days=0 as falsy, falls back to 7 days', async () => {
    // parseInt('0') is 0, which is falsy, so `|| 7` kicks in → 7 days
    global.fetch = mockFetchSuccess({ items: [] });

    await GET(makeRequest({ days: '0' }));

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expectDateDaysAgo(calledUrl, 7);
  });

  it('clamps days=999 to 180', async () => {
    global.fetch = mockFetchSuccess({ items: [] });

    await GET(makeRequest({ days: '999' }));

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expectDateDaysAgo(calledUrl, 180);
  });

  it('falls back to 7 days for non-numeric days param', async () => {
    global.fetch = mockFetchSuccess({ items: [] });

    await GET(makeRequest({ days: 'abc' }));

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expectDateDaysAgo(calledUrl, 7);
  });

  it('includes topic in query when topic param provided', async () => {
    global.fetch = mockFetchSuccess({ items: [] });

    await GET(makeRequest({ days: '7', topic: 'claude-code OR anthropic+cli' }));

    const calledUrl = decodeURIComponent((global.fetch as jest.Mock).mock.calls[0][0] as string);
    expect(calledUrl).toContain('claude-code OR anthropic+cli');
    expectDateDaysAgo(calledUrl, 7);
  });

  it('omits topic from query when topic param is empty', async () => {
    global.fetch = mockFetchSuccess({ items: [] });

    await GET(makeRequest({ days: '7', topic: '' }));

    const calledUrl = decodeURIComponent((global.fetch as jest.Mock).mock.calls[0][0] as string);
    expect(calledUrl).not.toContain('topic');
    expectDateDaysAgo(calledUrl, 7);
  });

  it('returns 429 when GitHub returns 403 with X-RateLimit-Reset', async () => {
    const resetTime = Math.floor(Date.now() / 1000) + 120;
    global.fetch = mockFetchStatus(403, { 'X-RateLimit-Reset': String(resetTime) });

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toMatch(/Rate limited by GitHub/);
    expect(body.error).toMatch(/Try again in \d+s/);
  });

  it('returns 429 with 60s fallback when 403 has no reset header', async () => {
    global.fetch = mockFetchStatus(403);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toContain('Try again in 60s');
  });

  it('passes through non-403 error status from GitHub', async () => {
    global.fetch = mockFetchStatus(500);

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain('GitHub API error: 500');
  });

  it('returns 500 when fetch throws a network error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const res = await GET(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain('Failed to fetch from GitHub');
  });
});
