import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  console.log('MIDDLEWARE:', request.nextUrl.pathname);
  const url = request.nextUrl;
  const hostHeader = request.headers.get('host') || '';
  const hostname = hostHeader.split(':')[0]; // Strip port for cleaner logic

  // Extract the tenant ID from the hostname (basic implementation)
  const tenant_id = hostname.split('.')[0] || 'foodnerve';
  
  // Clone the URL to modify the pathname for rewriting
  const rewriteUrl = new URL(request.url);
  
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
  
  // Bypass routing for universal Profile pages so they map to the unified modular-society architecture
  if (url.pathname.startsWith('/profile')) {
    rewriteUrl.pathname = `/modular-society/${tenant_id}${url.pathname}`;
    return NextResponse.rewrite(rewriteUrl.toString(), {
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

  // Prevent infinite rewrite loops
  if (
    url.pathname.startsWith('/modular-society') ||
    url.pathname.startsWith('/darkpore') ||
    url.pathname.startsWith('/innovation-center') ||
    url.pathname.startsWith('/innovations')
  ) {
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
    const tenant = parts[1] && parts[1] !== 'localhost' ? parts[1] : 'foodnerve';
    rewriteUrl.pathname = `/modular-society/${tenant}${url.pathname}`;
  } else if (
    hostname.includes('darkpore.com') || 
    hostname.includes('darkpore.localhost')
  ) {
    rewriteUrl.pathname = `/darkpore${url.pathname}`;
  } else if (
    hostname.includes('.org') // Matches .org (prod) AND .org.localhost (dev)
  ) {
    const tenant = (tenant_id && tenant_id !== 'org' && tenant_id !== 'www') ? tenant_id : 'foodnerve';
    rewriteUrl.pathname = `/modular-society/${tenant}${url.pathname}`;
  } else if (
    hostname.includes('.net') // Matches .net (prod) AND .net.localhost (dev)
  ) {
    rewriteUrl.pathname = `/innovation-center${url.pathname}`;
  } else if (hostname === 'localhost') {
    const societyPaths = ['/trade', '/learn', '/meet', '/support', '/org', '/profile', '/updates', '/explore', '/about', '/login'];
    const isSocietyPath = societyPaths.some(p => url.pathname === p || url.pathname.startsWith(p + '/'));
    if (isSocietyPath) {
      rewriteUrl.pathname = `/modular-society/foodnerve${url.pathname}`;
    } else {
      rewriteUrl.pathname = `/darkpore${url.pathname}`;
    }
  } else {
    // Default covers .com (prod) AND .com.localhost (dev)
    rewriteUrl.pathname = `/innovations${url.pathname}`;
  }

  return NextResponse.rewrite(rewriteUrl.toString(), {
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
