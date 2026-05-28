import React from 'react';
import { headers } from 'next/headers';
import { TENANTS, getTenantConfig } from '@/lib/cms';
import { getKnowledgeMaterials } from '@/lib/db/knowledge';
import BottleneckDashboardTabs from '../components/BottleneckDashboardTabs';

export function generateStaticParams() {
  const slugs: { bottleneck: string }[] = [];
  Object.values(TENANTS).forEach((tenant) => {
    tenant.com.homepage.bottlenecks.forEach((w) => slugs.push({ bottleneck: w.id }));
  });
  return slugs;
}

export default async function BottleneckMasterFeed({ params }: { params: Promise<{ bottleneck: string }> }) {
  const { bottleneck } = await params;
  const headersList = await headers();
  const rawTenantId = headersList.get('x-tenant-id') || 'food';
  const tenantId = rawTenantId.includes('energy') ? 'energy' : 'food';
  const tenant = getTenantConfig(tenantId);

  const bottleneckData = tenant.com.homepage.bottlenecks.find(w => w.id === bottleneck);

  if (!bottleneckData) return null;

  // Pre-sort updates server-side (most recent first)
  const feedUpdates = [...bottleneckData.updates]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const learningMaterials = await getKnowledgeMaterials({ tenantId, bottleneckId: bottleneckData.id });

  return (
    <BottleneckDashboardTabs
      bottleneckId={bottleneck}
      feedUpdates={feedUpdates}
      learningMaterials={learningMaterials}
    />
  );
}
