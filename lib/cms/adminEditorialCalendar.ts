/**
 * Admin Editorial Calendar Data Store
 * 1,820 Pre-Planned Article Entries covering 2027-2031 across 26 commodities.
 */

import rawCalendarData from './1820_article_calendar.json';

export interface AdminCalendarAlternativeTitle {
  'Daily Article #'?: number;
  'Franchise': string;
  'Academic / Working Title': string;
  'Publishing Headline / Editorial Title': string;
  'Country'?: string | null;
}

export interface AdminCalendarArticleRecord {
  'Article ID': string;
  'Publication Date': string;
  'Day': string;
  'Calendar Year': number;
  'Global Week': number;
  'Cycle': number;
  'Week in Cycle': number;
  'Appearance': number;
  'Week Start': string;
  'Week End': string;
  'Food Focus': string;
  'Category': string;
  'Subcategory': string;
  'Content Type': string;
  'Livestream Published This Date'?: string;
  'Livestream Published ID'?: string | null;
  'Article Status': string;
  'Geography Overlay Status'?: string;
  'Primary Region'?: string | null;
  'Primary Country'?: string | null;
  'Comparison Country'?: string | null;
  'Geographic Role'?: string;
  'Geographic Rationale'?: string;
  'Article Working Title': string;
  'Feeds Livestream ID'?: string | null;
  'Livestream Feed Role'?: string | null;
  'Feeds Livestream Date'?: string | null;
  'Geography Level'?: string;
  'Comparison Region'?: string | null;
  'Geography Basis Commodity'?: string;
  'FAOSTAT Signal Used'?: string;
  'Primary Country Pool'?: string;
  'Comparison Country Pool'?: string;
  'FAOSTAT Domains'?: string;
  'FAOSTAT Coverage'?: string;
  'Geography Evidence Status'?: string;
  'External Evidence Needed'?: string;
  'Geography Pathway'?: string;
  'Source URL'?: string;
  'Candidate System Importance Score'?: number;
  'Candidate Subcategory Proxy Score'?: number;
  'Candidate Future / Transfer Score'?: number;
  'Candidate Evidence Availability Score'?: number;
  'Candidate Geography Score (Pre-Gate)'?: number;
  'Why Candidate Geography Matters to the Food System'?: string;
  'Candidate Signal / Research Lead'?: string;
  'Candidate Comparator / Next Place to Examine'?: string;
  'Candidate Region (Pre-Gate)'?: string | null;
  'Candidate Country (Pre-Gate)'?: string | null;
  'Candidate Comparator (Pre-Gate)'?: string | null;
  'Candidate Score (Pre-Gate)'?: number;
  'Eligibility Gate Class'?: string;
  'Phenomenon Eligibility Gate'?: string;
  'Food-System Intersection Gate'?: string;
  'Required Eligibility Source'?: string;
  'Eligibility Source URL'?: string;
  'Eligibility Research Question'?: string;
  'Final Geography Assignment Rule'?: string;
  'Evidence Status'?: string;
  'Canonical Evidence Title'?: string;
  'Public Title Class'?: string;
  'Exploratory Franchise'?: string | null;
  'Exploratory Geography Status'?: string | null;
  'Exploratory Primary Region'?: string | null;
  'Exploratory Primary Country'?: string | null;
  'Exploratory Component Status'?: string | null;
  'Exploratory Claim Boundary'?: string | null;
  'Pre-Publication Verification Required'?: string;
  'Future Tracker Stream'?: string | null;
  'Exploratory Source 1'?: string | null;
  'Exploratory Source 2'?: string | null;
  'Academic / Working Title': string;
  'Publishing Headline / Editorial Title': string;
  'Alternative Titles'?: AdminCalendarAlternativeTitle[];
}

export const ADMIN_EDITORIAL_CALENDAR: AdminCalendarArticleRecord[] = rawCalendarData as AdminCalendarArticleRecord[];

/**
 * Fast Lookup Map indexed by Publication Date (YYYY-MM-DD)
 */
const CALENDAR_BY_DATE_MAP: Map<string, AdminCalendarArticleRecord> = new Map();
ADMIN_EDITORIAL_CALENDAR.forEach(item => {
  if (item['Publication Date']) {
    CALENDAR_BY_DATE_MAP.set(item['Publication Date'], item);
  }
});

/**
 * Resolves a date string into YYYY-MM-DD
 */
function normalizeDateStr(dateInput?: string | Date): string {
  if (!dateInput) return '';
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0];
  }
  return dateInput.split('T')[0];
}

/**
 * Retrieves the exact editorial calendar record for a specific publication date.
 */
export function getAdminArticleByDate(dateInput?: string | Date): AdminCalendarArticleRecord | null {
  const dateStr = normalizeDateStr(dateInput);
  if (!dateStr) return null;
  return CALENDAR_BY_DATE_MAP.get(dateStr) || null;
}

/**
 * Finds matching record by commodity focus, category, and day of week.
 */
export function getAdminArticleByCommodityAndDay(
  commodity: string,
  dayOfWeek?: string,
  category?: string
): AdminCalendarArticleRecord {
  const cleanComm = (commodity || '').toLowerCase().trim();
  const cleanDay = (dayOfWeek || '').toLowerCase().trim();
  const cleanCat = (category || '').toLowerCase().trim();

  // Try matching Commodity + Day + Category
  let match = ADMIN_EDITORIAL_CALENDAR.find(item => {
    const commMatch = item['Food Focus']?.toLowerCase().includes(cleanComm) || cleanComm.includes(item['Food Focus']?.toLowerCase());
    const dayMatch = !cleanDay || item['Day']?.toLowerCase() === cleanDay;
    const catMatch = !cleanCat || item['Category']?.toLowerCase().includes(cleanCat);
    return commMatch && dayMatch && catMatch;
  });

  // Fallback: match Commodity + Day
  if (!match && cleanDay) {
    match = ADMIN_EDITORIAL_CALENDAR.find(item => {
      const commMatch = item['Food Focus']?.toLowerCase().includes(cleanComm) || cleanComm.includes(item['Food Focus']?.toLowerCase());
      const dayMatch = item['Day']?.toLowerCase() === cleanDay;
      return commMatch && dayMatch;
    });
  }

  // Fallback: match Commodity alone
  if (!match) {
    match = ADMIN_EDITORIAL_CALENDAR.find(item => {
      return item['Food Focus']?.toLowerCase().includes(cleanComm) || cleanComm.includes(item['Food Focus']?.toLowerCase());
    });
  }

  return match || ADMIN_EDITORIAL_CALENDAR[0];
}

/**
 * Resolves the active Admin Day Node based on available context.
 */
export function getAdminArticleDayNode(params: {
  dateStr?: string | Date;
  commodity?: string;
  category?: string;
  dayOfWeek?: string;
}): AdminCalendarArticleRecord {
  // 1. Try exact publication date
  if (params.dateStr) {
    const byDate = getAdminArticleByDate(params.dateStr);
    if (byDate) return byDate;
  }

  // 2. Fallback to commodity + day of week
  return getAdminArticleByCommodityAndDay(
    params.commodity || 'Tomato and Pepper',
    params.dayOfWeek,
    params.category
  );
}

/**
 * Formats the day node as formatted JSON for direct insertion into Doc 1a.
 */
export function getAdminDoc1aPayload(node: AdminCalendarArticleRecord): string {
  return JSON.stringify(node, null, 2);
}
