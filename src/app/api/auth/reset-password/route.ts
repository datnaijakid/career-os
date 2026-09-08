import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, token, newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    if (!token && (!email || !code)) {
      return NextResponse.json(
        { error: 'Please provide either a valid reset token or email and 6-digit code.' },
        { status: 400 }
      );
    }

    let resetRecord = null;

    // Verify by token or (email + 6-digit code)
    if (token) {
      resetRecord = await db.passwordResetToken.findUnique({
        where: { token }
      });
    } else if (email && code) {
      const normalizedEmail = email.toLowerCase().trim();
      const trimmedCode = code.trim();
      resetRecord = await db.passwordResetToken.findFirst({
        where: {
          email: normalizedEmail,
          code: trimmedCode
        }
      });
    }

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset request. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(resetRecord.expiresAt)) {
      await db.passwordResetToken.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { error: 'Password reset code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Find the user to update
    const user = await db.user.findUnique({
      where: { email: resetRecord.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    // Delete used reset token
    await db.passwordResetToken.delete({
      where: { id: resetRecord.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (err: any) {
    console.error('Reset password error:', err.message);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
