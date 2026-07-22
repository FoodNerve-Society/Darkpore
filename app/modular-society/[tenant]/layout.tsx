import React from 'react';
import { SocietyProvider } from '@/context/SocietyContext';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { headers } from 'next/headers';
import { playfairDisplay, eduNswActFoundation, dosis, quicksand, ysabeauInfant } from '@/theme/fonts';
import { WikiProvider } from '@/app/components/providers/WikiProvider';
import { WikiDrawer } from '@/app/components/ui/WikiDrawer';

export default async function SocietyRootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';

  return (
    <>
        <ThemeRegistry initialTenant={tenantId}>
          <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading Ecosystem Engine...</div>}>
            <SocietyProvider>
              <WikiProvider>
                {children}
                <WikiDrawer />
              </WikiProvider>
            </SocietyProvider>
          </React.Suspense>
        </ThemeRegistry>
    </>
  );
}
