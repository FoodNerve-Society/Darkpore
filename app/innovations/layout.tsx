import ThemeRegistry from '@/theme/ThemeRegistry';
import { playfairDisplay, eduNswActFoundation, dosis, quicksand, ysabeauInfant } from '@/theme/fonts';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/cms';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default async function InnovationsLayout({ children }: { children: React.ReactNode }) {
  // 2. Fetch Tenant Data
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';

  return (
    <html lang="en" className={`${playfairDisplay.variable} ${eduNswActFoundation.variable} ${dosis.variable} ${quicksand.variable} ${ysabeauInfant.variable}`}>
      <body>
        <ThemeRegistry initialTenant={tenantId}>
          <Navbar />
          {children}
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
