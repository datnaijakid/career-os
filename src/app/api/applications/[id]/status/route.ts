import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { APPLICATION_STATUSES, ApplicationStatusType } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, note } = body;

    if (!status || !APPLICATION_STATUSES[status as ApplicationStatusType]) {
      return NextResponse.json({ error: 'Invalid application status.' }, { status: 400 });
    }

    const application = await db.application.findFirst({
      where: { id: params.id, userId: session.userId },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    const updated = await db.application.update({
      where: { id: application.id },
      data: { status },
      include: {
        job: true,
        answers: true,
        events: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const statusLabel = APPLICATION_STATUSES[status as ApplicationStatusType].label;
    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        type: 'STATUS_UPDATED',
        description: `Status updated to "${statusLabel}". ${note ? `Note: ${note}` : ''}`.trim()
      }
    });

    return NextResponse.json({
      success: true,
      application: updated,
      message: `Status updated to ${statusLabel}.`
    });
  } catch (err: any) {
    console.error('Update status error:', err);
    return NextResponse.json({ error: 'Failed to update application status.' }, { status: 500 });
  }
}
