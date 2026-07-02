import React from 'react';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { prisma } from '@/lib/db/client';
import ClientLearnHub from '../components/ClientLearnHub';

export default async function GlobalLearnHub() {
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  const challenges = tenant.com.homepage.challenges;

  // Aggregate all materials from every challenge, sorted newest-first
  let rawMaterials: any[] = [];
  try {
    const rawLC = await prisma.learnContent.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          include: {
            blocks: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    rawMaterials = rawLC.map((lc: any) => {
      const imageBlock = lc.article?.blocks?.find((b: any) => b.type === 'image' && b.payload?.url);
      return {
        id: lc.id,
        challengeId: lc.challengeId || 'global',
        subcategoryId: lc.subcategory || 'general',
        slug: lc.slug,
        title: lc.title,
        type: lc.type, 
        thumbnailUrl: lc.thumbnailUrl || imageBlock?.payload?.url || '/images/default-thumbnail.jpg',
        author: lc.authorName || 'Society Architect',
        dateAdded: lc.createdAt,
        readTime: lc.type === 'video' || lc.type === 'livestream' ? 'Watch' : '5 min read'
      };
    });
  } catch (e) {
    console.error("SERVER LOG (Learn Hub) - Failed to fetch from DB", e);
  }

  console.log("SERVER LOG (Learn Hub) - Normalized Tenant ID:", tenantId);
  console.log("SERVER LOG (Learn Hub) - RAW materials length:", rawMaterials.length);

  const allMaterials = rawMaterials.map(m => {
    const b = challenges.find(b => b.id === m.challengeId);
    return {
      ...m,
      challengeTitle: b?.title || 'General'
    };
  });

  // Unique category names for the filter bar
  const categories = Array.from(
    new Set(allMaterials.map((m) => m.challengeTitle)),
  );

  return (
    <ClientLearnHub
      initialMaterials={allMaterials}
      categories={categories}
      tenantName={tenant.name}
    />
  );
}
