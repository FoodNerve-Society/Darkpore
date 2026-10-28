import { NextRequest } from 'next/server';
import { getIndexNowKey } from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const keyParam =
    request.nextUrl?.searchParams?.get('key') ||
    new URL(request.url).searchParams.get('key') ||
    '';
  const activeKey = getIndexNowKey();

  if (!keyParam || keyParam.toLowerCase() !== activeKey.toLowerCase()) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(activeKey, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
