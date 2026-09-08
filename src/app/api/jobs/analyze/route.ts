import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  analyzeJobPosting,
  matchCandidateToJob,
  identifyMissingInformation,
  ExtractedCandidateData
} from '@/lib/ai/aiService';
import { scrapeJobPosting, ScrapedJobResult } from '@/lib/scraper/jobScraper';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobUrl, rawJobText } = body;

    if (!jobUrl && !rawJobText) {
      return NextResponse.json(
        { error: 'Please provide either a valid job posting URL or the job description text.' },
        { status: 400 }
      );
    }

    let extractedText = rawJobText ? String(rawJobText).trim() : '';
    let scrapedMeta: ScrapedJobResult | null = null;

    // If jobUrl is provided, retrieve content via multi-strategy scraper (ATS APIs, JSON-LD, DOM)
    if (jobUrl) {
      scrapedMeta = await scrapeJobPosting(jobUrl);

      if (scrapedMeta.success && scrapedMeta.description.length > 50) {
        // If rawJobText wasn't provided, use scraped description
        if (!extractedText) {
          extractedText = scrapedMeta.description;
        }
      } else if (!extractedText || extractedText.length < 20) {
        // Scraper could not retrieve enough text and no rawJobText fallback was provided
        return NextResponse.json({
          error: scrapedMeta.error || 'Could not automatically load the job page. The site may require a login or anti-bot verification. Please paste the job description text into the box below.',
          canPasteText: true
        }, { status: 422 });
      }
    }

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json(
        {
          error: 'Job description text could not be extracted or is too short. Please paste the job description text into the box below so CareerOS can analyze it.',
          canPasteText: true
        },
        { status: 422 }
      );
    }

    // 1. Analyze Job with OpenAI / Heuristic Parser
    const jobData = await analyzeJobPosting(jobUrl || '', extractedText);

    // Merge high-confidence scraped metadata if available
    if (scrapedMeta?.title && (!jobData.title || jobData.title === 'Untitled Position')) {
      jobData.title = scrapedMeta.title;
    }
    if (scrapedMeta?.company && (!jobData.company || jobData.company === 'Unknown Company')) {
      jobData.company = scrapedMeta.company;
    }
    if (scrapedMeta?.location && (!jobData.location || jobData.location === 'Location Not Specified')) {
      jobData.location = scrapedMeta.location;
    }
    if (scrapedMeta?.applicationQuestions && scrapedMeta.applicationQuestions.length > 0) {
      jobData.applicationQuestions = [
        ...scrapedMeta.applicationQuestions,
        ...(jobData.applicationQuestions || [])
      ].filter((v, i, a) => a.indexOf(v) === i);
    }

    // 2. Fetch candidate's profile to perform matching
    const profile = await db.profile.findUnique({
      where: { userId: session.userId },
      include: {
        educations: true,
        experiences: true,
        projects: true,
        skills: true,
        certifications: true
      }
    });

    const candidateData: ExtractedCandidateData & { workAuthorization?: string | null; expectedSalary?: string | null } = {
      personal: {
        fullName: profile?.fullName || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        location: profile?.location || '',
        linkedinUrl: profile?.linkedinUrl || '',
        githubUrl: profile?.githubUrl || '',
        portfolioUrl: profile?.portfolioUrl || ''
      },
      education: (profile?.educations || []).map(e => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy || undefined,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        gpa: e.gpa || undefined,
        coursework: e.coursework || undefined
      })),
      experience: (profile?.experiences || []).map(e => ({
        company: e.company,
        role: e.role,
        startDate: e.startDate || undefined,
        endDate: e.endDate || undefined,
        description: e.description || undefined,
        achievements: e.achievements || undefined
      })),
      projects: (profile?.projects || []).map(p => ({
        title: p.title,
        description: p.description || undefined,
        technologies: p.technologies || undefined,
        link: p.link || undefined
      })),
      skills: (profile?.skills || []).map(s => ({
        name: s.name,
        category: s.category as any
      })),
      certifications: (profile?.certifications || []).map(c => ({
        name: c.name,
        issuer: c.issuer || undefined,
        issueDate: c.issueDate || undefined
      })),
      workAuthorization: profile?.workAuthorization,
      expectedSalary: profile?.expectedSalary
    };

    // 3. Save or update Job record in DB
    const jobRecord = await db.job.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        remoteType: jobData.remoteType,
        employmentType: jobData.employmentType,
        url: jobUrl || null,
        description: jobData.description,
        salaryRange: jobData.salaryRange,
        deadline: jobData.deadline,
        requiredSkills: JSON.stringify(jobData.requiredSkills),
        preferredSkills: JSON.stringify(jobData.preferredSkills),
        minExperience: jobData.minExperience,
        educationRequirements: jobData.educationRequirements
      }
    });

    // 4. Run Job Matching Engine
    const matchResult = await matchCandidateToJob(candidateData, jobData);

    // 5. Store JobMatch record in DB
    const matchRecord = await db.jobMatch.create({
      data: {
        userId: session.userId,
        jobId: jobRecord.id,
        score: matchResult.matchScore,
        eligible: matchResult.eligible,
        strengths: JSON.stringify(matchResult.strengths),
        missingRequirements: JSON.stringify(matchResult.missingRequirements),
        uncertainRequirements: JSON.stringify(matchResult.uncertainRequirements),
        explanation: matchResult.explanation
      }
    });

    // 6. Identify Missing Information
    const missingInfo = identifyMissingInformation(candidateData, jobData);

    return NextResponse.json({
      success: true,
      job: {
        ...jobRecord,
        requiredSkills: jobData.requiredSkills,
        preferredSkills: jobData.preferredSkills,
        applicationQuestions: jobData.applicationQuestions
      },
      match: {
        ...matchResult,
        id: matchRecord.id
      },
      missingInfo
    });
  } catch (err: any) {
    console.error('Job analysis error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze job posting.' },
      { status: 500 }
    );
  }
}
