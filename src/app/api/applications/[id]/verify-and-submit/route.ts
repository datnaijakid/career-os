import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { confirmedAccuracyAndAuthorization, answers } = body;

    // Strict Final Verification Gate Enforcement
    if (confirmedAccuracyAndAuthorization !== true) {
      return NextResponse.json(
        {
          error: 'Explicit user confirmation is required. You must verify accuracy and authorize submission.'
        },
        { status: 400 }
      );
    }

    const application = await db.application.findFirst({
      where: { id, userId: session.userId },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    // Save or update any edited answers
    if (Array.isArray(answers)) {
      for (const ans of answers) {
        if (ans.id) {
          await db.applicationAnswer.update({
            where: { id: ans.id },
            data: {
              answer: ans.answer,
              status: 'ACCEPTED'
            }
          });
        }
      }
    }

    // Update status to SUBMITTED
    const updatedApp = await db.application.update({
      where: { id: application.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      },
      include: {
        job: true,
        answers: true,
        events: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Create Audit Log Event
    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        type: 'APPLICATION_SUBMITTED',
        description: `Application officially verified and authorized by candidate for ${application.job.title} at ${application.job.company}.`
      }
    });

    return NextResponse.json({
      success: true,
      application: updatedApp,
      message: 'Application successfully verified and submitted.'
    });
  } catch (err: any) {
    console.error('Verify and submit error:', err);
    return NextResponse.json({ error: 'Failed to complete application submission.' }, { status: 500 });
  }
}
