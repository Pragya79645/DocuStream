'use server';

import { initializeFirebaseAdmin } from '@/lib/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';
import { ComplianceDocument, ComplianceStatus } from '@/lib/types';

// Initialize Firebase Admin and get Firestore instance
const getDb = () => {
  const app = initializeFirebaseAdmin();
  if (!app) {
    throw new Error('Failed to initialize Firebase Admin');
  }
  return getFirestore(app);
};

const COMPLIANCE_COLLECTION = 'compliance_documents';

export async function createComplianceDocument(
  complianceDoc: Omit<ComplianceDocument, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    const docRef = await db.collection(COMPLIANCE_COLLECTION).add({
      ...complianceDoc,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating compliance document:', error);
    throw new Error('Failed to create compliance document');
  }
}

export async function getComplianceDocuments(): Promise<ComplianceDocument[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection(COMPLIANCE_COLLECTION).get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as ComplianceDocument[];
  } catch (error) {
    console.error('Error fetching compliance documents:', error);
    throw new Error('Failed to fetch compliance documents');
  }
}

export async function getComplianceDocumentById(id: string): Promise<ComplianceDocument | null> {
  try {
    const db = getDb();
    const doc = await db.collection(COMPLIANCE_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as ComplianceDocument;
  } catch (error) {
    console.error('Error fetching compliance document:', error);
    throw new Error('Failed to fetch compliance document');
  }
}

export async function updateComplianceDocument(
  id: string,
  updates: Partial<Omit<ComplianceDocument, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    await db.collection(COMPLIANCE_COLLECTION).doc(id).update({
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error updating compliance document:', error);
    throw new Error('Failed to update compliance document');
  }
}

export async function deleteComplianceDocument(id: string): Promise<void> {
  try {
    const db = getDb();
    await db.collection(COMPLIANCE_COLLECTION).doc(id).delete();
  } catch (error) {
    console.error('Error deleting compliance document:', error);
    throw new Error('Failed to delete compliance document');
  }
}

export async function getComplianceDocumentsByCategory(categoryId: string): Promise<ComplianceDocument[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COMPLIANCE_COLLECTION)
      .where('categoryId', '==', categoryId)
      .get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as ComplianceDocument[];
  } catch (error) {
    console.error('Error fetching compliance documents by category:', error);
    throw new Error('Failed to fetch compliance documents by category');
  }
}

export async function getComplianceDocumentsByUser(userId: string): Promise<ComplianceDocument[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COMPLIANCE_COLLECTION)
      .where('assignedToIds', 'array-contains', userId)
      .get();
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as ComplianceDocument[];
  } catch (error) {
    console.error('Error fetching compliance documents by user:', error);
    throw new Error('Failed to fetch compliance documents by user');
  }
}

export async function calculateComplianceStatus(dueDate: string, reminderDays: number): Promise<ComplianceStatus> {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'overdue';
  } else if (diffDays <= reminderDays) {
    return 'due-soon';
  } else {
    return 'on-track';
  }
}

export async function updateComplianceStatuses(): Promise<void> {
  try {
    const complianceDocuments = await getComplianceDocuments();
    
    for (const doc of complianceDocuments) {
      if (doc.status !== 'completed') {
        const newStatus = await calculateComplianceStatus(doc.dueDate, doc.reminderDays);
        if (newStatus !== doc.status) {
          await updateComplianceDocument(doc.id, { status: newStatus });
        }
      }
    }
  } catch (error) {
    console.error('Error updating compliance statuses:', error);
    throw new Error('Failed to update compliance statuses');
  }
}

export async function markComplianceAsCompleted(id: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    await updateComplianceDocument(id, {
      status: 'completed',
      completedAt: now,
    });
  } catch (error) {
    console.error('Error marking compliance as completed:', error);
    throw new Error('Failed to mark compliance as completed');
  }
}

export async function getPendingComplianceActions(): Promise<ComplianceDocument[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection(COMPLIANCE_COLLECTION)
      .where('status', 'in', ['on-track', 'due-soon', 'overdue'])
      .orderBy('dueDate', 'asc')
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as ComplianceDocument[];
  } catch (error) {
    console.error('Error fetching pending compliance actions:', error);
    throw new Error('Failed to fetch pending compliance actions');
  }
}

