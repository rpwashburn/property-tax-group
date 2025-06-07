import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  console.log('🛡️ Middleware triggered for:', pathname);

  // Only apply middleware to /admin routes
  if (!pathname.startsWith('/admin')) {
    console.log('✅ Not an admin route, allowing access');
    return NextResponse.next();
  }

  console.log('🔒 Admin route detected, checking authentication...');

  try {
    // Get session using Better Auth - requires headers object as per documentation
    const session = await auth.api.getSession({
      headers: request.headers
    });

    console.log('📊 Session data:', session ? 'Session exists' : 'No session');
    console.log('👤 User role:', session?.user?.role || 'No role');

    // If no session exists, redirect to login page
    if (!session) {
      console.log('🚫 No session, redirecting to login page');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackURL', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    const userRole = session.user?.role;
    if (userRole !== 'admin') {
      console.log('🚫 User is not admin, redirecting to home with error');
      // Redirect non-admin users to home page (since we don't have unauthorized page yet)
      const homeUrl = new URL('/?error=unauthorized', request.url);
      return NextResponse.redirect(homeUrl);
    }

    console.log('✅ Admin user, allowing access');
    // Allow access for admin users
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Middleware error:', error);
    
    // On error, redirect to login page for safety
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackURL', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/admin',
    '/admin/(.*)'
  ]
}; 