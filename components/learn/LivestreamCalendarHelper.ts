/**
 * Livestream Calendar Helper
 * Generates 1-click Google Calendar RSVP links and downloadable .ics files.
 */

export interface CalendarEventPayload {
  title: string;
  description?: string;
  location?: string;
  url?: string;
  startTime: Date | string | number;
  endTime?: Date | string | number;
}

function formatDateToUtcString(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  return validDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates a direct Google Calendar RSVP link.
 */
export function getGoogleCalendarUrl(event: CalendarEventPayload): string {
  const start = new Date(event.startTime);
  const validStart = isNaN(start.getTime()) ? new Date() : start;
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(validStart.getTime() + 45 * 60 * 1000); // Default 45m broadcast
  const validEnd = isNaN(end.getTime()) ? new Date(validStart.getTime() + 45 * 60 * 1000) : end;

  const startUtc = formatDateToUtcString(validStart);
  const endUtc = formatDateToUtcString(validEnd);

  const descText = event.description
    ? event.url
      ? `${event.description}\n\nJoin Broadcast: ${event.url}`
      : event.description
    : event.url
      ? `Join Broadcast: ${event.url}`
      : 'FoodNerve Broadcast Intelligence Teardown';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'FoodNerve Broadcast Intelligence Livestream',
    details: descText.trim(),
    location: event.location || event.url || 'FoodNerve Live Stage',
    dates: `${startUtc}/${endUtc}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates iCalendar (.ics) RFC 5545 text payload.
 */
export function generateIcsContent(event: CalendarEventPayload): string {
  const start = new Date(event.startTime);
  const validStart = isNaN(start.getTime()) ? new Date() : start;
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(validStart.getTime() + 45 * 60 * 1000);
  const validEnd = isNaN(end.getTime()) ? new Date(validStart.getTime() + 45 * 60 * 1000) : end;

  const startUtc = formatDateToUtcString(validStart);
  const endUtc = formatDateToUtcString(validEnd);
  const nowUtc = formatDateToUtcString(new Date());
  const uid = `livestream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@foodnerve.org`;

  // Escape special characters in text fields according to RFC 5545
  const cleanTitle = (event.title || 'FoodNerve Broadcast').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  const cleanDescription = (event.description || '').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  const cleanLocation = (event.location || event.url || 'FoodNerve Live Stage').replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');

  const finalDescription = cleanDescription
    ? event.url
      ? `${cleanDescription}\\n\\nJoin URL: ${event.url}`
      : cleanDescription
    : event.url
      ? `Join URL: ${event.url}`
      : 'FoodNerve Broadcast Intelligence Teardown';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FoodNerve//Broadcast Intelligence//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${finalDescription}`,
    `LOCATION:${cleanLocation}`,
    event.url ? `URL:${event.url}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/**
 * Normalizes video stream URLs (YouTube, Vimeo, Twitch) into embeddable URLs.
 */
export function getEmbeddableVideoUrl(
  streamUrl: string,
  host: string = 'localhost'
): { isEmbeddable: boolean; embedUrl: string } {
  if (!streamUrl) return { isEmbeddable: false, embedUrl: '' };

  const trimmed = streamUrl.trim();
  const lower = trimmed.toLowerCase();

  // 1. YouTube (watch, youtu.be, live, shorts, embed)
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${youtuBeMatch[1]}?autoplay=1` };
    }
    const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/i);
    if (liveMatch && liveMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1` };
    }
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
    if (shortsMatch && shortsMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1` };
    }
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
    if (embedMatch && embedMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${embedMatch[1]}?autoplay=1` };
    }
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const v = parsed.searchParams.get('v');
      if (v) {
        return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${v}?autoplay=1` };
      }
    } catch {}
    const vQueryMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/i);
    if (vQueryMatch && vQueryMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://www.youtube.com/embed/${vQueryMatch[1]}?autoplay=1` };
    }
  }

  // 2. Vimeo (vimeo.com/<id>, player.vimeo.com/video/<id>, channels, groups)
  if (lower.includes('vimeo.com')) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|video\/)?(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
    }
  }

  // 3. Twitch (channel or VOD video with parent host)
  if (lower.includes('twitch.tv')) {
    const videoMatch = trimmed.match(/twitch\.tv\/videos\/(\d+)/i);
    if (videoMatch && videoMatch[1]) {
      return { isEmbeddable: true, embedUrl: `https://player.twitch.tv/?video=${videoMatch[1]}&parent=${host}&autoplay=true` };
    }
    const channelMatch = trimmed.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
    if (channelMatch && channelMatch[1] && channelMatch[1] !== 'videos') {
      return { isEmbeddable: true, embedUrl: `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${host}&autoplay=true` };
    }
  }

  return { isEmbeddable: false, embedUrl: trimmed };
}

/**
 * Triggers a browser download of an .ics file.
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  if (typeof window === 'undefined') return;

  const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const finalFilename = safeFilename.endsWith('.ics') ? safeFilename : `${safeFilename}.ics`;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
