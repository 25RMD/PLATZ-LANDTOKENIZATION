// app/api/auth/logout/route.ts
// Handles POST requests to log the user out by clearing the auth cookie.

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

const AUTH_COOKIE_NAME = 'auth-token';

export async function POST(request: Request) {
  // Clear the authentication cookie
  const cookie = serialize(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Set expiry date to the past
    path: '/',
    sameSite: 'lax',
  });

  console.log('User logged out');

  return NextResponse.json(
    { message: 'Logout successful' },
    {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    }
  );
} 