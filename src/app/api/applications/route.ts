import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await db.application.findMany({
      where: { userId: session.userId },
      include: {
        job: true,
        answers: true,
        events: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ applications });
  } catch (err: any) {
    console.error('Fetch applications error:', err);
    return NextResponse.json({ error: 'Failed to retrieve applications.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, initialStatus } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required.' }, { status: 400 });
    }

    const job = await db.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    const status = initialStatus || 'PREPARING';

    const application = await db.application.create({
      data: {
        userId: session.userId,
        jobId: job.id,
        status,
        events: {
          create: {
            type: 'APPLICATION_INITIALIZED',
            description: `Started application process for ${job.title} at ${job.company}.`
          }
        }
      },
      include: {
        job: true,
        answers: true,
        events: true
      }
    });

    return NextResponse.json({
      success: true,
      application,
      message: 'Application initiated.'
    });
  } catch (err: any) {
    console.error('Create application error:', err);
    return NextResponse.json({ error: 'Failed to create application.' }, { status: 500 });
  }
}
