import { NextResponse } from 'next/server';
import { getSessionUser, AUTH_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            confirmedAt: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('Session me error:', err);
    return NextResponse.json({ error: 'Failed to retrieve session' }, { status: 500 });
  }
}
