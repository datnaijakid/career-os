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

    // Retrieve user's matched jobs with latest match scores
    const matches = await db.jobMatch.findMany({
      where: { userId: session.userId },
      include: {
        job: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const formattedMatches = matches.map(m => ({
      id: m.id,
      jobId: m.job.id,
      company: m.job.company,
      title: m.job.title,
      location: m.job.location,
      remoteType: m.job.remoteType,
      employmentType: m.job.employmentType,
      salaryRange: m.job.salaryRange,
      url: m.job.url,
      matchScore: m.score,
      eligible: m.eligible,
      strengths: m.strengths ? JSON.parse(m.strengths) : [],
      missingRequirements: m.missingRequirements ? JSON.parse(m.missingRequirements) : [],
      uncertainRequirements: m.uncertainRequirements ? JSON.parse(m.uncertainRequirements) : [],
      explanation: m.explanation,
      createdAt: m.createdAt
    }));

    return NextResponse.json({ matches: formattedMatches });
  } catch (err: any) {
    console.error('Fetch jobs error:', err);
    return NextResponse.json({ error: 'Failed to retrieve jobs.' }, { status: 500 });
  }
}
