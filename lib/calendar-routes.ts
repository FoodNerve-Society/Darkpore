export interface CalendarRouteSource {
  sourceType: string;
  sourceId: string;
  slug?: string | null;
}

/**
 * Dynamically builds the client URL for a calendar event based on its sourceType and ID/slug.
 * Respects tenant routing for multi-tenant .org views.
 */
export function getCalendarEventRoute(event: CalendarRouteSource, tenantId: string = 'darkpore'): string {
  const identifier = event.slug || event.sourceId;

  switch (event.sourceType) {
    case 'job':
      return `/careers/${event.sourceId}`;
    case 'listing':
      return `/trade/${event.sourceId}`;
    case 'livestream':
      return `/learn/livestream/${event.sourceId}`;
    case 'article':
      return `/learn/article/${identifier}`;
    case 'video':
      return `/learn/video/${event.sourceId}`;
    case 'class':
      return `/learn/class/${event.sourceId}`;
    case 'report':
      return `/learn/article/${identifier}`;
    case 'meetEvent':
      return `/meet/${event.sourceId}`;
    case 'campaign':
      return `/support/${event.sourceId}`;
    default:
      return `/learn`;
  }
}
