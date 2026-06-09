// @ts-nocheck
import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import ClientJoin from './ClientJoin';

export default async function LoginPage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'org';

  const themeId = headersList.get('x-theme-id') || 'innovations';
  const tenantTheme = themeId as 'society' | 'darkpore' | 'innovations';

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientJoin initialTenant={tenantTheme} />
    </Suspense>
  );
}
