import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { resolveDomainSeoContext, extractArticleSummaryAndFaqs } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host');
  const ctx = resolveDomainSeoContext(host);

  let articles: any[] = [];
  let livestreams: any[] = [];

  try {
    articles = await prisma.learnContent.findMany({
      where: {
        type: 'article',
        status: 'published',
      },
      include: {
        article: {
          include: {
            blocks: { orderBy: { orderIndex: 'asc' } },
          },
        },
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    livestreams = await prisma.learnContent.findMany({
      where: {
        type: 'livestream',
        status: { in: ['published', 'scheduled'] },
      },
      include: {
        livestream: true,
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (err) {
    console.error('Error fetching content for llms.txt:', err);
  }

  const articlesSection = articles.length > 0
    ? articles
        .map((art) => {
          const author = art.authorName || art.organization?.name || ctx.siteName;
          const category = art.category ? `Category: ${art.category} | ` : '';
          const { summary } = extractArticleSummaryAndFaqs(art.article?.blocks || []);
          const desc = art.description || summary || 'No summary available.';
          const canonical = `${ctx.baseUrl}/learn/article/${art.slug || art.id}`;
          return `- [${art.title}](${canonical}): ${desc} (${category}Author: ${author})`;
        })
        .join('\n')
    : '- No published articles available.';

  const livestreamsSection = livestreams.length > 0
    ? livestreams
        .map((ls) => {
          const scheduled = ls.livestream?.scheduledFor || ls.targetDate || ls.createdAt;
          const dateStr = scheduled ? new Date(scheduled).toISOString().split('T')[0] : 'Upcoming';
          const author = ls.authorName || ls.organization?.name || ctx.siteName;
          const canonical = `${ctx.baseUrl}/learn/livestream/${ls.id}`;
          return `- [${ls.title}](${canonical}): ${ls.description || 'Live briefing'} (Date: ${dateStr} | Host: ${author})`;
        })
        .join('\n')
    : '- No broadcasts scheduled.';

  const coreResources = ctx.isDarkpore
    ? `- [Active Ventures](${ctx.baseUrl}/ventures): Browse the complete 1-to-N physical and neural infrastructure venture matrix.
- [The Manifesto & Thesis](${ctx.baseUrl}/thesis): Why software alone cannot feed Africa and how we engineer physical value-chain rails.
- [Institutional Whale Intake](${ctx.baseUrl}/partners): Syndicate partnership, sovereign capital deployment, and family office allocation.
- [Model Stress Test](${ctx.baseUrl}/stress-test): Algorithmic stress-testing of venture balance sheets and commodity macro-shocks.
- [Compliance & Legal](${ctx.baseUrl}/legal): SEC disclaimers and regulatory framework.
- [Full Knowledge Dump](${ctx.baseUrl}/llms-full.txt): Complete structured text of all ventures, thesis manifesto, and deal blueprints.
- [Syndication Feed](${ctx.baseUrl}/feed.xml): Machine-readable RSS feed.`
    : ctx.isSociety
    ? `- [Learning Hub](${ctx.baseUrl}/learn): Strategic intelligence reports, value chain playbooks, and research.
- [Editorial & Event Calendar](${ctx.baseUrl}/calendar): Upcoming scheduled livestreams, field briefings, and operational summits.
- [Commodity Trade Desk](${ctx.baseUrl}/trade): Verified cooperative trade listings, procurement requests, and forward contracts.
- [Society Meet](${ctx.baseUrl}/meet): Working groups and cooperative assemblies.
- [Society Support](${ctx.baseUrl}/support): Technical assistance and dispute resolution.
- [Full Knowledge Dump](${ctx.baseUrl}/llms-full.txt): Complete structured text of all intelligence analyses, myth vs. fact tables, and unit economics.
- [Syndication Feed](${ctx.baseUrl}/feed.xml): Machine-readable RSS/Atom feed of all published intelligence.`
    : `- [Learning Hub](${ctx.baseUrl}/learn): Strategic intelligence reports, value chain playbooks, and research.
- [Editorial & Event Calendar](${ctx.baseUrl}/calendar): Upcoming scheduled livestreams, field briefings, and operational summits.
- [Career Opportunities & Trade Desk](${ctx.baseUrl}/careers): Verified enterprise positions, field missions, and commodity market listings.
- [Full Knowledge Dump](${ctx.baseUrl}/llms-full.txt): Complete structured text of all intelligence analyses, myth vs. fact tables, and unit economics.
- [Syndication Feed](${ctx.baseUrl}/feed.xml): Machine-readable RSS/Atom feed of all published intelligence.`;

  const content = `# ${ctx.siteName}

> ${ctx.description}

## Core Resources
${coreResources}

## Published Intelligence Articles
${articlesSection}

## Scheduled & Live Broadcasts
${livestreamsSection}

## Domain Details
- Canonical Base URL: ${ctx.baseUrl}
- Platform Operator: Darkpore Operations
- Machine License: Open for AI search indexation, retrieval-augmented generation (RAG), and citation with canonical attribution.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
