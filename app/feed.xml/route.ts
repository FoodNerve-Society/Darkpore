import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import {
  resolveDomainSeoContext,
  extractArticleSummaryAndFaqs,
  renderArticleBlocksToHtml,
  renderLivestreamBlocksToHtml,
} from '@/lib/seo/schema';

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

  let feedItems: any[] = [];
  if (!ctx.isDarkpore) {
    try {
      feedItems = await prisma.learnContent.findMany({
        where: {
          type: { in: ['article', 'livestream'] },
          status: { in: ['published', 'scheduled'] },
        },
        include: {
          article: {
            include: {
              blocks: { orderBy: { orderIndex: 'asc' } },
            },
          },
          livestream: {
            include: {
              blocks: { orderBy: { orderIndex: 'asc' } },
            },
          },
          organization: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (err) {
      console.error('Error fetching items for feed.xml:', err);
    }
  }

  const itemsXml = feedItems
    .map((item) => {
      const isLivestream = item.type === 'livestream';
      const canonical = isLivestream
        ? `${ctx.baseUrl}/learn/livestream/${item.id}`
        : `${ctx.baseUrl}/learn/article/${item.slug || item.id}`;

      const rawDate = isLivestream
        ? (item.livestream?.scheduledFor || item.targetDate || item.createdAt)
        : (item.createdAt || item.updatedAt);
      const pubDate = new Date(rawDate || Date.now()).toUTCString();

      const author = item.authorName || item.organization?.name || ctx.siteName;
      const { summary } = extractArticleSummaryAndFaqs(item.article?.blocks || []);
      const description =
        item.description ||
        (isLivestream ? 'Operational live briefing and strategic slide deck.' : summary) ||
        ctx.description;

      const safeTitle = escapeXml(item.title || ctx.siteName);
      const safeDesc = escapeXml(description);
      const safeAuthor = escapeXml(author);

      // High-resolution 16:9 thumbnail (guaranteed 1280x720 for MSN / Edge)
      let thumbUrl = item.thumbnailUrl;
      if (!thumbUrl || thumbUrl.trim() === '') {
        thumbUrl = `${ctx.baseUrl}/api/og/card?title=${encodeURIComponent(item.title || ctx.siteName)}`;
      } else if (!thumbUrl.startsWith('http://') && !thumbUrl.startsWith('https://')) {
        thumbUrl = `${ctx.baseUrl}${thumbUrl.startsWith('/') ? '' : '/'}${thumbUrl}`;
      }
      const thumbXml = `\n      <media:thumbnail url="${escapeXml(thumbUrl)}" width="1280" height="720" />`;

      // Full semantic HTML for Microsoft Start / Edge ingestion
      const rawHtml = isLivestream
        ? renderLivestreamBlocksToHtml(item)
        : renderArticleBlocksToHtml(item.article?.blocks || []);
      const safeCdataHtml = (rawHtml || `<p>${safeDesc}</p>`).replace(/\]\]>/g, ']]]]><![CDATA[>');

      return `    <item>
      <title>${safeTitle}</title>
      <link>${canonical}</link>
      <guid isPermaLink="true">${canonical}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${safeAuthor}</dc:creator>
      <description>${safeDesc}</description>
      <content:encoded><![CDATA[${safeCdataHtml}]]></content:encoded>${thumbXml}
    </item>`;
    })
    .join('\n');

  const nowRfc822 = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(ctx.siteName)}</title>
    <link>${ctx.baseUrl}</link>
    <description>${escapeXml(ctx.description)}</description>
    <language>en</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
    <atom:link href="${ctx.baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
