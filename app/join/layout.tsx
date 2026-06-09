// @ts-nocheck
import React from 'react';
import ThemeRegistry from '@/theme/ThemeRegistry';

import { SocietyProvider } from '@/context/SocietyContext';

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading Auth...</div>}>
        <SocietyProvider>
          {children}
        </SocietyProvider>
      </React.Suspense>
    </ThemeRegistry>
  );
}
