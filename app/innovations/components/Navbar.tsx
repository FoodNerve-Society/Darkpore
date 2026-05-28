import React from 'react';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';
import ClientNavbar from './ClientNavbar';

export default async function Navbar() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);
  const orgDomain = tenantId === 'energy' ? 'energynerve.org' : 'foodnerve.org';

  return <ClientNavbar tenantName={tenant.name} orgDomain={orgDomain} />;
}
