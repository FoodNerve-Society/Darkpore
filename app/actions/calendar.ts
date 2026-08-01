'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/firebase-admin';

export async function getCalendarEvents(tenantId: string) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.uid;

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
