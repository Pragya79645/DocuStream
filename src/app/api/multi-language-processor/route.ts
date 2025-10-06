import { NextRequest, NextResponse } from 'next/server';
import { multiLanguageProcessor } from '@/lib/services/multi-language-processor.service';

/**
 * API endpoint for multi-language document processing
 * Supports OCR, translation, summarization, and action point extraction
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file type (images only for OCR)
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload an image file (JPEG, PNG, GIF, WebP, BMP, TIFF).' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'process': {
        // Full document processing: OCR + Translation
        const result = await multiLanguageProcessor.processDocument(buffer);
        return NextResponse.json({
          success: true,
          data: {
            originalText: result.originalText,
            detectedLanguage: result.detectedLanguage,
            translatedText: result.translatedText,
            confidence: result.confidence,
            fileName: file.name,
            fileType: file.type
          }
        });
      }

      case 'analyze': {
        // Complete analysis: OCR + Translation + Summary + Action Points
        const analysis = await multiLanguageProcessor.analyzeDocument(buffer);
        return NextResponse.json({
          success: true,
          data: {
            text: {
              originalText: analysis.text.originalText,
              detectedLanguage: analysis.text.detectedLanguage,
              translatedText: analysis.text.translatedText,
              confidence: analysis.text.confidence
            },
            summary: analysis.summary,
            actionPoints: analysis.actionPoints,
            keyInsights: analysis.keyInsights,
            fileName: file.name,
            fileType: file.type
          }
        });
      }

      case 'extract-text': {
        // OCR only - extract text without translation
        const { text, confidence } = await multiLanguageProcessor.extractTextFromImage(buffer);
        return NextResponse.json({
          success: true,
          data: {
            extractedText: text,
            confidence: confidence,
            fileName: file.name,
            fileType: file.type
          }
        });
      }

      case 'translate': {
        // For text input - translation only
        const textInput = formData.get('text') as string;
        if (!textInput) {
          return NextResponse.json(
            { error: 'No text provided for translation' },
            { status: 400 }
          );
        }

        const result = await multiLanguageProcessor.translateToEnglish(textInput);
        return NextResponse.json({
          success: true,
          data: {
            originalText: result.originalText,
            detectedLanguage: result.detectedLanguage,
            translatedText: result.translatedText,
            confidence: result.confidence
          }
        });
      }

      case 'health': {
        // Health check for the multi-language processor
        const health = await multiLanguageProcessor.healthCheck();
        return NextResponse.json({
          success: true,
          data: health
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: process, analyze, extract-text, translate, health' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Multi-language processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process document', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check and service status
 */
export async function GET() {
  try {
    const health = await multiLanguageProcessor.healthCheck();
    return NextResponse.json({
      success: true,
      service: 'Multi-Language Document Processor',
      timestamp: new Date().toISOString(),
      data: health
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}