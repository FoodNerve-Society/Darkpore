import React from 'react';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';
import ClientLearnHub from '../components/ClientLearnHub';

export default async function GlobalLearnHub() {
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);
  const bottlenecks = tenant.com.homepage.bottlenecks;

  // Aggregate all materials from every bottleneck, sorted newest-first
  const rawMaterials = await getKnowledgeMaterials({ tenantId });
  
  console.log("SERVER LOG (Learn Hub) - Normalized Tenant ID:", tenantId);
  console.log("SERVER LOG (Learn Hub) - RAW materials length:", rawMaterials.length);

  const allMaterials = rawMaterials.map(m => {
    const b = bottlenecks.find(b => b.id === m.bottleneckId);
    return {
      ...m,
      bottleneckTitle: b?.title || 'General'
    };
  });

  // Unique category names for the filter bar
  const categories = Array.from(
    new Set(allMaterials.map((m) => m.bottleneckTitle)),
  );

  return (
    <ClientLearnHub
      initialMaterials={allMaterials}
      categories={categories}
      tenantName={tenant.name}
    />
  );
}
