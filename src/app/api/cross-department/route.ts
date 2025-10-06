'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments } from '@/lib/services/documents.service';
import { getCategories } from '@/lib/services/categories.service';
import { Document, SharedAwarenessItem } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const departmentIds = searchParams.get('departmentIds');

    switch (action) {
      case 'cross-department':
        if (!departmentIds) {
          return NextResponse.json({ error: 'Department IDs are required' }, { status: 400 });
        }
        const deptIds = departmentIds.split(',');
        const crossDeptDocs = await getCrossDepartmentDocuments(deptIds);
        return NextResponse.json(crossDeptDocs);
        
      case 'shared-awareness':
        if (!departmentIds) {
          return NextResponse.json({ error: 'Department IDs are required' }, { status: 400 });
        }
        const departmentIdArray = departmentIds.split(',');
        const sharedItems = await getSharedAwarenessDocuments(departmentIdArray);
        return NextResponse.json(sharedItems);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching cross-department documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cross-department documents' },
      { status: 500 }
    );
  }
}

async function getCrossDepartmentDocuments(departmentIds: string[]): Promise<Document[]> {
  try {
    const allDocuments = await getAllDocuments();
    
    return allDocuments.filter(doc => {
      // Include if primary department matches or if it affects any of the requested departments
      const primaryMatch = departmentIds.includes(doc.categoryId);
      const affectedMatch = doc.affectedDepartmentIds && 
                           doc.affectedDepartmentIds.some(deptId => departmentIds.includes(deptId));
      
      return primaryMatch || affectedMatch;
    }).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.error('Error getting cross-department documents:', error);
    throw error;
  }
}

async function getSharedAwarenessDocuments(departmentIds: string[]): Promise<SharedAwarenessItem[]> {
  try {
    const { getComplianceDocuments } = await import('@/lib/services/compliance.service');
    
    const [allDocuments, categories, complianceDocuments] = await Promise.all([
      getAllDocuments(),
      getCategories(),
      getComplianceDocuments()
    ]);
    
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    
    // Create a map of document IDs to their compliance records
    const documentComplianceMap = new Map();
    complianceDocuments.forEach(comp => {
      if (comp.documentId) {
        documentComplianceMap.set(comp.documentId, comp);
      }
    });
    
    return allDocuments
      .filter(doc => {
        // Only include documents that have cross-department relevance
        return doc.affectedDepartmentIds && doc.affectedDepartmentIds.length > 0 &&
               (departmentIds.includes(doc.categoryId) || 
                doc.affectedDepartmentIds.some(deptId => departmentIds.includes(deptId)));
      })
      .map(doc => {
        // Check if this document has an associated compliance record
        const associatedCompliance = documentComplianceMap.get(doc.id);
        
        return {
          id: doc.id,
          type: 'document' as const,
          title: doc.title,
          primaryDepartment: categoryMap.get(doc.categoryId) || 'Unknown',
          affectedDepartments: doc.affectedDepartmentIds?.map(id => categoryMap.get(id) || 'Unknown') || [],
          priority: doc.priority || 'medium',
          dueDate: associatedCompliance?.dueDate || doc.complianceDeadline, // Include compliance due date
          lastUpdated: doc.uploadedAt,
          href: `/dashboard/document?doc=${doc.id}`, // Link to document detail page
          tags: doc.crossDepartmentTags || []
        };
      })
      .sort((a, b) => {
        // Sort by priority then by date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        if (priorityDiff !== 0) return priorityDiff;
        
        // If same priority, sort by due date (items with due dates first)
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      });
  } catch (error) {
    console.error('Error getting shared awareness documents:', error);
    throw error;
  }
}