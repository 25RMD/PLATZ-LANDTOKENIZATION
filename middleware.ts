// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from '@/lib/authUtils';

const AUTH_COOKIE_NAME = 'auth-token';

// Add paths that should be protected by authentication
const protectedApiRoutes = [
  '/api/auth/me',
  '/api/profile',
  '/api/admin', // Protect all admin routes
  '/api/collections', // <<< ADDED: Protect collection creation/management
  // Add other API routes that require login (non-admin)
];

// Specific list of admin routes for role checking
const adminApiRoutes = [
    '/api/admin',
];

// --- Uncomment and define protected/admin pages --- 
const protectedPages = ['/profile', '/admin/dashboard']; // Added /admin/dashboard
const adminPages = ['/admin/dashboard'];
// --- End page definitions --- 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminApiRoute = adminApiRoutes.some(route => pathname.startsWith(route));
  // --- Use page definitions --- 
  const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
  const isAdminPage = adminPages.some(page => pathname.startsWith(page));
  // --- End using page definitions --- 

  // Deny access to protected API routes if no token
  if (isProtectedApi && !token) {
    console.log(`Middleware: Denying access to API ${pathname} (no token)`);
    return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
  }

  // Verify token for protected API routes
  if (isProtectedApi && token) {
    const decoded = await verifyJwt(token);

    // Deny if token is invalid
    if (!decoded || !decoded.userId) {
      console.log(`Middleware: Denying access to API ${pathname} (invalid token)`);
      const response = new NextResponse(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
      response.cookies.set(AUTH_COOKIE_NAME, '', { maxAge: -1, path: '/' }); // Clear invalid cookie
      return response;
    }

    // Check admin role for admin API routes
    if (isAdminApiRoute && !decoded.isAdmin) {
        console.log(`Middleware: Denying access to admin API route ${pathname} (user not admin)`);
        return new NextResponse(JSON.stringify({ message: 'Forbidden: Admin access required' }), { status: 403 });
    }

    // Token is valid (and has admin role if required), attach user info to headers for API requests
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-is-admin', String(decoded.isAdmin)); // Pass isAdmin as string

    console.log(`Middleware: Allowing access to API ${pathname} for user ${decoded.userId} (Admin: ${decoded.isAdmin})`);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // --- Uncomment and activate Page Protection Logic --- 
  if (isProtectedPage) {
    if (!token) {
      console.log(`Middleware: Redirecting unauthenticated user from page ${pathname} to /login`);
      const loginUrl = new URL('/login', request.url); 
      return NextResponse.redirect(loginUrl);
    }
    const decoded = await verifyJwt(token);
    if (!decoded || !decoded.userId) {
      console.log(`Middleware: Redirecting user with invalid token from page ${pathname} to /login`);
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(AUTH_COOKIE_NAME, '', { maxAge: -1, path: '/' });
      return response;
    }
    // Redirect non-admins trying to access admin pages
    if (isAdminPage && !decoded.isAdmin) {
      console.log(`Middleware: Redirecting non-admin user from page ${pathname} to / (Access Denied)`);
      const homeUrl = new URL('/', request.url); // Redirect to home page
      // Optionally add a query param to show a message: homeUrl.searchParams.set('error', 'access_denied');
      return NextResponse.redirect(homeUrl);
    }
    // User is authenticated (and admin if required for the page), allow access
    console.log(`Middleware: Allowing access to page ${pathname} for user ${decoded.userId} (Admin: ${decoded.isAdmin})`);
  }
  // --- End Page Protection Logic ---

  // Allow the request to proceed if not protected or already handled
  return NextResponse.next();
}

// Update matcher to include admin routes AND protected pages
export const config = {
  matcher: [
    // API Routes
    '/api/auth/me',
    '/api/profile/:path*', 
    '/api/admin/:path*', 
    '/api/collections/:path*', // <<< ADDED: Match collection routes
    // Protected Pages
    '/profile/:path*', // Protect profile page and potential sub-routes
    '/admin/dashboard/:path*', // Protect admin dashboard and potential sub-routes
    // Add other protected paths as needed
  ],
}; 