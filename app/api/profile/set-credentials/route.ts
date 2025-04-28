import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/authUtils';
import { RegisterSchema } from '@/lib/schemas'; // Reuse registration schema (or create specific one)

export async function POST(request: NextRequest) {
  // 1. Get Authenticated User ID from Middleware Header
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }
  console.log(`[API /set-credentials] Attempting for user: ${userId}`);

  try {
    const body = await request.json();
    console.log("[API /set-credentials] Received body:", { ...body, password: '[REDACTED]'});

    // 2. Validate Incoming Data (Username/Password)
    // We only care about username/password from the RegisterSchema here
    const validationResult = RegisterSchema.pick({ username: true, password: true }).safeParse(body);

    if (!validationResult.success) {
      console.error("[API /set-credentials] Validation failed:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Invalid input", errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { username, password } = validationResult.data;

    // 3. Check if user already has credentials set
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, passwordHash: true }
    });

    if (!currentUser) {
        // Should not happen if middleware is correct
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (currentUser.username || currentUser.passwordHash) {
        console.warn(`[API /set-credentials] User ${userId} already has credentials.`);
        return NextResponse.json({ message: 'Username/password already set for this account.' }, { status: 400 });
    }

    // 4. Check if the desired username is already taken by ANOTHER user
    const existingUsername = await prisma.user.findUnique({
      where: {
        username: username,
        NOT: { id: userId } // Exclude the current user
      },
      select: { id: true }
    });

    if (existingUsername) {
      console.warn(`[API /set-credentials] Username '${username}' already taken by user ${existingUsername.id}`);
      return NextResponse.json({ message: 'Username is already taken.' }, { status: 409 }); // Conflict
    }

    // 5. Hash the password
    console.log(`[API /set-credentials] Hashing password for user: ${userId}`);
    const hashedPassword = await hashPassword(password);

    // 6. Update the user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        username: username,
        passwordHash: hashedPassword,
      },
    });
    console.log(`[API /set-credentials] Credentials set successfully for user: ${userId}`);

    // 7. Return success
    return NextResponse.json({ message: 'Username and password set successfully' }, { status: 200 });

  } catch (error) {
    console.error("[API /set-credentials] Caught Error:", error);
    return NextResponse.json({ message: 'An error occurred while setting credentials.' }, { status: 500 });
  }
} 