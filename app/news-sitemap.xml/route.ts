import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { resolveDomainSeoContext } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request: NextRequest) {
  const host = request.headers.get('host');
  const ctx = resolveDomainSeoContext(host);

  let items: any[] = [];
  if (!ctx.isDarkpore) {
    try {
      items = await prisma.learnContent.findMany({
        where: {
          type: { in: ['article', 'livestream'] },
          status: { in: ['published', 'scheduled'] },
          createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
        select: {
          id: true,
          slug: true,
          type: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      });
    } catch (err) {
      console.error('Error fetching content for news-sitemap:', err);
    }
  }

  const urlsXml = items
    .map((item) => {
      const canonical = item.type === 'livestream'
        ? `${ctx.baseUrl}/learn/livestream/${item.id}`
        : `${ctx.baseUrl}/learn/article/${item.slug || item.id}`;
      const pubDate = new Date(item.createdAt || item.updatedAt || Date.now()).toISOString();
      const safeTitle = escapeXml(item.title || ctx.siteName);
      const safePubName = escapeXml(ctx.siteName);

      return `  <url>
    <loc>${canonical}</loc>
    <news:news>
      <news:publication>
        <news:name>${safePubName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
