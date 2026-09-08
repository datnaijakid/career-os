import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = String(code).trim();

    // 1. Locate pending email verification record
    const pending = await db.emailVerification.findFirst({
      where: { email: cleanEmail },
      orderBy: { createdAt: 'desc' }
    });

    if (!pending) {
      return NextResponse.json(
        { error: 'No pending verification request found. Please request a new code.' },
        { status: 404 }
      );
    }

    // 2. Check expiration
    if (new Date() > pending.expiresAt) {
      await db.emailVerification.delete({ where: { id: pending.id } });
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 410 }
      );
    }

    // 3. Verify the 6-digit code
    if (pending.code !== cleanCode) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    // 4. Check if user was registered in the meantime
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      await db.emailVerification.delete({ where: { id: pending.id } });
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 5. Create user and initialize profile in transaction
    const user = await db.user.create({
      data: {
        email: cleanEmail,
        passwordHash: pending.passwordHash,
        name: pending.name || cleanEmail.split('@')[0],
        profile: {
          create: {
            email: cleanEmail,
            fullName: pending.name || cleanEmail.split('@')[0]
          }
        }
      },
      include: {
        profile: true
      }
    });

    // 6. Delete used verification record
    await db.emailVerification.deleteMany({
      where: { email: cleanEmail }
    });

    // 7. Create Session Token & Cookie
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({
      message: 'Account verified and created successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Registration verification error:', err);
    return NextResponse.json(
      { error: 'An error occurred while verifying code and completing registration.' },
      { status: 500 }
    );
  }
}
