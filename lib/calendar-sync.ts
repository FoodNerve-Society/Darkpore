import { prisma } from '@/lib/db/client';

export type CalendarDateType = 'DEADLINE' | 'START_TIME' | 'PUBLISH_DATE' | 'DATE_RANGE';

export interface CalendarEventSyncParams {
  sourceType: string; // 'job' | 'listing' | 'livestream' | 'article' | 'video' | 'class' | 'report' | 'meetEvent' | 'campaign'
  sourceId: string;
  slug?: string;
  dateType?: CalendarDateType;
  title: string;
  date: Date;
  endDate?: Date;
  imageUrl?: string;
  category?: string;
  organizationName?: string;
  status?: 'upcoming' | 'live' | 'expired';
}

/**
 * Upserts a calendar event record associated with a specific source.
 * Safe to run on creates and updates.
 */
export async function syncCalendarEvent(params: CalendarEventSyncParams) {
  try {
    return await prisma.calendarEvent.upsert({
      where: {
        sourceType_sourceId: {
          sourceType: params.sourceType,
          sourceId: params.sourceId,
        },
      },
      create: {
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        slug: params.slug || null,
        dateType: params.dateType || 'START_TIME',
        title: params.title,
        date: params.date,
        endDate: params.endDate || null,
        imageUrl: params.imageUrl || null,
        category: params.category || null,
        organizationName: params.organizationName || null,
        status: params.status ?? 'upcoming',
      },
      update: {
        slug: params.slug || null,
        dateType: params.dateType || 'START_TIME',
        title: params.title,
        date: params.date,
        endDate: params.endDate || null,
        imageUrl: params.imageUrl || null,
        category: params.category || null,
        organizationName: params.organizationName || null,
        ...(params.status && { status: params.status }),
      },
    });
  } catch (error) {
    console.error(`[CalendarSync] Error syncing event for ${params.sourceType}:${params.sourceId}:`, error);
    throw error;
  }
}

/**
 * Deletes a calendar event record when its source record is removed.
 */
export async function removeCalendarEvent(sourceType: string, sourceId: string) {
  try {
    return await prisma.calendarEvent.deleteMany({
      where: {
        sourceType,
        sourceId,
      },
    });
  } catch (error) {
    console.error(`[CalendarSync] Error removing event for ${sourceType}:${sourceId}:`, error);
    throw error;
  }
}

/**
 * Query helper to fetch calendar events within a date range or category filter.
 */
export async function getCalendarEvents(options?: {
  startDate?: Date;
  endDate?: Date;
  sourceType?: string;
  category?: string;
  limit?: number;
}) {
  const where: any = {};

  if (options?.startDate || options?.endDate) {
    where.date = {};
    if (options.startDate) where.date.gte = options.startDate;
    if (options.endDate) where.date.lte = options.endDate;
  }

  if (options?.sourceType) {
    where.sourceType = options.sourceType;
  }

  if (options?.category) {
    where.category = options.category;
  }

  if (!prisma || !prisma.calendarEvent) {
    console.warn("[CalendarSync] Prisma or calendarEvent model is undefined. Returning empty events.");
    return [];
  }

  return prisma.calendarEvent.findMany({
    where,
    orderBy: { date: 'asc' },
    take: options?.limit ?? 50,
  });
}
