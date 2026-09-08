import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateApplicationAnswer, ExtractedCandidateData } from '@/lib/ai/aiService';

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
    const { question } = body;

    if (!question || question.trim() === '') {
      return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
    }

    const application = await db.application.findFirst({
      where: { id, userId: session.userId },
      include: {
        job: true,
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
      return NextResponse.json({ error: 'Application or job not found.' }, { status: 404 });
    }

    const profile = application.user.profile;
    const candidateData: ExtractedCandidateData = {
      personal: {
        fullName: profile?.fullName || '',
        email: profile?.email || '',
        location: profile?.location || ''
      },
      education: (profile?.educations || []).map(e => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy || undefined,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined
      })),
      experience: (profile?.experiences || []).map(e => ({
        company: e.company,
        role: e.role,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        description: e.description || undefined
      })),
      projects: (profile?.projects || []).map(p => ({
        title: p.title,
        description: p.description || undefined,
        technologies: p.technologies || undefined
      })),
      skills: (profile?.skills || []).map(s => ({
        name: s.name,
        category: s.category as any
      })),
      certifications: (profile?.certifications || []).map(c => ({
        name: c.name
      }))
    };

    const jobData = {
      title: application.job.title,
      company: application.job.company,
      description: application.job.description,
      requiredSkills: application.job.requiredSkills ? JSON.parse(application.job.requiredSkills) : [],
      preferredSkills: application.job.preferredSkills ? JSON.parse(application.job.preferredSkills) : []
    };

    // Generate grounded answer strictly bounded by confirmed profile facts
    const result = await generateApplicationAnswer(question, candidateData, jobData);

    // Upsert or create application answer
    const answerRecord = await db.applicationAnswer.create({
      data: {
        applicationId: application.id,
        question,
        answer: result.answer,
        status: 'DRAFT',
        groundedFacts: JSON.stringify(result.groundedFacts)
      }
    });

    // Record application event
    await db.applicationEvent.create({
      data: {
        applicationId: application.id,
        type: 'ANSWER_GENERATED',
        description: `Drafted grounded answer for question: "${question.slice(0, 60)}..."`
      }
    });

    return NextResponse.json({
      success: true,
      answer: {
        id: answerRecord.id,
        question: answerRecord.question,
        answer: answerRecord.answer,
        status: answerRecord.status,
        groundedFacts: result.groundedFacts
      }
    });
  } catch (err: any) {
    console.error('Answer generation error:', err);
    return NextResponse.json({ error: 'Failed to generate application answer.' }, { status: 500 });
  }
}
