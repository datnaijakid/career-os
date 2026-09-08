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

    const profile = await db.profile.findUnique({
      where: { userId: session.userId },
      include: {
        educations: true,
        experiences: true,
        projects: true,
        skills: true,
        certifications: true,
        customAttributes: true
      }
    });

    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error('Fetch profile error:', err);
    return NextResponse.json({ error: 'Failed to retrieve profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      location,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      workAuthorization,
      expectedSalary
    } = body;

    const updated = await db.profile.upsert({
      where: { userId: session.userId },
      update: {
        fullName,
        email,
        phone,
        location,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        workAuthorization,
        expectedSalary
      },
      create: {
        userId: session.userId,
        fullName,
        email,
        phone,
        location,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        workAuthorization,
        expectedSalary
      },
      include: {
        educations: true,
        experiences: true,
        projects: true,
        skills: true,
        certifications: true
      }
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message: 'Profile updated successfully.'
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
