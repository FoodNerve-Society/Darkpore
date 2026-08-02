'use server';

import { getCalendarEvents } from '@/lib/calendar-sync';
import { getCalendarEventRoute } from '@/lib/calendar-routes';

export async function fetchCalendarEvents(options: {
  tenantId: string;
  startDate?: string;
  endDate?: string;
  sourceType?: string;
  category?: string;
  limit?: number;
}) {
  try {
    const events = await getCalendarEvents({
      tenantId: options.tenantId,
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
      sourceType: options?.sourceType,
      category: options?.category,
      limit: options?.limit ?? 50,
    });

    return {
      success: true,
      events: events.map((e) => ({
        ...e,
        link: getCalendarEventRoute({ sourceType: e.sourceType, sourceId: e.sourceId, slug: e.slug }),
        date: e.date.toISOString(),
        endDate: e.endDate ? e.endDate.toISOString() : null,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch (error: any) {
    console.error('Failed to fetch calendar events:', error);
    return { success: false, error: error.message || 'Failed to fetch calendar events' };
  }
}
