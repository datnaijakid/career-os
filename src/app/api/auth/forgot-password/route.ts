import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify whether user exists
    const user = await db.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (user) {
      // 2. Generate 6-digit numeric code and cryptographically secure token
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      // Clean up previous reset requests for this email
      await db.passwordResetToken.deleteMany({
        where: { email: normalizedEmail }
      });

      // Save token & code in Neon PostgreSQL
      await db.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          code,
          token,
          expiresAt
        }
      });

      // 3. Dispatch via EmailJS
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

      await sendPasswordResetEmail({
        toEmail: normalizedEmail,
        toName: user.name,
        code,
        resetUrl
      });
    }

    // Always return success for privacy and anti-enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.'
    });
  } catch (err: any) {
    console.error('Forgot password error:', err.message);
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again later.' },
      { status: 500 }
    );
  }
}
