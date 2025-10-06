'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getComplianceDocuments } from '@/lib/services/compliance.service';
import { getCategories } from '@/lib/services/categories.service';
import { getAllDocuments } from '@/lib/services/documents.service';
import { ComplianceDocument, Category, Document } from '@/lib/types';

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
        const crossDeptData = await getCrossDepartmentComplianceWithAlerts(deptIds);
        return NextResponse.json(crossDeptData);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching compliance with alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance with alerts' },
      { status: 500 }
    );
  }
}

async function getCrossDepartmentComplianceWithAlerts(departmentIds: string[]) {
  try {
    const [complianceDocuments, categories, allDocuments] = await Promise.all([
      getComplianceDocuments(),
      getCategories(),
      getAllDocuments()
    ]);

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const documentMap = new Map(allDocuments.map(doc => [doc.id, doc]));

    const results: any[] = [];

    // Process compliance documents
    complianceDocuments.forEach((comp: ComplianceDocument) => {
      const document = comp.documentId ? documentMap.get(comp.documentId) : null;
      
      // Check if this compliance item affects any of the requested departments
      const primaryDepartmentMatch = departmentIds.includes(comp.categoryId);
      const affectedDepartmentsMatch = document?.affectedDepartmentIds?.some(deptId => 
        departmentIds.includes(deptId)
      );

      if (primaryDepartmentMatch || affectedDepartmentsMatch) {
        const primaryDepartmentName = categoryMap.get(comp.categoryId) || 'Unknown';
        const affectedDepartmentNames = document?.affectedDepartmentIds?.map(id => 
          categoryMap.get(id) || 'Unknown'
        ).filter(name => name !== 'Unknown') || [];

        // Determine priority based on status and due date
        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (comp.status === 'overdue') {
          priority = 'high';
        } else if (comp.status === 'due-soon') {
          priority = 'medium';
        } else if (comp.status === 'completed') {
          priority = 'low';
        } else if (comp.status === 'on-track') {
          priority = 'medium';
        }

        // Check if due date is approaching (within 3 days) or overdue
        if (comp.dueDate) {
          const dueDate = new Date(comp.dueDate);
          const now = new Date();
          const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            priority = 'high'; // Overdue
          } else if (diffDays <= 3) {
            priority = priority === 'low' ? 'medium' : 'high'; // Due soon
          }
        }

        results.push({
          id: comp.id,
          type: 'compliance',
          title: comp.title || `Compliance for ${document?.title || 'Document'}`,
          description: comp.description || `Compliance requirement for ${primaryDepartmentName}`,
          primaryDepartment: primaryDepartmentName,
          affectedDepartments: affectedDepartmentNames,
          priority,
          lastUpdated: comp.updatedAt || comp.createdAt || new Date().toISOString(),
          status: comp.status,
          dueDate: comp.dueDate,
          tags: [
            'compliance',
            ...(document?.crossDepartmentTags || []),
            ...(comp.status === 'overdue' ? ['overdue'] : []),
            ...(priority === 'high' ? ['urgent'] : [])
          ]
        });

        // Create alert items for overdue or critical compliance
        if (comp.status === 'overdue' || (comp.dueDate && new Date(comp.dueDate) < new Date())) {
          results.push({
            id: `alert-${comp.id}`,
            type: 'alert',
            title: `Overdue: ${comp.title || 'Compliance Item'}`,
            description: `Compliance requirement is overdue in ${primaryDepartmentName}`,
            primaryDepartment: primaryDepartmentName,
            affectedDepartments: affectedDepartmentNames,
            priority: 'high',
            timestamp: new Date().toISOString(),
            tags: ['alert', 'overdue', 'compliance']
          });
        }
      }
    });

    // Add document-based alerts for high-priority cross-department documents
    allDocuments.forEach((doc: Document) => {
      if (doc.priority === 'high' && 
          doc.affectedDepartmentIds && 
          doc.affectedDepartmentIds.length > 0) {
        
        const primaryDepartmentMatch = departmentIds.includes(doc.categoryId);
        const affectedDepartmentsMatch = doc.affectedDepartmentIds.some(deptId => 
          departmentIds.includes(deptId)
        );

        if (primaryDepartmentMatch || affectedDepartmentsMatch) {
          const primaryDepartmentName = categoryMap.get(doc.categoryId) || 'Unknown';
          const affectedDepartmentNames = doc.affectedDepartmentIds.map(id => 
            categoryMap.get(id) || 'Unknown'
          ).filter(name => name !== 'Unknown');

          // Create alert for high-priority cross-department documents
          results.push({
            id: `doc-alert-${doc.id}`,
            type: 'alert',
            title: `High Priority: ${doc.title}`,
            description: `High priority document requires attention from multiple departments`,
            primaryDepartment: primaryDepartmentName,
            affectedDepartments: affectedDepartmentNames,
            priority: 'high',
            timestamp: doc.uploadedAt,
            tags: ['alert', 'high-priority', 'cross-department', ...(doc.crossDepartmentTags || [])]
          });
        }
      }
    });

    // Sort by priority and timestamp
    results.sort((a, b) => {
      // Sort by priority first (high > medium > low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                          priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by timestamp (most recent first)
      const aTime = new Date(a.lastUpdated || a.timestamp || 0).getTime();
      const bTime = new Date(b.lastUpdated || b.timestamp || 0).getTime();
      return bTime - aTime;
    });

    return results;

  } catch (error) {
    console.error('Error getting cross-department compliance with alerts:', error);
    throw error;
  }
}