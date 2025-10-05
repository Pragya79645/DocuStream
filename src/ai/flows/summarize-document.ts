'use server';

/**
 * @fileOverview A flow to generate comprehensive summaries of documents using Gemini AI with multi-language support.
 *
 * - summarizeDocument - A function that takes a document and generates a detailed summary
 * - SummarizeDocumentInput - The input type for the summarizeDocument function
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { updateDocument } from '@/lib/services/documents.service';
import { multiLanguageProcessor } from '@/lib/services/multi-language-processor.service';
import mammoth from 'mammoth';
import axios from 'axios';

const SummarizeDocumentInputSchema = z.object({
  documentId: z.string().describe('The ID of the document to summarize.'),
  fileUrl: z.string().describe('The public URL of the document to summarize.'),
  originalFilename: z.string().describe('The original name of the file.'),
  fileType: z.string().describe('The MIME type of the file.'),
  title: z.string().describe('The title of the document.'),
});

export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the document.'),
  documentId: z.string().describe('The ID of the document that was summarized.'),
});

export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

// Helper function to extract text from Word documents
async function extractTextFromWordDocument(fileUrl: string): Promise<string> {
  try {
    console.log(`Downloading Word document from: ${fileUrl}`);
    // Download the Word document
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    console.log(`Downloaded ${buffer.length} bytes, extracting text...`);
    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in the Word document');
    }
    
    console.log(`Successfully extracted ${result.value.length} characters of text`);
    return result.value;
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from Word document: ${error.message}`);
    }
    throw new Error('Failed to extract text from Word document: Unknown error');
  }
}

// Helper function to determine if a file is an image
function isImageDocument(fileType: string, originalFilename?: string): boolean {
  const lowerFileType = fileType.toLowerCase();
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
  
  const isImageByMimeType = imageTypes.includes(lowerFileType);
  
  // Also check file extension as fallback
  if (originalFilename) {
    const lowerFilename = originalFilename.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'];
    const isImageByExtension = imageExtensions.some(ext => lowerFilename.endsWith(ext));
    return isImageByMimeType || isImageByExtension;
  }
  
  return isImageByMimeType;
}

// Helper function to determine if a file is a Word document
function isWordDocument(fileType: string, originalFilename?: string): boolean {
  const lowerFileType = fileType.toLowerCase();
  const isWordByMimeType = lowerFileType.includes('wordprocessingml') || 
         lowerFileType.includes('msword') ||
         lowerFileType.includes('docx') ||
         lowerFileType.includes('doc') ||
         lowerFileType.endsWith('/docx') ||
         lowerFileType.endsWith('/doc') ||
         lowerFileType === 'docx' ||
         lowerFileType === 'doc';
  
  // Also check file extension as fallback
  if (originalFilename) {
    const lowerFilename = originalFilename.toLowerCase();
    const isWordByExtension = lowerFilename.endsWith('.docx') || lowerFilename.endsWith('.doc');
    return isWordByMimeType || isWordByExtension;
  }
  
  return isWordByMimeType;
}

// Helper function to download file as buffer
async function downloadFileAsBuffer(fileUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

const summarizePrompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {
    schema: z.object({
      documentUrl: z.string().optional(),
      documentText: z.string().optional(),
      translatedText: z.string().optional(),
      originalLanguage: z.string().optional(),
      documentTitle: z.string(),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A comprehensive summary of the document covering key points, context, and main topics in clear professional English.'),
    }),
  },
  prompt: `You are an AI assistant helping to summarize documents for KMRL (Kochi Metro Rail Limited).

  Create a brief, direct summary in 2-3 sentences that captures:
  - Main purpose of the document
  - Key subject/topic
  - Critical outcome or decision (if any)

  Always provide the summary in **clear, professional English only**, regardless of the original document language.

  {{#if originalLanguage}}
  Note: This document was originally in {{originalLanguage}} and has been translated to English for processing.
  {{/if}}

  Document Title: {{{documentTitle}}}

  {{#if translatedText}}
  Translated document content to summarize:
  {{{translatedText}}}
  {{/if}}
  {{#if documentText}}
  Document content to summarize:
  {{{documentText}}}
  {{/if}}
  {{#if documentUrl}}
  Document to summarize: {{media url=documentUrl}}
  {{/if}}

  Provide a compact, professional English summary (2-3 sentences maximum).
  `,
});

export async function summarizeDocument(
  input: SummarizeDocumentInput
): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async (input) => {
    console.log(`Starting document summarization for: ${input.title}`);
    
    // Determine how to process the document based on file type
    let result;
    
    console.log(`Processing document with fileType: "${input.fileType}", originalFilename: "${input.originalFilename}"`);
    console.log(`isWordDocument check result: ${isWordDocument(input.fileType, input.originalFilename)}`);
    console.log(`isImageDocument check result: ${isImageDocument(input.fileType, input.originalFilename)}`);
    
    if (isImageDocument(input.fileType, input.originalFilename)) {
      // For image documents, use multi-language OCR processing
      console.log('🖼️ IMAGE DOCUMENT DETECTED - Processing with multi-language OCR...');
      try {
        const fileBuffer = await downloadFileAsBuffer(input.fileUrl);
        const processedDocument = await multiLanguageProcessor.processDocument(fileBuffer);
        
        console.log(`Detected language: ${processedDocument.detectedLanguage}`);
        console.log(`OCR confidence: ${processedDocument.confidence}`);
        console.log(`Extracted and translated text length: ${processedDocument.translatedText.length} characters`);
        
        result = await summarizePrompt({ 
          translatedText: processedDocument.translatedText,
          originalLanguage: processedDocument.detectedLanguage !== 'en' ? processedDocument.detectedLanguage : undefined,
          documentTitle: input.title,
          documentUrl: undefined,
          documentText: undefined
        });
      } catch (ocrError) {
        console.error('Failed to process image with OCR:', ocrError);
        // Fallback to direct media processing
        console.log('Falling back to direct media processing...');
        result = await summarizePrompt({ 
          documentUrl: input.fileUrl, 
          documentTitle: input.title,
          documentText: undefined,
          translatedText: undefined,
          originalLanguage: undefined
        });
      }
    } else if (isWordDocument(input.fileType, input.originalFilename)) {
      // For Word documents, extract text first
      console.log('📄 WORD DOCUMENT DETECTED - Processing with text extraction...');
      try {
        const documentText = await extractTextFromWordDocument(input.fileUrl);
        console.log(`Extracted text length: ${documentText.length} characters`);
        
        // Check if the text needs translation
        const processedDocument = await multiLanguageProcessor.translateToEnglish(documentText);
        
        console.log(`Detected language: ${processedDocument.detectedLanguage}`);
        console.log(`Translation confidence: ${processedDocument.confidence}`);
        
        if (processedDocument.detectedLanguage !== 'en') {
          console.log('🌐 Non-English text detected, using translated version...');
          result = await summarizePrompt({ 
            translatedText: processedDocument.translatedText,
            originalLanguage: processedDocument.detectedLanguage,
            documentTitle: input.title,
            documentUrl: undefined,
            documentText: undefined
          });
        } else {
          console.log('✅ English text detected, processing directly...');
          result = await summarizePrompt({ 
            documentText: processedDocument.translatedText, 
            documentTitle: input.title,
            documentUrl: undefined,
            translatedText: undefined,
            originalLanguage: undefined
          });
        }
      } catch (textExtractionError) {
        console.error('Failed to extract text from Word document:', textExtractionError);
        throw new Error(`Failed to extract text from Word document: ${textExtractionError instanceof Error ? textExtractionError.message : 'Unknown error'}`);
      }
    } else {
      // For other file types (PDF, etc.), use direct media processing
      console.log('📋 OTHER DOCUMENT TYPE - Processing with direct media upload...');
      console.log(`File type "${input.fileType}" processing with direct media analysis`);
      result = await summarizePrompt({ 
        documentUrl: input.fileUrl, 
        documentTitle: input.title,
        documentText: undefined,
        translatedText: undefined,
        originalLanguage: undefined
      });
    }

    if (!result || !result.output) {
      throw new Error('AI summarization failed to produce output.');
    }

    const summary = result.output.summary;

    // Update the document with the generated summary
    await updateDocument(input.documentId, {
      summary: summary
    });

    console.log(`Document summarization completed for: ${input.title}`);

    return {
      summary,
      documentId: input.documentId,
    };
  }
);