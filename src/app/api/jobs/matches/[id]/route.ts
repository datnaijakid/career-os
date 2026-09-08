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

    const matchId = params.id;

    // Verify ownership
    const match = await db.jobMatch.findFirst({
      where: {
        id: matchId,
        userId: session.userId
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Job recommendation not found or already removed.' },
        { status: 404 }
      );
    }

    // Delete the match recommendation
    await db.jobMatch.delete({
      where: { id: match.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Job recommendation removed successfully.'
    });
  } catch (err: any) {
    console.error('Delete job match error:', err);
    return NextResponse.json(
      { error: 'Failed to delete job recommendation.' },
      { status: 500 }
    );
  }
}
