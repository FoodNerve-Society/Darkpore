import { redirect } from 'next/navigation';

export default async function OrgManagementDashboardLegacyRedirect({ params }: { params: Promise<{ slug: string, tenant: string }> }) {
  // We have moved the organization management dashboard to the unified Command Center at /profile
  const { tenant } = await params;
  redirect(`/modular-society/${tenant}/profile`);
}
