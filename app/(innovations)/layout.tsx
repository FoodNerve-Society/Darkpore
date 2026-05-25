import ThemeProvider from '@/components/ThemeProvider';
import { Dosis, Ysabeau_Infant, Quicksand, Edu_NSW_ACT_Foundation } from 'next/font/google';
import { headers } from 'next/headers';
import { getTenantConfig } from '@/lib/tenants.config';

// 1. Load Premium Typography
const fontDosis = Dosis({ subsets: ['latin'], variable: '--font-dosis' });
const fontYsabeau = Ysabeau_Infant({ subsets: ['latin'], variable: '--font-ysabeau' });
const fontQuicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' });
const fontEdu = Edu_NSW_ACT_Foundation({ subsets: ['latin'], variable: '--font-edu' });

export default async function InnovationsLayout({ children }: { children: React.ReactNode }) {
  // 2. Fetch Tenant Data
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'food';
  const tenant = getTenantConfig(tenantId);

  return (
    <html lang="en" className={`${fontDosis.variable} ${fontYsabeau.variable} ${fontQuicksand.variable} ${fontEdu.variable}`}>
      <body>
        <ThemeProvider initialTenant={tenantId}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
