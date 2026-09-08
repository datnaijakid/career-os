import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasProfile: Boolean(user.profile?.confirmedAt)
      }
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
