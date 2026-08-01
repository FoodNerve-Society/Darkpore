'use server';

import { prisma } from '@/lib/db/client';
import { getCurrentSessionUser } from '@/lib/actions/users';

export async function getCalendarEvents(tenantId: string) {
  const sessionResult = await getCurrentSessionUser();
  const userId = sessionResult.success && sessionResult.data ? sessionResult.data.id : null;

  let userOrganizationIds: string[] = [];

  if (userId) {
    const userOrgs = await prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true }
    });
    userOrganizationIds = userOrgs.map(org => org.organizationId);
  }

  return prisma.calendarEvent.findMany({
    where: {
      tenantId,
      status: { not: 'expired' },
      OR: [
        { visibility: 'society' },
        ...(userId ? [{ visibility: 'personal', userId }] : []),
        ...(userOrganizationIds.length > 0 ? [{ visibility: 'organization', organizationId: { in: userOrganizationIds } }] : [])
      ]
    },
    orderBy: { date: 'asc' },
  });
}
