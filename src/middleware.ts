import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
];

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('authenticated');
  const isAuthPage = request.nextUrl.pathname === '/';
  
  // Si l'utilisateur n'est pas authentifié et n'est pas sur la page d'auth
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si l'utilisateur est authentifié et sur la page d'auth
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Get the origin from the request headers
  const origin = request.headers.get('origin');
  
  // Get the response
  const response = NextResponse.next();

  // If the origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Add the remaining CORS headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 