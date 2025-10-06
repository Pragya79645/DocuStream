'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments } from '@/lib/services/documents.service';
import { getCategories } from '@/lib/services/categories.service';

export async function GET(request: NextRequest) {
  try {
    const [allDocuments, categories] = await Promise.all([
      getAllDocuments(),
      getCategories()
    ]);

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    // Transform documents for the feed display
    const feedDocuments = allDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      originalFilename: doc.originalFilename,
      department: categoryMap.get(doc.categoryId) || 'Unknown Department',
      departmentId: doc.categoryId,
      uploadedAt: doc.uploadedAt,
      uploaderId: doc.uploaderId,
      fileType: doc.fileType,
      priority: doc.priority || 'medium',
      summary: doc.summary,
      href: `/dashboard/document?doc=${doc.id}`,
      affectedDepartments: doc.affectedDepartmentIds?.map(id => categoryMap.get(id) || 'Unknown') || [],
      crossDepartmentTags: doc.crossDepartmentTags || [],
      isComplianceRelated: doc.isComplianceRelated || false,
      complianceDeadline: doc.complianceDeadline,
      status: doc.status
    }));

    // Sort by upload date (most recent first)
    feedDocuments.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json(feedDocuments);
  } catch (error) {
    console.error('Error fetching all documents feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents feed' },
      { status: 500 }
    );
  }
}