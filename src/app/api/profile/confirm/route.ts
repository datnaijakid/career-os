import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ExtractedCandidateData } from '@/lib/ai/aiService';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const confirmedData: ExtractedCandidateData & { workAuthorization?: string; expectedSalary?: string } = body;

    // 1. Get or create Profile
    let profile = await db.profile.findUnique({
      where: { userId: session.userId }
    });

    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId: session.userId,
          email: session.email
        }
      });
    }

    // 2. Perform a transactional update: replace existing relational records with user-confirmed facts
    await db.$transaction(async (tx) => {
      // Clear out old records if re-confirming / replacing resume
      await tx.education.deleteMany({ where: { profileId: profile.id } });
      await tx.experience.deleteMany({ where: { profileId: profile.id } });
      await tx.project.deleteMany({ where: { profileId: profile.id } });
      await tx.skill.deleteMany({ where: { profileId: profile.id } });
      await tx.certification.deleteMany({ where: { profileId: profile.id } });

      // Update main profile fields
      await tx.profile.update({
        where: { id: profile.id },
        data: {
          fullName: confirmedData.personal?.fullName || profile.fullName,
          email: confirmedData.personal?.email || profile.email,
          phone: confirmedData.personal?.phone || profile.phone,
          location: confirmedData.personal?.location || profile.location,
          linkedinUrl: confirmedData.personal?.linkedinUrl || profile.linkedinUrl,
          githubUrl: confirmedData.personal?.githubUrl || profile.githubUrl,
          portfolioUrl: confirmedData.personal?.portfolioUrl || profile.portfolioUrl,
          workAuthorization: confirmedData.workAuthorization || profile.workAuthorization,
          expectedSalary: confirmedData.expectedSalary || profile.expectedSalary,
          confirmedAt: new Date()
        }
      });

      // Insert Educations
      if (confirmedData.education && confirmedData.education.length > 0) {
        await tx.education.createMany({
          data: confirmedData.education.map((edu) => ({
            profileId: profile.id,
            institution: edu.institution || 'Unknown Institution',
            degree: edu.degree || 'Degree',
            fieldOfStudy: edu.fieldOfStudy || null,
            startDate: edu.startDate || null,
            endDate: edu.endDate || null,
            gpa: edu.gpa || null,
            coursework: edu.coursework || null
          }))
        });
      }

      // Insert Experiences
      if (confirmedData.experience && confirmedData.experience.length > 0) {
        await tx.experience.createMany({
          data: confirmedData.experience.map((exp) => ({
            profileId: profile.id,
            company: exp.company || 'Company',
            role: exp.role || 'Role',
            startDate: exp.startDate || null,
            endDate: exp.endDate || null,
            description: exp.description || null,
            achievements: exp.achievements || null
          }))
        });
      }

      // Insert Projects
      if (confirmedData.projects && confirmedData.projects.length > 0) {
        await tx.project.createMany({
          data: confirmedData.projects.map((proj) => ({
            profileId: profile.id,
            title: proj.title || 'Project',
            description: proj.description || null,
            technologies: proj.technologies || null,
            link: proj.link || null
          }))
        });
      }

      // Insert Skills
      if (confirmedData.skills && confirmedData.skills.length > 0) {
        await tx.skill.createMany({
          data: confirmedData.skills.map((skill) => ({
            profileId: profile.id,
            name: skill.name,
            category: skill.category || 'other'
          }))
        });
      }

      // Insert Certifications
      if (confirmedData.certifications && confirmedData.certifications.length > 0) {
        await tx.certification.createMany({
          data: confirmedData.certifications.map((cert) => ({
            profileId: profile.id,
            name: cert.name,
            issuer: cert.issuer || null,
            issueDate: cert.issueDate || null
          }))
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Candidate profile verified and saved authoritative record.'
    });
  } catch (err: any) {
    console.error('Confirm profile error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to save confirmed profile.' },
      { status: 500 }
    );
  }
}
