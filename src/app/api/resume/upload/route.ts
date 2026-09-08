import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { extractTextFromFile } from '@/lib/parser/fileParser';
import { parseResumeText } from '@/lib/ai/aiService';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract text and validate format
    const extracted = await extractTextFromFile(buffer, file.name, file.type);

    // 2. AI Structured Extraction with Prompt Injection Defense
    const parsedCandidateData = await parseResumeText(extracted.text);

    // 3. Store the Resume document in database
    const resumeRecord = await db.resume.create({
      data: {
        userId: session.userId,
        fileName: file.name,
        fileSize: file.size,
        fileType: extracted.format,
        rawText: extracted.text,
        extractedDataJson: JSON.stringify(parsedCandidateData)
      }
    });

    // Return the extracted data to the client for human review & confirmation gate
    return NextResponse.json({
      success: true,
      resumeId: resumeRecord.id,
      extractedData: parsedCandidateData,
      textLength: extracted.text.length,
      message: 'Resume analyzed successfully. Please review the extracted data before confirming.'
    });
  } catch (err: any) {
    console.error('Resume upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process resume file.' },
      { status: 500 }
    );
  }
}
