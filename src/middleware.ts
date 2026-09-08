import { NextResponse, NextRequest } from 'next/server';

// Publicly accessible paths that unauthenticated users are allowed to see
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/send-verification',
  '/api/auth/logout'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next internals, and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('career_os_token')?.value;

  // If unauthenticated and trying to access protected paths
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication is required to access this resource.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and accessing login or register, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
