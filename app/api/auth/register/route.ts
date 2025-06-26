// app/api/auth/register/route.ts
// Handles POST requests for user registration (username/password).

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/authUtils';
import { randomUUID } from 'crypto';
import { RegisterSchema } from '@/lib/schemas'; // Import schema

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[API /register] Received body:", body);

    // Validate request body against schema
    const validationResult = RegisterSchema.safeParse(body);
    console.log("[API /register] Zod validation result:", JSON.stringify(validationResult));

    if (!validationResult.success) {
      console.error("[API /register] Validation failed:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Use validated data
    const { username, email, password } = validationResult.data;

    // Basic validation
    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
    }
    // Add more robust validation as needed (e.g., password complexity, email format)

    // Check if user already exists (by username or email if provided)
    const orConditions = [
      { username: username },
      ...(email ? [{ email: email }] : []),
    ];

    // Use the correct model name `users` as defined in schema.prisma
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingUser) {
      const message = existingUser.username === username
        ? 'Username already exists'
        : 'Email already exists';
      return NextResponse.json({ message }, { status: 409 }); // Conflict
    }

    console.log(`[API /register] Hashing password for user: ${username}`);
    // Hash the password
    const hashedPassword = await hashPassword(password);

    console.log(`[API /register] Attempting to create user: ${username}`);
    // Create the new user
    const newUser = await prisma.users.create({
      data: {
        id: randomUUID(),
        username: username,
        email: email || null,
        password_hash: hashedPassword,
      },
    });
    console.log(`[API /register] User creation successful: ${username}`);

    // Don't return password hash
    const { password_hash, ...userWithoutPassword } = newUser;

    console.log(`User registered: ${username}`);
    return NextResponse.json({ message: 'User registered successfully', user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error("[API /register] Caught Error:", error);
        // Log type and message specifically, if available
        if (error instanceof Error) {
          console.error("[API /register] Error Type:", error.constructor.name);
          console.error("[API /register] Error Message:", error.message);
          console.error("[API /register] Error Stack:", error.stack);
      } else {
          console.error("[API /register] Error is not an instance of Error. Raw error:", JSON.stringify(error));
      }
    // Generic error for security
    return NextResponse.json({ message: 'An error occurred during registration.' }, { status: 500 });
  }
} 