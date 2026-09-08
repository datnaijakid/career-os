import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetId = params.id;

    // Check if targetId is a JobMatch id
    let match = await db.jobMatch.findFirst({
      where: {
        id: targetId,
        userId: session.userId
      }
    });

    // Or check if targetId is a Job id linked to this user's match
    if (!match) {
      match = await db.jobMatch.findFirst({
        where: {
          jobId: targetId,
          userId: session.userId
        }
      });
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Matched job recommendation not found.' },
        { status: 404 }
      );
    }

    await db.jobMatch.delete({
      where: { id: match.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Job recommendation removed successfully.'
    });
  } catch (err: any) {
    console.error('Delete job error:', err);
    return NextResponse.json(
      { error: 'Failed to delete job recommendation.' },
      { status: 500 }
    );
  }
}
