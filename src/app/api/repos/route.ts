import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const days = request.nextUrl.searchParams.get('days') || '7';
  const topic = request.nextUrl.searchParams.get('topic') || '';
  const daysNum = Math.min(Math.max(parseInt(days, 10) || 7, 1), 180);

  const since = new Date();
  since.setDate(since.getDate() - daysNum);
  const dateStr = since.toISOString().split('T')[0];

  const queryParts = [`created:>${dateStr}`];
  if (topic) {
    queryParts.push(topic);
  }

  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(queryParts.join(' '))}&sort=stars&order=desc&per_page=10`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      next: { revalidate: 300 },
    });

    if (res.status === 403) {
      const reset = res.headers.get('X-RateLimit-Reset');
      const waitSec = reset ? Math.ceil((Number(reset) * 1000 - Date.now()) / 1000) : 60;
      return NextResponse.json(
        { error: `Rate limited by GitHub. Try again in ${waitSec}s.` },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch from GitHub. Check your connection.' },
      { status: 500 }
    );
  }
}
