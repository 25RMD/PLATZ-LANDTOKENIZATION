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
  // Add other API routes that require login (non-admin)
];

// Specific list of admin routes for role checking
const adminApiRoutes = [
    '/api/admin',
];

// You can also protect specific pages if needed
// const protectedPages = ['/profile', '/dashboard', '/admin/dashboard'];
// const adminPages = ['/admin/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected = protectedApiRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminApiRoutes.some(route => pathname.startsWith(route));
  // const isProtectedPage = protectedPages.some(page => pathname.startsWith(page));
  // const isAdminPage = adminPages.some(page => pathname.startsWith(page));

  // Deny access to protected routes if no token
  if (isProtected && !token) {
    console.log(`Middleware: Denying access to ${pathname} (no token)`);
    return new NextResponse(JSON.stringify({ message: 'Authentication required' }), { status: 401 });
  }

  // Verify token for protected routes
  if (isProtected && token) {
    const decoded = await verifyJwt(token);

    // Deny if token is invalid
    if (!decoded || !decoded.userId) {
      console.log(`Middleware: Denying access to ${pathname} (invalid token)`);
      const response = new NextResponse(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
      response.cookies.set(AUTH_COOKIE_NAME, '', { maxAge: -1, path: '/' }); // Clear invalid cookie
      return response;
    }

    // Check admin role for admin routes
    if (isAdminRoute && !decoded.isAdmin) {
        console.log(`Middleware: Denying access to admin route ${pathname} (user not admin)`);
        return new NextResponse(JSON.stringify({ message: 'Forbidden: Admin access required' }), { status: 403 });
    }

    // Token is valid (and has admin role if required), attach user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);
    requestHeaders.set('x-user-is-admin', String(decoded.isAdmin)); // Pass isAdmin as string

    console.log(`Middleware: Allowing access to ${pathname} for user ${decoded.userId} (Admin: ${decoded.isAdmin})`);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // --- Add Page Protection Logic (Example) ---
  // if (isProtectedPage) {
  //   if (!token) {
  //     const loginUrl = new URL('/login', request.url); 
  //     return NextResponse.redirect(loginUrl);
  //   }
  //   const decoded = await verifyJwt(token);
  //   if (!decoded || !decoded.userId) {
  //     const loginUrl = new URL('/login', request.url);
  //     const response = NextResponse.redirect(loginUrl);
  //     response.cookies.set(AUTH_COOKIE_NAME, '', { maxAge: -1, path: '/' });
  //     return response;
  //   }
  //   // Redirect non-admins trying to access admin pages
  //   if (isAdminPage && !decoded.isAdmin) {
  //     const homeUrl = new URL('/', request.url); // Or a dashboard
  //     return NextResponse.redirect(homeUrl);
  //   }
  // }
  // --- End Page Protection Logic ---

  // Allow the request to proceed if not protected
  return NextResponse.next();
}

// Update matcher to include admin routes
export const config = {
  matcher: [
    '/api/auth/me',
    '/api/profile/:path*', // Match all routes under /api/profile
    '/api/admin/:path*', // Match all routes under /api/admin
    // Add other protected API routes here
    // Add protected page paths if needed: '/profile', '/admin/dashboard/:path*'
  ],
}; 