// app/api/auth/login/route.ts
// Handles POST requests for user login (username/password).

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, createJwt } from '@/lib/authUtils';
import { serialize } from 'cookie'; // Import serialize function
import { LoginSchema } from '@/lib/schemas'; // Import schema

const AUTH_COOKIE_NAME = 'auth-token'; // Consistent cookie name

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Use validated data
    const { username, password } = validationResult.data;

    // Find user by username (or email, if you allow login via email)
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    // Check if user exists and has a password hash
    if (!user || !user.passwordHash) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 }); // Unauthorized
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await comparePassword(password, user.passwordHash);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 }); // Unauthorized
    }

    // Passwords match - Create JWT
    const token = await createJwt({ userId: user.id, isAdmin: user.isAdmin });

    // Serialize the cookie
    const cookie = serialize(AUTH_COOKIE_NAME, token, {
      httpOnly: true, // Prevent access from client-side JS
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT expiration ideally)
      path: '/', // Cookie available across the entire site
      sameSite: 'lax', // Protects against CSRF attacks
    });

    // Don't return sensitive info
    const { passwordHash, signInNonce, ...userResponse } = user;

    console.log(`User logged in: ${username} (Admin: ${user.isAdmin})`);

    // Return success response with the Set-Cookie header
    return NextResponse.json(
      { message: 'Login successful', user: userResponse },
      {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'An error occurred during login.' }, { status: 500 });
  }
} 