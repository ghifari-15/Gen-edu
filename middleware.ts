import { NextRequest, NextResponse } from 'next/server';

// Protected routes yang memerlukan authentication
const protectedRoutes = [
  '/',
  '/notebook',
  '/quiz',
  '/profile',
  '/settings',
  '/analytics'
];

// Public routes yang bisa diakses tanpa authentication
const publicRoutes = [
  '/login',
  '/register',
  '/api/auth'
];

// Routes yang tidak boleh diakses oleh user yang sudah login
const authRoutes = [
  '/login',
  '/register'
];

// Simple JWT verification for middleware (without database check)
function verifyTokenSimple(token: string): any {
  try {
    // Simple base64 decode for JWT payload (for middleware only)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // Allow API routes to handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Check if this is an auth route (login/register)
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // If accessing public route, always allow
  if (isPublicRoute) {
    // But if user is authenticated and trying to access auth routes, redirect to home
    if (token && isAuthRoute) {
      const payload = verifyTokenSimple(token);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  // If no token and trying to access protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify it
  if (token) {
    const payload = verifyTokenSimple(token);
    
    if (!payload) {
      // Invalid token, redirect to login if accessing protected route
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    } else {
      // Token is valid, add user info to headers
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.userId || '');
      response.headers.set('x-user-email', payload.email || '');
      response.headers.set('x-user-role', payload.role || '');
      
      return response;
    }
  }

  // Allow access to other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
