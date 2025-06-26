// app/api/auth/login/route.ts
// Handles POST requests for user login (username/password).

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, createJwt } from '@/lib/authUtils';
import { serialize } from 'cookie'; // Import serialize function
import { LoginSchema } from '@/lib/schemas'; // Import schema

const AUTH_COOKIE_NAME = 'auth-token'; // Consistent cookie name

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[API /login] Received body:", { username: body?.username, passwordLength: body?.password?.length });

    // Validate request body
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("[API /login] Validation failed:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Use validated data
    const { username, password } = validationResult.data;
    console.log("[API /login] Attempting to find user:", username);

    // Find user by username (or email, if you allow login via email)
    const user = await prisma.users.findUnique({
      where: { username: username },
    });

    console.log("[API /login] User found:", user ? { id: user.id, username: user.username, is_admin: user.is_admin, hasPasswordHash: !!user.password_hash } : null);

    // Check if user exists and has a password hash
    if (!user || !user.password_hash) {
      console.warn("[API /login] Login failed: User not found or no password hash.");
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 }); // Unauthorized
    }

    console.log("[API /login] Comparing password for user:", user.username);
    // Compare the provided password with the stored hash
    const passwordMatch = await comparePassword(password, user.password_hash);
    console.log("[API /login] Password match result:", passwordMatch);

    if (!passwordMatch) {
      console.warn("[API /login] Login failed: Password mismatch for user:", user.username);
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 }); // Unauthorized
    }

    console.log(`[API /login] Password matched. Creating JWT for user: ${user.username}, is_admin: ${user.is_admin}`);
    // Passwords match - Create JWT
    const token = await createJwt({ userId: user.id, isAdmin: user.is_admin });
    console.log(`[API /login] JWT created. Token length: ${token.length}`);

    // Serialize the cookie
    const cookie = serialize(AUTH_COOKIE_NAME, token, {
      httpOnly: true, // Prevent access from client-side JS
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60 * 24 * 7, // 7 days (matches JWT expiration ideally)
      path: '/', // Cookie available across the entire site
      sameSite: 'lax', // Protects against CSRF attacks
    });

    // Don't return sensitive info
    const { password_hash, sign_in_nonce, ...userResponse } = user;

    console.log(`User logged in: ${username} (Admin: ${user.is_admin})`);

    // Return success response with the Set-Cookie header
    return NextResponse.json(
      { message: 'Login successful', user: userResponse },
      {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      }
    );

  } catch (error) {
    console.error("[API /login] Caught Error:", error);
    if (error instanceof Error) {
        console.error("[API /login] Error Type:", error.constructor.name);
        console.error("[API /login] Error Message:", error.message);
        console.error("[API /login] Error Stack:", error.stack);
    } else {
        console.error("[API /login] Error is not an instance of Error. Raw error:", JSON.stringify(error));
    }
    return NextResponse.json({ message: 'An error occurred during login.' }, { status: 500 });
  }
} 