import { redirect } from 'next/navigation';

export default function OrgManagementDashboardLegacyRedirect({ params }: { params: { slug: string, tenant: string } }) {
  // We have moved the organization management dashboard to the unified Command Center at /profile
  redirect(`/modular-society/${params.tenant}/profile`);
}
