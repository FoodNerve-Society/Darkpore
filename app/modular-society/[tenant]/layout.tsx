import React from 'react';
import { SocietyProvider } from '@/context/SocietyContext';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { headers } from 'next/headers';
import { playfairDisplay, eduNswActFoundation, dosis, quicksand, ysabeauInfant } from '@/theme/fonts';
import { WikiProvider } from '@/app/components/providers/WikiProvider';
import { WikiDrawer } from '@/app/components/ui/WikiDrawer';
import LivelyLoadingScreen from '@/components/LivelyLoadingScreen';

import { ClipNoteProvider } from '@/context/ClipNoteContext';

export default async function SocietyRootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';

  return (
    <>
        <ThemeRegistry initialTenant={tenantId}>
          <React.Suspense fallback={<LivelyLoadingScreen />}>
            <SocietyProvider>
              <WikiProvider>
                <ClipNoteProvider tenantId={tenantId}>
                  {children}
                  <WikiDrawer />
                </ClipNoteProvider>
              </WikiProvider>
            </SocietyProvider>
          </React.Suspense>
        </ThemeRegistry>
    </>
  );
}
