import { headers } from 'next/headers';
import SocietyClient from './SocietyClient';

export default async function SocietyPage() {
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id') || 'unknown';
  
  return <SocietyClient tenantId={tenantId} />;
}
