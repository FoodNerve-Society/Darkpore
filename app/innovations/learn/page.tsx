import React from 'react';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ClientLearnHub from '../components/ClientLearnHub';

export default async function GlobalLearnHub() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);

  // Aggregate all materials from every bottleneck, sorted newest-first
  const allMaterials = tenant.com.homepage.bottlenecks
    .flatMap((b) =>
      (b.learningMaterials || []).map((m) => ({
        ...m,
        bottleneckId: b.id,
        bottleneckTitle: b.title,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    );

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
