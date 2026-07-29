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
      return `/modular-society/${tenantId}/trade/${event.sourceId}`;
    case 'livestream':
      return `/modular-society/${tenantId}/learn/livestream/${event.sourceId}`;
    case 'article':
      return `/modular-society/${tenantId}/learn/article/${identifier}`;
    case 'video':
      return `/modular-society/${tenantId}/learn/video/${event.sourceId}`;
    case 'class':
      return `/modular-society/${tenantId}/learn/class/${event.sourceId}`;
    case 'report':
      return `/modular-society/${tenantId}/learn/article/${identifier}`;
    case 'meetEvent':
      return `/modular-society/${tenantId}/meet/${event.sourceId}`;
    case 'campaign':
      return `/modular-society/${tenantId}/support/${event.sourceId}`;
    default:
      return `/modular-society/${tenantId}`;
  }
}
