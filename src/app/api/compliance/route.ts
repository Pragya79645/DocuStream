'use server';

import { NextRequest, NextResponse } from 'next/server';
import { 
  getComplianceDocuments, 
  createComplianceDocument, 
  updateComplianceDocument, 
  deleteComplianceDocument,
  markComplianceAsCompleted,
  getPendingComplianceActions,
  updateComplianceStatuses,
  getComplianceDocumentsByUser,
  getComplianceDocumentsForDepartments,
  getSharedAwarenessItems
} from '@/lib/services/compliance.service';
import { ComplianceDocument } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');
    const departmentIds = searchParams.get('departmentIds');

    switch (action) {
      case 'pending':
        const pendingDocs = await getPendingComplianceActions();
        return NextResponse.json(pendingDocs);
      
      case 'by-user':
        if (!userId) {
          return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        const userCompliance = await getComplianceDocumentsByUser(userId);
        return NextResponse.json(userCompliance);
      
      case 'by-category':
        if (!categoryId) {
          return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }
        // TODO: Implement getComplianceDocumentsByCategory when needed
        return NextResponse.json([]);
      
      case 'cross-department':
        if (!departmentIds) {
          return NextResponse.json({ error: 'Department IDs are required' }, { status: 400 });
        }
        const departmentIdArray = departmentIds.split(',');
        const crossDeptDocs = await getComplianceDocumentsForDepartments(departmentIdArray);
        return NextResponse.json(crossDeptDocs);
        
      case 'shared-awareness':
        if (!departmentIds) {
          return NextResponse.json({ error: 'Department IDs are required' }, { status: 400 });
        }
        const deptIds = departmentIds.split(',');
        const sharedItems = await getSharedAwarenessItems(deptIds);
        return NextResponse.json(sharedItems);
      
      default:
        const allDocs = await getComplianceDocuments();
        return NextResponse.json(allDocs);
    }
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create':
        const complianceId = await createComplianceDocument(data);
        return NextResponse.json({ id: complianceId });
      
      case 'mark-completed':
        const { id } = data;
        if (!id) {
          return NextResponse.json({ error: 'Compliance ID is required' }, { status: 400 });
        }
        await markComplianceAsCompleted(id);
        return NextResponse.json({ success: true });
      
      case 'update-statuses':
        await updateComplianceStatuses();
        return NextResponse.json({ success: true });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing compliance request:', error);
    return NextResponse.json(
      { error: 'Failed to process compliance request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Compliance ID is required' }, { status: 400 });
    }

    await updateComplianceDocument(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating compliance document:', error);
    return NextResponse.json(
      { error: 'Failed to update compliance document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Compliance ID is required' }, { status: 400 });
    }

    await deleteComplianceDocument(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting compliance document:', error);
    return NextResponse.json(
      { error: 'Failed to delete compliance document' },
      { status: 500 }
    );
  }
}