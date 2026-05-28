import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract the tenant ID from the hostname (basic implementation)
  const tenant_id = hostname.split('.')[0];
  
  // Clone the URL to modify the pathname for rewriting
  const rewriteUrl = url.clone();
  
  // Pass tenant_id to headers so the app router can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant_id);

  // Note: We route to physical folders (/darkpore, /society, /innovations) 
  // instead of route groups /(...) to avoid Next.js conflicting path errors.
  if (
    hostname.includes('darkpore.com') || 
    hostname === 'localhost:3000' || 
    hostname.includes('darkpore.localhost')
  ) {
    rewriteUrl.pathname = `/darkpore${url.pathname}`;
  } else if (
    hostname.includes('.org') // Matches .org (prod) AND .org.localhost (dev)
  ) {
    rewriteUrl.pathname = `/society${url.pathname}`;
  } else {
    // Default covers .com (prod) AND .com.localhost (dev)
    rewriteUrl.pathname = `/innovations${url.pathname}`;
  }

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (all Next.js internal paths and static files)
     * - favicon.ico (favicon file)
     * - .*\\..* (match all files with an extension, like .svg, .png)
     */
    '/((?!api|_next|.*\\..*|favicon.ico).*)',
  ],
};
