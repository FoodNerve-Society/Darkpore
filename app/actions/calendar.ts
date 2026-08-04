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
  eventType: 'article' | 'livestream' | 'general';
  title: string;
  challengeId?: string;
  subcategoryId?: string;
  eraId?: string;
  tenantId: string;
  description?: string;
  tags?: string;
  scopes: ('personal' | 'organization' | 'society')[];
  timelines: {
    personal?: { dateType: string, allDay: boolean, date: string, time: string, endDate?: string, endTime?: string, tasks?: any[] },
    organization?: { dateType: string, allDay: boolean, date: string, time: string, orgId?: string, endDate?: string, endTime?: string, requireApproval?: boolean, rules?: string, tasks?: any[] },
    society?: { dateType: string, allDay: boolean, date: string, time: string, endDate?: string, endTime?: string, description?: string, tasks?: any[] }
  }
}) {
  const sessionResult = await getCurrentSessionUser();
  if (!sessionResult.success || !sessionResult.data) {
    return { success: false, error: 'Unauthorized' };
  }
  const user = sessionResult.data;

  try {
    let sourceId = crypto.randomUUID();
    let reviewStatus = 'none';

    // 1. If it's a draft (article/livestream), create the LearnContent first
    if (payload.eventType === 'article' || payload.eventType === 'livestream') {
      const societyTimeline = payload.timelines.society;
      const targetDate = societyTimeline ? new Date(`${societyTimeline.date}T${societyTimeline.time}:00`) : new Date();
      
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
          targetDate: targetDate,
        }
      });
      sourceId = draft.id;
      
      if (payload.scopes.includes('organization')) {
         reviewStatus = 'drafting';
      }
    }

    // 2. Create the Calendar Events based on scopes
    for (const scope of payload.scopes) {
      const timeline = payload.timelines[scope as keyof typeof payload.timelines];
      if (!timeline || !timeline.date || !timeline.time) continue;

      const scheduledDate = new Date(`${timeline.date}T${timeline.time}:00`);
      let scheduledEndDate: Date | null = null;
      if (timeline.endDate && timeline.endTime) {
        scheduledEndDate = new Date(`${timeline.endDate}T${timeline.endTime}:00`);
      } else {
        scheduledEndDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
      }

      let dateType = timeline.dateType || 'START_TIME';

      let organizationId: string | null = null;
      if (scope === 'organization') {
        const orgTimeline = timeline as any;
        if (orgTimeline.orgId) {
          organizationId = orgTimeline.orgId;
        } else {
          const orgMember = await prisma.organizationMember.findFirst({
            where: { userId: user.id }
          });
          if (orgMember) organizationId = orgMember.organizationId;
        }
      }

      const compiledDescription = JSON.stringify({
        text: timeline.description || '',
        rules: timeline.rules || '',
        tasks: timeline.tasks || []
      });

      await prisma.calendarEvent.create({
        data: {
          sourceType: payload.eventType === 'general' ? 'meetEvent' : payload.eventType,
          sourceId: sourceId,
          tenantId: payload.tenantId,
          visibility: scope,
          organizationId: organizationId,
          userId: scope === 'personal' ? user.id : null,
          dateType: dateType,
          date: scheduledDate,
          endDate: scheduledEndDate,
          title: payload.title,
          description: compiledDescription,
          tags: payload.tags,
          category: payload.eventType === 'general' ? 'Meeting' : (payload.eventType === 'article' ? 'Article' : 'Livestream'),
          reviewStatus: reviewStatus
        }
      });
    }

    return { success: true, draftId: sourceId };
  } catch (err: any) {
    console.error("Error scheduling event:", err);
    return { success: false, error: err.message || 'Failed to schedule event' };
  }
}
