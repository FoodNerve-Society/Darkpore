import React from 'react';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ClientFooter from './ClientFooter';

export default async function Footer() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  const orgDomain = tenantId === 'energy' ? 'energynerve.org' : 'foodnerve.org';

  return <ClientFooter tenantName={tenant.name} tenantDomain={tenant.domain} orgDomain={orgDomain} />;
}
