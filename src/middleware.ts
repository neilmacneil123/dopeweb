import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Skip middleware for public routes
  if (
    request.nextUrl.pathname.startsWith('/api/login') ||
    request.nextUrl.pathname.startsWith('/api/register')
  ) {
    return NextResponse.next();
  }

  // Validate token for protected routes
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};