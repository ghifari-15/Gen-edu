import { NextRequest, NextResponse } from 'next/server';

// Protected routes yang memerlukan authentication
const protectedRoutes = [
  '/dashboard',
  '/notebook',
  '/quiz',
  '/profile',
  '/settings',
  '/analytics'
];

// Public routes yang bisa diakses tanpa authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/onboarding',
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
  const adminToken = request.cookies.get('admin-token')?.value;
  
  // Debug logging
  console.log('Middleware - Path:', pathname, 'Token exists:', !!token, 'Admin token exists:', !!adminToken);

  // Admin routes should be handled separately
  if (pathname.startsWith('/admin')) {
    // Allow admin login page without token
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // For other admin routes, check admin token
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    const adminPayload = verifyTokenSimple(adminToken);
    if (!adminPayload || adminPayload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Admin authenticated, proceed
    return NextResponse.next();
  }

  // Temporarily bypass middleware for register route to debug
  if (pathname === '/register') {
    console.log('Bypassing middleware for /register');
    return NextResponse.next();
  }

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
        console.log('Redirecting authenticated user from auth route:', pathname);
        return NextResponse.redirect(new URL('/', request.url));
      } else {
        // Invalid token, clear it and allow access to auth routes
        console.log('Invalid token found, clearing cookie for auth route:', pathname);
        const response = NextResponse.next();
        response.cookies.delete('auth-token');
        return response;
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
      }    } else {
      // Token is valid, check if user needs onboarding
      if (isProtectedRoute && pathname !== '/onboarding') {
        // Check if user has completed onboarding (this would normally be checked in DB)
        // For now, we'll use a simple approach with headers or check the user profile
        // We'll add a more robust check later
      }
      
      // Add user info to headers
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
