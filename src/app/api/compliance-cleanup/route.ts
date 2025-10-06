'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getComplianceDocuments, deleteComplianceDocument, getComplianceDocumentById } from '@/lib/services/compliance.service';
import { getAllDocuments } from '@/lib/services/documents.service';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action !== 'cleanup-invalid') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Starting cleanup of invalid compliance documents...');

    // Get all compliance documents and all real documents
    const [complianceDocuments, realDocuments] = await Promise.all([
      getComplianceDocuments(),
      getAllDocuments()
    ]);

    const realDocumentIds = realDocuments.map(doc => doc.id);
    const invalidCompliance = complianceDocuments.filter(comp => 
      !comp.documentId || 
      comp.documentId.trim() === '' || 
      !realDocumentIds.includes(comp.documentId)
    );

    console.log(`Found ${invalidCompliance.length} invalid compliance documents out of ${complianceDocuments.length} total`);

    let deletedCount = 0;
    const deletedItems = [];

    for (const compliance of invalidCompliance) {
      try {
        await deleteComplianceDocument(compliance.id);
        deletedCount++;
        deletedItems.push({
          id: compliance.id,
          title: compliance.title,
          documentId: compliance.documentId || 'empty'
        });
        console.log(`Deleted invalid compliance: ${compliance.title} (Document ID: ${compliance.documentId || 'empty'})`);
      } catch (error) {
        console.error(`Failed to delete compliance document ${compliance.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Deleted ${deletedCount} invalid compliance documents.`,
      deletedCount,
      totalChecked: complianceDocuments.length,
      deletedItems
    });

  } catch (error) {
    console.error('Error during compliance cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup compliance documents' },
      { status: 500 }
    );
  }
}