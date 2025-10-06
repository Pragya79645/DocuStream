import { NextRequest, NextResponse } from 'next/server';
import { summarizeDocument } from '@/ai/flows/summarize-document';
import { getDocumentById } from '@/lib/services/documents.service';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get the document details
    const document = await getDocumentById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate summary using the AI flow
    const result = await summarizeDocument({
      documentId: document.id,
      fileUrl: document.fileUrl || '',
      originalFilename: document.originalFilename,
      fileType: document.fileType,
      title: document.title,
    });

    return NextResponse.json({ 
      success: true, 
      summary: result.summary 
    });

  } catch (error) {
    console.error('Error generating document summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate document summary' },
      { status: 500 }
    );
  }
}