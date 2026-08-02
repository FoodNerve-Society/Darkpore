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

export async function scheduleCalendarEvent(payload: {
  targetScope: 'personal' | 'organization' | 'society';
  eventType: 'article' | 'livestream' | 'general';
  dateType?: 'START_TIME' | 'DEADLINE' | 'PUBLISH_DATE' | 'DATE_RANGE';
  title: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  challengeId?: string;
  subcategoryId?: string;
  eraId?: string;
  tenantId: string;
  description?: string;
  tags?: string;
  selectedOrgId?: string;
}) {
  const sessionResult = await getCurrentSessionUser();
  if (!sessionResult.success || !sessionResult.data) {
    return { success: false, error: 'Unauthorized' };
  }
  const user = sessionResult.data;

  try {
    const scheduledDate = new Date(`${payload.date}T${payload.time}:00`);
    let learnContentId: string | undefined;

    // 1. If it's a draft (article/livestream), create the LearnContent first
    if (payload.eventType === 'article' || payload.eventType === 'livestream') {
      const draft = await prisma.learnContent.create({
        data: {
          title: payload.title,
          slug: `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          description: `Scheduled ${payload.eventType}`,
          type: payload.eventType,
          status: 'scheduled',
          category: payload.challengeId,
          subcategory: payload.subcategoryId,
          timeframe: payload.eraId,
          authorName: user.name || 'Anonymous',
          authorId: user.id,
          authorAvatarUrl: user.avatarUrl,
          targetDate: scheduledDate,
        }
      });
      learnContentId = draft.id;
    }

    // 2. Create the Calendar Event
    let organizationId: string | null = null;
    if (payload.targetScope === 'organization') {
      if (payload.selectedOrgId) {
        organizationId = payload.selectedOrgId;
      } else {
        const orgMember = await prisma.organizationMember.findFirst({
          where: { userId: user.id }
        });
        if (orgMember) organizationId = orgMember.organizationId;
      }
    }

    let scheduledEndDate: Date | null = null;
    if (payload.endDate && payload.endTime) {
      scheduledEndDate = new Date(`${payload.endDate}T${payload.endTime}:00`);
    } else if (payload.dateType === 'START_TIME' || payload.dateType === 'DATE_RANGE') {
      scheduledEndDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000); // +1 hour default
    }

    const event = await prisma.calendarEvent.create({
      data: {
        sourceType: payload.eventType === 'general' ? 'meetEvent' : payload.eventType,
        sourceId: learnContentId || 'generic',
        tenantId: payload.tenantId,
        visibility: payload.targetScope,
        organizationId: organizationId,
        userId: payload.targetScope === 'personal' ? user.id : null,
        dateType: payload.dateType || 'START_TIME',
        date: scheduledDate,
        endDate: scheduledEndDate,
        title: payload.title,
        description: payload.description,
        tags: payload.tags,
        category: payload.eventType === 'general' ? 'Meeting' : (payload.eventType === 'article' ? 'Article' : 'Livestream'),
      }
    });

    return { success: true, draftId: learnContentId };
  } catch (err: any) {
    console.error("Error scheduling event:", err);
    return { success: false, error: err.message || 'Failed to schedule event' };
  }
}
