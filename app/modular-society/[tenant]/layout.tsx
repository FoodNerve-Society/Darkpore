import React from 'react';
import { SocietyProvider } from '@/context/SocietyContext';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { headers } from 'next/headers';
import { playfairDisplay, eduNswActFoundation, dosis, quicksand, ysabeauInfant } from '@/theme/fonts';

export default async function SocietyRootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';

  return (
    <>
        <ThemeRegistry initialTenant={tenantId}>
          <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading Ecosystem Engine...</div>}>
            <SocietyProvider>
              {children}
            </SocietyProvider>
          </React.Suspense>
        </ThemeRegistry>
    </>
  );
}