export async function getComplianceDocumentsForDepartments(departmentIds: string[]): Promise<ComplianceDocument[]> {
  try {
    const db = getDb();
    
    // Get compliance documents where primary category or affected departments match
    const primaryQuery = db
      .collection(COMPLIANCE_COLLECTION)
      .where('categoryId', 'in', departmentIds);
      
    const affectedQuery = db
      .collection(COMPLIANCE_COLLECTION)
      .where('affectedDepartmentIds', 'array-contains-any', departmentIds);
    
    const [primarySnapshot, affectedSnapshot] = await Promise.all([
      primaryQuery.get(),
      affectedQuery.get()
    ]);
    
    // Combine and deduplicate results
    const allDocs = new Map<string, ComplianceDocument>();
    
    primarySnapshot.docs.forEach((doc: any) => {
      allDocs.set(doc.id, { id: doc.id, ...doc.data() } as ComplianceDocument);
    });
    
    affectedSnapshot.docs.forEach((doc: any) => {
      allDocs.set(doc.id, { id: doc.id, ...doc.data() } as ComplianceDocument);
    });
    
    return Array.from(allDocs.values()).sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  } catch (error) {
    console.error('Error fetching cross-department compliance documents:', error);
    throw new Error('Failed to fetch cross-department compliance documents');
  }
}

export async function getSharedAwarenessItems(departmentIds: string[]): Promise<any[]> {
  try {
    const { getAllDocuments } = await import('@/lib/services/documents.service');
    
    // Get all documents and compliance documents for the departments
    const [allDocuments, complianceDocuments] = await Promise.all([
      getAllDocuments(),
      getComplianceDocumentsForDepartments(departmentIds)
    ]);
    
    const sharedItems: any[] = [];
    
    // Create a map of document IDs to their compliance records
    const documentComplianceMap = new Map<string, ComplianceDocument>();
    complianceDocuments.forEach(comp => {
      if (comp.documentId) {
        documentComplianceMap.set(comp.documentId, comp);
      }
    });
    
    // Add documents that affect multiple departments
    allDocuments
      .filter(doc => doc.affectedDepartmentIds && doc.affectedDepartmentIds.length > 0)
      .forEach(doc => {
        const hasRelevantDepartments = doc.affectedDepartmentIds!.some(deptId => departmentIds.includes(deptId)) ||
                                     departmentIds.includes(doc.categoryId);
        
        if (hasRelevantDepartments) {
          // Check if this document has an associated compliance record
          const associatedCompliance = documentComplianceMap.get(doc.id);
          
          sharedItems.push({
            id: doc.id,
            type: 'document',
            title: doc.title,
            primaryDepartment: doc.categoryId,
            affectedDepartments: doc.affectedDepartmentIds || [],
            priority: doc.priority || 'medium',
            dueDate: associatedCompliance?.dueDate || doc.complianceDeadline, // Use compliance due date if available
            lastUpdated: doc.uploadedAt,
            href: `/dashboard?doc=${doc.id}`, // Link to dashboard with document ID
            tags: doc.crossDepartmentTags || []
          });
        }
      });
    
    // Add compliance documents that affect multiple departments
    complianceDocuments
      .filter(comp => comp.affectedDepartmentIds && comp.affectedDepartmentIds.length > 0)
      .forEach(comp => {
        const hasRelevantDepartments = comp.affectedDepartmentIds!.some(deptId => departmentIds.includes(deptId)) ||
                                     departmentIds.includes(comp.categoryId);
        
        if (hasRelevantDepartments) {
          sharedItems.push({
            id: comp.id,
            type: 'compliance',
            title: comp.title,
            primaryDepartment: comp.categoryId,
            affectedDepartments: comp.affectedDepartmentIds || [],
            priority: 'high', // Compliance is always high priority
            dueDate: comp.dueDate,
            lastUpdated: comp.updatedAt,
            href: `/dashboard/compliance?comp=${comp.id}`, // Link to compliance page with ID
            tags: ['compliance', ...(comp.sharedCompliance ? ['coordination-required'] : [])]
          });
        }
      });
    
    // Sort by priority and due date
    return sharedItems.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by due date (compliance items first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });
  } catch (error) {
    console.error('Error fetching shared awareness items:', error);
    throw new Error('Failed to fetch shared awareness items');
  }
}