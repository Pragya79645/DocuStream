'use server';

/**
 * @fileOverview Extracts action points and categorizes documents by department using Gemini AI with multi-language support.
 *
 * - extractActionPointsAndCategorizeDocuments - A function that takes extracted text from documents, sends it to Gemini, and stores the results in the database.
 * - ExtractActionPointsAndCategorizeDocumentsInput - The input type for the extractActionPointsAndCategorizeDocuments function.
 * - ExtractActionPointsAndCategorizeDocumentsOutput - The return type for the extractActionPointsAndCategorizeDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { createDocument, updateDocument } from '@/lib/services/documents.service';
import { Document } from '@/lib/types';
import { getUsersInCategory, getUsers } from '@/lib/services/users.service';
import { createBulkNotifications } from '@/lib/services/notifications.service';
import { getCategories } from '@/lib/services/categories.service';
import { summarizeDocument } from './summarize-document';
import { multiLanguageProcessor } from '@/lib/services/multi-language-processor.service';
import { classifyDocumentTargeting } from '@/lib/services/document-targeting.service';
import { getUsersForDocument } from '@/lib/utils/document-targeting-utils';
import mammoth from 'mammoth';
import axios from 'axios';

const ExtractActionPointsAndCategorizeDocumentsInputSchema = z.object({
  fileUrl: z.string().describe('The public URL of the document to process.'),
  originalFilename: z.string().describe('The original name of the file.'),
  fileType: z.string().describe('The MIME type of the file.'),
  uploaderId: z.string().describe('The ID of the user who uploaded the file.'),
  title: z.string().describe('The title of the document.'),
});

export type ExtractActionPointsAndCategorizeDocumentsInput = z.infer<
  typeof ExtractActionPointsAndCategorizeDocumentsInputSchema
>;

const ExtractActionPointsAndCategorizeDocumentsOutputSchema = z.object({
  documentId: z.string(),
  actionPoints: z
    .array(z.string())
    .describe('A list of action points extracted from the document.'),
  department: z
    .string()
    .describe('The primary department for the document.'),
  priority: z
    .enum(['low', 'medium', 'high'])
    .describe('Priority level determined by the AI based on urgency indicators.'),
  targetingClassification: z.object({
    targetingType: z.enum(['department', 'role']).describe('Whether this document is for a whole department or specific role'),
    confidence: z.number().min(0).max(1).describe('Confidence score for the targeting classification'),
    reasoning: z.string().describe('Explanation for the targeting classification'),
    roleDetails: z.object({
      roleTitle: z.string(),
      roleLevel: z.enum(['executive', 'management', 'senior', 'junior']),
      department: z.string()
    }).optional().describe('Details if document is role-specific')
  }).describe('Classification of document targeting'),
  crossDepartmentAnalysis: z.object({
    affectedDepartments: z.array(z.object({
      departmentName: z.string(),
      relevanceScore: z.number().min(0).max(1),
      reason: z.string(),
      tags: z.array(z.string())
    })).describe('Other departments that should be aware of this document'),
    requiresCoordination: z.boolean().describe('Whether this document requires coordination between departments'),
    coordinationReason: z.string().optional().describe('Why coordination is needed')
  }).describe('Analysis of cross-department relevance')
});

export type ExtractActionPointsAndCategorizeDocumentsOutput = z.infer<
  typeof ExtractActionPointsAndCategorizeDocumentsOutputSchema
>;

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

export async function extractActionPointsAndCategorizeDocuments(
  input: ExtractActionPointsAndCategorizeDocumentsInput
): Promise<ExtractActionPointsAndCategorizeDocumentsOutput> {
  return extractActionPointsAndCategorizeDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionPointsAndCategorizeDocumentsPrompt',
  input: {
    schema: z.object({
      documentUrl: z.string().optional(),
      documentText: z.string().optional(),
      translatedText: z.string().optional(),
      originalLanguage: z.string().optional(),
      departmentNames: z.array(z.string()),
    }),
  },
  output: {
    schema: z.object({
      actionPoints: z
        .array(z.string())
        .describe('A list of action points extracted from the document in clear professional English.'),
      primaryDepartment: z
        .string()
        .describe('The primary department for the document.'),
      priority: z
        .enum(['low', 'medium', 'high'])
        .describe('Priority level based on urgency indicators, deadlines, and impact assessment.'),
      crossDepartmentAnalysis: z.object({
        affectedDepartments: z.array(z.object({
          departmentName: z.string(),
          relevanceScore: z.number().min(0).max(1),
          reason: z.string(),
          tags: z.array(z.string())
        })).describe('Other departments that should be aware of this document'),
        requiresCoordination: z.boolean().describe('Whether this document requires coordination between departments'),
        coordinationReason: z.string().optional().describe('Why coordination is needed')
      }).describe('Analysis of cross-department relevance')
    }),
  },
  prompt: `You are an AI assistant helping to process documents for KMRL (Kochi Metro Rail Limited).

  Your task is to extract action points from the document, categorize it by department, and identify cross-department relevance.

  **IMPORTANT: Always output action points in clear, professional English only**, even if the original document was in another language.

  {{#if originalLanguage}}
  Note: This document was originally in {{originalLanguage}} and has been translated to English for processing.
  {{/if}}

  Action Points:
  Extract a bulleted list of action points from the document. These should be:
  - Clear, concise tasks that need to be done
  - Written in professional English
  - Actionable and specific
  - Properly translated if the source was in another language

  Primary Department:
  Determine the most relevant department for the document from the following list: {{{departmentNames}}}.

  Priority Assessment:
  Analyze the document content to determine priority level based on these criteria:
  
  HIGH PRIORITY (urgent, immediate attention required):
  - Contains urgency keywords: "urgent", "emergency", "immediate", "critical", "deadline", "ASAP", "crisis"
  - Time-sensitive phrases: "by end of day", "within 24 hours", "immediately required", "time-critical"
  - Regulatory compliance with specific near-term deadlines (within 7 days)
  - Safety-related issues, incidents, or emergency procedures
  - Financial documents with immediate impact or time-sensitive decisions
  - System outages, critical failures, or service disruptions
  - Documents requiring action within 7 days or less
  - Legal notices or regulatory warnings
  - Emergency protocols or crisis management procedures
  
  MEDIUM PRIORITY (important, action needed within reasonable timeframe):
  - Policy changes with implementation timelines (7-30 days)
  - Training materials with scheduled sessions or deadlines
  - Project updates with upcoming milestones or deliverables
  - Budget planning, resource allocation, or procurement documents
  - Maintenance schedules or routine operational procedures
  - Documents requiring action within 30 days
  - Staff announcements requiring departmental coordination
  - Compliance updates with medium-term deadlines
  
  LOW PRIORITY (informational, no immediate action required):
  - General announcements, newsletters, or informational updates
  - Reference materials, documentation, or knowledge base articles
  - Meeting minutes without urgent action items
  - Informational reports, statistics, or performance updates
  - Long-term planning documents or strategic initiatives
  - Historical records, archives, or documentation
  - Routine communications without specific deadlines
  - Educational content or general training materials

  Cross-Department Analysis:
  Analyze if this document affects multiple departments. Consider:
  - Design changes that affect both Engineering and Design
  - Safety bulletins that affect HR and Operations
  - Financial policies affecting Finance and multiple operational departments
  - Regulatory changes affecting Legal and relevant operational departments
  - Training materials affecting HR and specific operational departments
  
  For each affected department, provide:
  - Department name (from the provided list)
  - Relevance score (0.0 to 1.0, where 1.0 means highly relevant)
  - Specific reason why this department should be aware
  - Relevant tags (e.g., "safety", "policy-change", "training-required", "deadline")

  Only include departments with relevance score >= 0.3.

  {{#if translatedText}}
  Translated document content to process:
  {{{translatedText}}}
  {{/if}}
  {{#if documentText}}
  Document content to process:
  {{{documentText}}}
  {{/if}}
  {{#if documentUrl}}
  Document to process: {{media url=documentUrl}}
  {{/if}}

  Respond with action points in **English only** and comprehensive cross-department analysis.
  `,
});

const extractActionPointsAndCategorizeDocumentsFlow = ai.defineFlow(
  {
    name: 'extractActionPointsAndCategorizeDocumentsFlow',
    inputSchema: ExtractActionPointsAndCategorizeDocumentsInputSchema,
    outputSchema: ExtractActionPointsAndCategorizeDocumentsOutputSchema,
  },
  async input => {
    // 1. Create initial document in Firestore
    const newDoc: Omit<Document, 'id' | 'uploadedAt'> = {
      title: input.title,
      originalFilename: input.originalFilename,
      fileType: input.fileType.split('/')[1]?.toUpperCase() || 'FILE',
      uploaderId: input.uploaderId,
      fileUrl: input.fileUrl,
      categoryId: '', // Will be updated by AI
      targetingType: 'department', // Default, will be updated by AI
      actionPoints: [], // Will be updated by AI
      status: 'processing',
    };
    const documentId = await createDocument(newDoc);

    // Get available departments to constrain the AI's choice
    const allCategories = await getCategories();
    const departmentNames = allCategories.map(c => c.name);

    // 2. Determine how to process the document based on file type
    let output;
    
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
        
        const result = await prompt({ 
          translatedText: processedDocument.translatedText,
          originalLanguage: processedDocument.detectedLanguage !== 'en' ? processedDocument.detectedLanguage : undefined,
          departmentNames,
          documentUrl: undefined,
          documentText: undefined
        });
        output = result.output;
      } catch (ocrError) {
        console.error('Failed to process image with OCR:', ocrError);
        await updateDocument(documentId, { status: 'failed' });
        throw new Error(`Failed to process image document: ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}`);
      }
    } else if (isWordDocument(input.fileType, input.originalFilename)) {
      // For Word documents, extract text first then translate if needed
      console.log('📄 WORD DOCUMENT DETECTED - Processing with text extraction and translation...');
      try {
        const documentText = await extractTextFromWordDocument(input.fileUrl);
        console.log(`Extracted text length: ${documentText.length} characters`);
        
        // Check if the text needs translation
        const processedDocument = await multiLanguageProcessor.translateToEnglish(documentText);
        
        console.log(`Detected language: ${processedDocument.detectedLanguage}`);
        console.log(`Translation confidence: ${processedDocument.confidence}`);
        
        if (processedDocument.detectedLanguage !== 'en') {
          console.log('🌐 Non-English text detected, using translated version...');
          const result = await prompt({ 
            translatedText: processedDocument.translatedText,
            originalLanguage: processedDocument.detectedLanguage,
            departmentNames,
            documentUrl: undefined,
            documentText: undefined
          });
          output = result.output;
        } else {
          console.log('✅ English text detected, processing directly...');
          const result = await prompt({ 
            documentText: processedDocument.translatedText, 
            departmentNames,
            documentUrl: undefined,
            translatedText: undefined,
            originalLanguage: undefined
          });
          output = result.output;
        }
      } catch (textExtractionError) {
        console.error('Failed to extract text from Word document:', textExtractionError);
        await updateDocument(documentId, { status: 'failed' });
        throw new Error(`Failed to extract text from Word document: ${textExtractionError instanceof Error ? textExtractionError.message : 'Unknown error'}`);
      }
    } else {
      // For other file types (PDF, etc.), use direct media processing
      console.log('📋 OTHER DOCUMENT TYPE - Processing with direct media upload...');
      console.log(`File type "${input.fileType}" processing with direct media analysis`);
      const result = await prompt({ 
        documentUrl: input.fileUrl, 
        departmentNames,
        documentText: undefined,
        translatedText: undefined,
        originalLanguage: undefined
      });
      output = result.output;
    }

    if (!output) {
      // Handle error case, maybe update document status to 'failed'
      await updateDocument(documentId, { status: 'failed' });
      throw new Error('AI processing failed to produce output.');
    }

    console.log(`AI determined priority: ${output.priority} for document: ${input.title}`);

    // 3. Update document with AI results and cross-department information
    const mappedActionPoints = output.actionPoints.map((text, index) => ({
      id: `${documentId}-ap-${index + 1}`,
      text,
      isCompleted: false,
    }));
    
    const matchedCategory = allCategories.find(c => c.name === output.primaryDepartment);
    const categoryId = matchedCategory?.id || 'uncategorized';

    // Process cross-department information
    const affectedDepartmentIds: string[] = [];
    const crossDepartmentTags: string[] = [];
    const departmentRelevanceScore: { [departmentId: string]: number } = {};

    output.crossDepartmentAnalysis.affectedDepartments.forEach(dept => {
      const deptCategory = allCategories.find(c => c.name === dept.departmentName);
      if (deptCategory && dept.relevanceScore >= 0.3) {
        affectedDepartmentIds.push(deptCategory.id);
        departmentRelevanceScore[deptCategory.id] = dept.relevanceScore;
        crossDepartmentTags.push(...dept.tags);
      }
    });

    // Remove duplicates from tags
    const uniqueTags = [...new Set(crossDepartmentTags)];

    // 4. Classify document targeting (department vs role-specific)
    let documentContent = '';
    if (isImageDocument(input.fileType, input.originalFilename)) {
      // For images, we need to re-extract the text for targeting classification
      try {
        const fileBuffer = await downloadFileAsBuffer(input.fileUrl);
        const processedDocument = await multiLanguageProcessor.processDocument(fileBuffer);
        documentContent = processedDocument.translatedText;
      } catch (error) {
        console.warn('Could not extract text for targeting classification from image:', error);
        documentContent = input.title; // Fallback to title only
      }
    } else if (isWordDocument(input.fileType, input.originalFilename)) {
      try {
        const extractedText = await extractTextFromWordDocument(input.fileUrl);
        const processedDocument = await multiLanguageProcessor.translateToEnglish(extractedText);
        documentContent = processedDocument.translatedText;
      } catch (error) {
        console.warn('Could not extract text for targeting classification from Word document:', error);
        documentContent = input.title;
      }
    } else {
      // For PDFs and other types, use title and available content
      documentContent = input.title + ' ' + (output.actionPoints.join(' ') || '');
    }

    // Perform document targeting classification
    const targetingClassification = classifyDocumentTargeting(
      input.title,
      documentContent,
      categoryId
    );

    console.log(`Document targeting classification: ${targetingClassification.targetingType} (confidence: ${targetingClassification.confidence})`);

    try {
      const updateData: Partial<Document> = {
        categoryId: categoryId,
        actionPoints: mappedActionPoints,
        priority: output.priority,
        targetingType: targetingClassification.targetingType,
        status: 'processed'
      };

      // Add optional fields only if they have meaningful values
      if (targetingClassification.roleClassification?.roleTitle) {
        updateData.specificRole = targetingClassification.roleClassification.roleTitle;
      }

      if (targetingClassification.roleClassification) {
        updateData.roleClassification = {
          departmentId: targetingClassification.roleClassification.departmentId,
          roleTitle: targetingClassification.roleClassification.roleTitle,
          roleLevel: targetingClassification.roleClassification.roleLevel,
          confidence: targetingClassification.confidence
        };
      }

      if (affectedDepartmentIds.length > 0) {
        updateData.affectedDepartmentIds = affectedDepartmentIds;
      }

      if (uniqueTags.length > 0) {
        updateData.crossDepartmentTags = uniqueTags;
      }

      if (Object.keys(departmentRelevanceScore).length > 0) {
        updateData.departmentRelevanceScore = departmentRelevanceScore;
      }

      await updateDocument(documentId, updateData);
      console.log(`Successfully updated document ${documentId} with targeting classification`);
    } catch (updateError) {
      console.error('Failed to update document with targeting classification:', updateError);
      // Don't fail the entire process, but log the error
      await updateDocument(documentId, { status: 'processed' }); // At least mark as processed
    }
    
    // 4. Generate document summary in parallel
    try {
      await summarizeDocument({
        documentId: documentId,
        fileUrl: input.fileUrl,
        originalFilename: input.originalFilename,
        fileType: input.fileType,
        title: input.title,
      });
      console.log(`Document summary generated for: ${input.title}`);
    } catch (summaryError) {
      console.error('Failed to generate document summary:', summaryError);
      // Don't fail the entire process if summary generation fails
    }
    
    // 5. Send notifications using proper targeting logic
    try {
      // Get all users and filter based on document targeting
      const allUsers = await getUsers();
      
      // Create a document object for targeting check with all required fields
      const documentForTargeting: Document = {
        id: documentId,
        title: input.title,
        originalFilename: input.originalFilename,
        fileType: input.fileType.split('/')[1]?.toUpperCase() || 'FILE',
        fileUrl: input.fileUrl,
        uploadedAt: new Date().toISOString(),
        uploaderId: input.uploaderId,
        categoryId: categoryId,
        targetingType: targetingClassification.targetingType,
        roleClassification: targetingClassification.roleClassification ? {
          departmentId: targetingClassification.roleClassification.departmentId,
          roleTitle: targetingClassification.roleClassification.roleTitle,
          roleLevel: targetingClassification.roleClassification.roleLevel,
          confidence: targetingClassification.confidence
        } : undefined,
        affectedDepartmentIds: affectedDepartmentIds.length > 0 ? affectedDepartmentIds : undefined,
        actionPoints: mappedActionPoints,
        priority: output.priority,
        status: 'processed'
      };

      // Get users who should receive notifications based on targeting
      const targetUserIds = getUsersForDocument(documentForTargeting, allUsers);
      
      if (targetUserIds.length > 0) {
        const notificationMessage = targetingClassification.targetingType === 'role' 
          ? `New role-specific document: "${input.title}" (targeted at ${targetingClassification.roleClassification?.roleTitle || 'specific role'})`
          : affectedDepartmentIds.length > 0 
            ? `New cross-department document: "${input.title}" (affects multiple departments)`
            : `New document in ${matchedCategory?.name || 'Unknown'}: "${input.title}"`;
            
        await createBulkNotifications(targetUserIds, {
          message: notificationMessage,
          href: `/dashboard/doc/${documentId}`
        });
        
        console.log(`Sent notifications to ${targetUserIds.length} users based on document targeting`);
      } else {
        console.log('No users found matching document targeting criteria');
      }
    } catch (notificationError) {
      console.error('Failed to send targeted notifications:', notificationError);
      // Fallback to original notification logic
      const fallbackUserIds = new Set<string>();
      
      if (matchedCategory) {
        const primaryUsers = await getUsersInCategory(matchedCategory.id);
        primaryUsers.forEach(user => fallbackUserIds.add(user.id));
      }
      
      if (fallbackUserIds.size > 0) {
        await createBulkNotifications(Array.from(fallbackUserIds), {
          message: `New document: "${input.title}"`,
          href: `/dashboard/doc/${documentId}`
        });
      }
    }

    return {
      documentId,
      department: output.primaryDepartment,
      actionPoints: output.actionPoints,
      priority: output.priority, // Include AI-determined priority in return
      targetingClassification: {
        targetingType: targetingClassification.targetingType,
        confidence: targetingClassification.confidence,
        reasoning: targetingClassification.reasoning,
        roleDetails: targetingClassification.roleClassification ? {
          roleTitle: targetingClassification.roleClassification.roleTitle,
          roleLevel: targetingClassification.roleClassification.roleLevel,
          department: output.primaryDepartment
        } : undefined
      },
      crossDepartmentAnalysis: output.crossDepartmentAnalysis,
    };
  }
);
