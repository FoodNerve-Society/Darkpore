import { NextResponse } from 'next/server';
import { fetchCalendarEvents } from '@/lib/actions/calendar';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceType = searchParams.get('sourceType') || undefined;
  const category = searchParams.get('category') || undefined;
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 50;

  const result = await fetchCalendarEvents({ sourceType, category, limit });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ events: result.events });
}
