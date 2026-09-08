import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password before saving pending verification
    const passwordHash = await hashPassword(password);

    // Generate random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 10 minutes expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Remove any previous pending verification requests for this email
    await db.emailVerification.deleteMany({
      where: { email: cleanEmail }
    });

    // Save pending verification record
    await db.emailVerification.create({
      data: {
        email: cleanEmail,
        code,
        name: name || cleanEmail.split('@')[0],
        passwordHash,
        expiresAt
      }
    });

    // Send the code using EmailJS
    await sendVerificationEmail({
      toEmail: cleanEmail,
      toName: name || cleanEmail.split('@')[0],
      code
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`
    });
  } catch (err: any) {
    console.error('Send verification error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch verification code.' },
      { status: 500 }
    );
  }
}
