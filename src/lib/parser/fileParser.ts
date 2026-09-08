import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractedResumeText {
  text: string;
  pageCount?: number;
  format: 'pdf' | 'docx';
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ExtractedResumeText> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 10MB limit.');
  }

  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    const sanitized = sanitizeText(data.text);
    if (!sanitized || sanitized.trim().length === 0) {
      throw new Error('The uploaded PDF does not contain extractable text. Scanned or image-only PDFs are not yet supported.');
    }
    return {
      text: sanitized,
      pageCount: data.numpages,
      format: 'pdf'
    };
  }

  if (
    lowerName.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const sanitized = sanitizeText(result.value);
    if (!sanitized || sanitized.trim().length === 0) {
      throw new Error('The uploaded DOCX does not contain extractable text.');
    }
    return {
      text: sanitized,
      format: 'docx'
    };
  }

  throw new Error('Unsupported file format. Please upload a PDF or DOCX document.');
}

export function sanitizeText(input: string): string {
  if (!input) return '';
  // Remove null bytes and non-printable control characters, preserving normal whitespace
  return input
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
