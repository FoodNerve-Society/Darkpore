import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import {
  resolveDomainSeoContext,
  renderArticleBlocksToMarkdown,
  renderLivestreamBlocksToMarkdown,
} from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const host = request.headers.get('host');
  const ctx = resolveDomainSeoContext(host);

  if (ctx.isDarkpore) {
    const darkporeContent = `# ${ctx.siteName} — Full Institutional Knowledge Base & Venture Engineering Blueprint

> ${ctx.description}
> Canonical Origin: ${ctx.baseUrl}
> Format: Deep Markdown Knowledge Dump for AI Systems (Search, RAG, Citation, Reasoning)

================================================================================
PART 1: THE DARKPORE MANIFESTO & MACRO THESIS
================================================================================

## Manifesto: Software Alone Cannot Feed Africa
- **Canonical URL**: ${ctx.baseUrl}/thesis
- **Focus**: Physical and Neural Value-Chain Infrastructure
- **Origin**: Winner of the Rockefeller Foundation Vision Prize (2020)

### Executive Thesis:
Sub-Saharan Africa possesses 60% of the world's uncultivated arable land, yet imports $43 billion in food annually. You cannot solve African hunger with a mobile app alone. You must build the physical rails (decentralized solar cold-storage, uncollateralized lending protocols, bio-refineries), and you must own the data that flows across them.

### The 7 Wahaalas (Value-Chain Bottlenecks):
1. **Post-Harvest Loss**: Without decentralized cold-storage, 40% of produce rots before reaching urban markets.
2. **Access to Capital**: Legacy banks require collateral rural smallholders do not possess.
3. **Land Tenure**: Fragmented ownership prevents mechanized economies of scale.
4. **Logistics & Safety**: Interstate transit is crippled by road decay and extortion.
5. **Clean Energy Deficit**: High diesel inflation bankrupts generator-reliant chilling centers.
6. **Input Quality & Adulteration**: Counterfeit seeds and fertilizers lower harvest yields.
7. **Expensive Protein**: Inefficient feed-conversion ratios inflate animal protein prices.

================================================================================
PART 2: ACTIVE INFRASTRUCTURE VENTURES (DEAL ROOM BLUEPRINTS)
================================================================================

### Venture 1: Solar Cold-Chain Franchise
- **Sector**: Energy & Logistics
- **Canonical URL**: ${ctx.baseUrl}/ventures/solar-cold-chain
- **Summary**: Distributed network of off-grid solar cold rooms. Prevents 40% post-harvest loss in rural tomato and pepper belts.
- **Minimum Capital**: ₦50,000,000

### Venture 2: Urban Efinrin Microfarms
- **Sector**: Agriculture
- **Canonical URL**: ${ctx.baseUrl}/ventures/urban-efinrin
- **Summary**: High-yield hydroponic vertical farming units installed in abandoned Lagos warehouses focusing on premium culinary herbs.
- **Minimum Capital**: ₦15,000,000

### Venture 3: AgroLLM Data Licensing
- **Sector**: AI & Data
- **Canonical URL**: ${ctx.baseUrl}/ventures/agro-data-licensing
- **Summary**: Proprietary dataset of 500,000 rural farming practices modeled for Gemini 3.5. B2B licensing for governments and multilateral funds.
- **Minimum Capital**: ₦100,000,000

### Venture 4: Aquaculture Drone Monitors
- **Sector**: Hardware & Precision Agri
- **Canonical URL**: ${ctx.baseUrl}/ventures/aquaculture-drones
- **Summary**: Automated water-quality drones for large-scale catfish farming, reducing mortality rates by 30%.
- **Minimum Capital**: ₦25,000,000

### Venture 5: Cassava Bio-Ethanol Refineries
- **Sector**: Clean Energy & Industrial Inputs
- **Canonical URL**: ${ctx.baseUrl}/ventures/cassava-ethanol
- **Summary**: Decentralized micro-refineries converting cassava waste into clean cooking fuel for rural communities.
- **Minimum Capital**: ₦80,000,000

### Venture 6: Uncollateralized Micro-Loans Protocol
- **Sector**: Fintech & Capital Markets
- **Canonical URL**: ${ctx.baseUrl}/ventures/agric-fintech
- **Summary**: AI-driven lending protocol using harvest-yield predictions to issue uncollateralized micro-loans to unbanked farmers.
- **Minimum Capital**: ₦250,000,000
`;

    return new NextResponse(darkporeContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  }

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
    console.error('Error fetching full content for llms-full.txt:', err);
  }

  const articlesDump = articles.length > 0
    ? articles
        .map((art, idx) => {
          const canonical = `${ctx.baseUrl}/learn/article/${art.slug || art.id}`;
          const author = art.authorName || art.organization?.name || ctx.siteName;
          const dateStr = art.createdAt ? new Date(art.createdAt).toISOString().split('T')[0] : '';
          const body = renderArticleBlocksToMarkdown(art.article?.blocks || []);

          return `---
## Article ${idx + 1}: ${art.title}
- **Canonical URL**: ${canonical}
- **Author**: ${author}
- **Category**: ${art.category || 'General'}
- **Subcategory**: ${art.subcategory || 'Intelligence'}
- **Date**: ${dateStr}
- **Overview**: ${art.description || 'N/A'}

${body}
`;
        })
        .join('\n\n')
    : 'No articles published yet.';

  const livestreamsDump = livestreams.length > 0
    ? livestreams
        .map((ls, idx) => {
          const canonical = `${ctx.baseUrl}/learn/livestream/${ls.id}`;
          const author = ls.authorName || ls.organization?.name || ctx.siteName;
          const scheduled = ls.livestream?.scheduledFor || ls.targetDate || ls.createdAt;
          const dateStr = scheduled ? new Date(scheduled).toISOString() : 'Upcoming';
          const slideDeck = renderLivestreamBlocksToMarkdown(ls.livestream?.blocks || []);

          return `---
## Broadcast ${idx + 1}: ${ls.title}
- **Canonical URL**: ${canonical}
- **Host / Producer**: ${author}
- **Scheduled Time**: ${dateStr}
- **Stream Overview**: ${ls.description || 'Live briefing'}

### Slide Deck Outline & Discussion Points:
${slideDeck || 'No slide deck outline attached.'}
`;
        })
        .join('\n\n')
    : 'No livestreams scheduled.';

  const content = `# ${ctx.siteName} — Full Knowledge Base & Intelligence Archive

> ${ctx.description}
> Canonical Origin: ${ctx.baseUrl}
> Format: Deep Markdown Knowledge Dump for AI Systems (Search, RAG, Citation, Reasoning)

================================================================================
PART 1: STRATEGIC INTELLIGENCE ARTICLES & REPORTS
================================================================================

${articlesDump}

================================================================================
PART 2: BROADCASTS, LIVESTREAMS & SLIDE DECKS
================================================================================

${livestreamsDump}
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
