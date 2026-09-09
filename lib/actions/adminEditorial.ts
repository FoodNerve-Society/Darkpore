'use server';

import {
  getAdminArticleDayNode,
  getAdminDoc1aPayload,
  AdminCalendarArticleRecord
} from '@/lib/cms/adminEditorialCalendar';

export interface AdminDayNodeResponse {
  success: boolean;
  node: AdminCalendarArticleRecord;
  jsonPayload: string;
  error?: string;
}

export async function fetchAdminDayNodeAction(params: {
  dateStr?: string;
  commodity?: string;
  category?: string;
  dayOfWeek?: string;
}): Promise<AdminDayNodeResponse> {
  try {
    const node = getAdminArticleDayNode(params);
    const jsonPayload = getAdminDoc1aPayload(node);
    return {
      success: true,
      node,
      jsonPayload,
    };
  } catch (error: any) {
    console.error('Error fetching admin day node:', error);
    const fallback = getAdminArticleDayNode({});
    return {
      success: false,
      node: fallback,
      jsonPayload: getAdminDoc1aPayload(fallback),
      error: error?.message || 'Failed to load day node',
    };
  }
}
