import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostHeader = request.headers.get('host') || '';
  const hostname = hostHeader.split(':')[0]; // Strip port for cleaner logic

  // Extract the tenant ID from the hostname (basic implementation)
  const tenant_id = hostname.split('.')[0];
  
  // Clone the URL to modify the pathname for rewriting
  const rewriteUrl = url.clone();
  
  // Determine the correct theme based on routing context
  let theme_id = 'innovations';
  if (hostname.includes('.org') || hostname.startsWith('society.')) {
    theme_id = 'society';
  } else if (hostname.includes('darkpore') || hostname === 'localhost') {
    theme_id = 'darkpore';
  }
  
  // Pass theme_id to headers so the app router can read it for auth pages
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant_id); // keep original tenant_id just in case
  requestHeaders.set('x-theme-id', theme_id);

  // Bypass routing for auth pages so they map to the root /app/join and /app/finishSignUp
  if (url.pathname.startsWith('/join') || url.pathname.startsWith('/finishSignUp')) {
    const isPublicSite = !hostname.includes('.org') && !hostname.startsWith('society.');
    
    // If they are on a marketing domain, physically redirect them to the society subdomain FIRST.
    // This prevents cross-domain authentication drops because Firebase writes to IndexedDB per-origin.
    if (isPublicSite) {
      const cleanHostname = hostname.replace(/^www\./, '');
      const targetDomain = `society.${cleanHostname}`;
      const port = url.port ? `:${url.port}` : '';
      return NextResponse.redirect(`${url.protocol}//${targetDomain}${port}${url.pathname}${url.search}`);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Bypass API routes completely
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Clone the URL to modify the pathname for rewriting

  // Note: We route to physical folders (/darkpore, /society, /innovations) 
  // instead of route groups /(...) to avoid Next.js conflicting path errors.
  if (hostname.startsWith('society.')) {
    // Extract tenant_id from something like "society.foodnerve.com" -> "foodnerve"
    const parts = hostname.split('.');
    const tenant = parts[1] || 'foodnerve';
    rewriteUrl.pathname = `/modular-society/${tenant}${url.pathname}`;
  } else if (
    hostname.includes('darkpore.com') || 
    hostname === 'localhost' || 
    hostname.includes('darkpore.localhost')
  ) {
    rewriteUrl.pathname = `/darkpore${url.pathname}`;
  } else if (
    hostname.includes('.org') // Matches .org (prod) AND .org.localhost (dev)
  ) {
    rewriteUrl.pathname = `/modular-society/org${url.pathname}`;
  } else if (
    hostname.includes('.net') // Matches .net (prod) AND .net.localhost (dev)
  ) {
    rewriteUrl.pathname = `/innovation-center${url.pathname}`;
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
