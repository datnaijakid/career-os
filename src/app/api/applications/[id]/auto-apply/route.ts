import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { executeApplicationAutomation } from '@/lib/automation/automationService';

export const dynamic = 'force-dynamic';

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
          error: 'Explicit user authorization is required before CareerOS can submit your application.'
        },
        { status: 400 }
      );
    }

    const application = await db.application.findFirst({
      where: { id, userId: session.userId },
      include: {
        job: true,
        answers: true,
        user: {
          include: {
            profile: {
              include: {
                educations: true,
                experiences: true,
                projects: true,
                skills: true,
                certifications: true
              }
            }
          }
        }
      }
    });

    if (!application || !application.job) {
      return NextResponse.json({ error: 'Application or target job not found.' }, { status: 404 });
    }

    // Save any edited answers before automation
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

    // Prepare profile and verified answers for automation
    const profile = application.user.profile;
    const currentAnswers = await db.applicationAnswer.findMany({
      where: { applicationId: application.id }
    });

    // Run Application Automation Service
    const automationResult = await executeApplicationAutomation({
      applicationId: application.id,
      jobUrl: application.job.url,
      profile,
      answers: currentAnswers,
      company: application.job.company,
      title: application.job.title
    });

    // Update application to SUBMITTED
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

    return NextResponse.json({
      success: true,
      application: updatedApp,
      automation: automationResult,
      message: `Successfully executed application for ${application.job.title} at ${application.job.company}.`
    });
  } catch (err: any) {
    console.error('Auto-apply error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to complete automated application.' },
      { status: 500 }
    );
  }
}
