'use server';

import {
  getAdminArticleDayNode,
  getAdminDoc1aPayload,
  getAdminCalendarOptionsForCommodity,
  AdminCalendarArticleRecord,
  AdminCalendarOption,
} from '@/lib/cms/adminEditorialCalendar';

export interface AdminDayNodeResponse {
  success: boolean;
  node: AdminCalendarArticleRecord;
  jsonPayload: string;
  options: AdminCalendarOption[];
  error?: string;
}

export async function fetchAdminDayNodeAction(params: {
  articleId?: string;
  dateStr?: string;
  commodity?: string;
  category?: string;
  dayOfWeek?: string;
}): Promise<AdminDayNodeResponse> {
  try {
    const node = getAdminArticleDayNode(params);
    const jsonPayload = getAdminDoc1aPayload(node);
    const options = getAdminCalendarOptionsForCommodity(params.commodity || node['Food Focus']);
    return {
      success: true,
      node,
      jsonPayload,
      options,
    };
  } catch (error: any) {
    console.error('Error fetching admin day node:', error);
    const fallback = getAdminArticleDayNode({});
    return {
      success: false,
      node: fallback,
      jsonPayload: getAdminDoc1aPayload(fallback),
      options: [],
      error: error?.message || 'Failed to load day node',
    };
  }
}

export async function fetchAdminCalendarOptionsAction(commodity: string): Promise<AdminCalendarOption[]> {
  try {
    return getAdminCalendarOptionsForCommodity(commodity);
  } catch (error) {
    console.error('Error fetching calendar options for commodity:', error);
    return [];
  }
}

