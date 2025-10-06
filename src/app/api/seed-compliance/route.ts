import { NextRequest, NextResponse } from 'next/server';
import { seedComplianceData } from '@/lib/seed-compliance-data';
import { getComplianceDocuments, deleteComplianceDocument } from '@/lib/services/compliance.service';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'seed') {
      await seedComplianceData();
      return NextResponse.json({ 
        success: true, 
        message: 'Compliance data seeded successfully' 
      });
    } else if (action === 'clear') {
      // Clear all existing compliance documents
      const existingCompliance = await getComplianceDocuments();
      
      for (const compliance of existingCompliance) {
        await deleteComplianceDocument(compliance.id);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Cleared ${existingCompliance.length} compliance documents` 
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "seed" or "clear"' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing compliance data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process compliance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Compliance seeding endpoint',
    usage: 'POST with { "action": "seed" } to seed compliance data'
  });
}