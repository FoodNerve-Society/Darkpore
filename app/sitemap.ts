import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/client';
import { resolveDomainSeoContext } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

export default async function sitemap(customHost?: string): Promise<MetadataRoute.Sitemap> {
  let host = customHost || null;
  if (!host) {
    try {
      const headersList = await headers();
      host = headersList.get('host');
    } catch {
      host = null;
    }
  }
  const ctx = resolveDomainSeoContext(host);

  const now = new Date();

  // 1. Darkpore Holding Company Cluster
  if (ctx.isDarkpore) {
    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: `${ctx.baseUrl}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${ctx.baseUrl}/thesis`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${ctx.baseUrl}/ventures`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${ctx.baseUrl}/partners`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/stress-test`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/legal`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${ctx.baseUrl}/llms.txt`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${ctx.baseUrl}/llms-full.txt`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      },
    ];

    const ventureDeals = [
      'solar-cold-chain',
      'urban-efinrin',
      'agro-data-licensing',
      'aquaculture-drones',
      'cassava-ethanol',
      'agric-fintech',
    ];
    for (const dealId of ventureDeals) {
      staticRoutes.push({
        url: `${ctx.baseUrl}/ventures/${dealId}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Darkpore does not serve FoodNerve learnContent or trade listings
    return staticRoutes;
  }

  // 2. Static Domain Routes for Society (.org) and Market (.com)
  const staticRoutes: MetadataRoute.Sitemap = [];

  if (ctx.isSociety) {
    staticRoutes.push(
      {
        url: `${ctx.baseUrl}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${ctx.baseUrl}/learn`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${ctx.baseUrl}/calendar`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/trade`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${ctx.baseUrl}/meet`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/support`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/about`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${ctx.baseUrl}/llms.txt`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${ctx.baseUrl}/llms-full.txt`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      }
    );
  } else {
    staticRoutes.push(
      {
        url: `${ctx.baseUrl}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${ctx.baseUrl}/learn`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${ctx.baseUrl}/calendar`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/careers`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${ctx.baseUrl}/about`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${ctx.baseUrl}/llms.txt`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${ctx.baseUrl}/llms-full.txt`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.7,
      }
    );
  }

  // 3. Published & Scheduled Learn Content (Articles, Livestreams, Reports, Classes)
  let contentRoutes: MetadataRoute.Sitemap = [];
  try {
    const contents = await prisma.learnContent.findMany({
      where: {
        status: { in: ['published', 'scheduled'] },
      },
      select: {
        id: true,
        slug: true,
        type: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 2000,
    });

    contentRoutes = contents.map((item) => {
      const canonicalPath = item.type === 'livestream'
        ? `/learn/livestream/${item.id}`
        : `/learn/${item.type}/${item.slug || item.id}`;
      return {
        url: `${ctx.baseUrl}${canonicalPath}`,
        lastModified: item.updatedAt || item.createdAt || now,
        changeFrequency: item.type === 'livestream' ? 'daily' : 'weekly',
        priority: 0.8,
      };
    });
  } catch (err) {
    console.error('Error generating sitemap content routes:', err);
  }

  // 4. Active Trade / Opportunity Listings
  let tradeRoutes: MetadataRoute.Sitemap = [];
  try {
    if (ctx.isSociety) {
      const listings = await prisma.tradeListing.findMany({
        where: {
          status: 'active',
        },
        select: {
          id: true,
          postedAt: true,
        },
        orderBy: { postedAt: 'desc' },
        take: 1000,
      });

      tradeRoutes = listings.map((l) => ({
        url: `${ctx.baseUrl}/trade/${l.id}`,
        lastModified: l.postedAt || now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    } else {
      const listings = await prisma.tradeListing.findMany({
        where: {
          status: 'active',
          category: { in: ['jobs', 'job', 'volunteer', 'internship', 'internships'] },
        },
        select: {
          id: true,
          postedAt: true,
        },
        orderBy: { postedAt: 'desc' },
        take: 1000,
      });

      tradeRoutes = listings.map((l) => ({
        url: `${ctx.baseUrl}/careers/${l.id}`,
        lastModified: l.postedAt || now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error('Error generating sitemap trade/career routes:', err);
  }

  return [...staticRoutes, ...contentRoutes, ...tradeRoutes];
}
