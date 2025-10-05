'use client';

import { ComplianceDocument } from '@/lib/types';
import { db } from '@/lib/firebase/client-init';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

const API_BASE = '/api/compliance';

function processComplianceDoc(doc: any): ComplianceDocument {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    dueDate: data.dueDate instanceof Timestamp ? data.dueDate.toDate().toISOString() : data.dueDate,
    completedAt: data.completedAt instanceof Timestamp ? data.completedAt.toDate().toISOString() : data.completedAt,
  } as ComplianceDocument;
}

export function listenToComplianceForUser(
  userId: string, 
  categoryIds: string[], 
  callback: (docs: ComplianceDocument[]) => void
): () => void {
  // If user has no categories, only listen for documents assigned to them
  if (categoryIds.length === 0) {
    const q = query(
      collection(db, 'compliance_documents'),
      where('assignedToIds', 'array-contains', userId),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(processComplianceDoc);
      callback(docs);
    }, (error) => {
      console.error(`Error listening to compliance for user ${userId}:`, error);
    });

    return unsubscribe;
  }

  // Listen for compliance documents in user's categories OR assigned to them
  // Since Firestore doesn't support OR queries, we need to create separate listeners
  const categoryQuery = query(
    collection(db, 'compliance_documents'),
    where('categoryId', 'in', categoryIds),
    orderBy('dueDate', 'asc')
  );

  const assignedQuery = query(
    collection(db, 'compliance_documents'),
    where('assignedToIds', 'array-contains', userId),
    orderBy('dueDate', 'asc')
  );

  let categoryDocs: ComplianceDocument[] = [];
  let assignedDocs: ComplianceDocument[] = [];

  const mergeAndCallback = () => {
    // Merge docs and remove duplicates
    const allDocs = [...categoryDocs, ...assignedDocs];
    const uniqueDocs = allDocs.filter((doc, index, arr) => 
      arr.findIndex(d => d.id === doc.id) === index
    );
    
    // Sort by due date
    uniqueDocs.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    callback(uniqueDocs);
  };

  const unsubscribeCategory = onSnapshot(categoryQuery, (querySnapshot) => {
    categoryDocs = querySnapshot.docs.map(processComplianceDoc);
    mergeAndCallback();
  }, (error) => {
    console.error(`Error listening to compliance for categories ${categoryIds}:`, error);
  });

  const unsubscribeAssigned = onSnapshot(assignedQuery, (querySnapshot) => {
    assignedDocs = querySnapshot.docs.map(processComplianceDoc);
    mergeAndCallback();
  }, (error) => {
    console.error(`Error listening to assigned compliance for user ${userId}:`, error);
  });

  // Return combined unsubscribe function
  return () => {
    unsubscribeCategory();
    unsubscribeAssigned();
  };
}

export function listenToAllCompliance(callback: (docs: ComplianceDocument[]) => void): () => void {
  const q = query(
    collection(db, 'compliance_documents'),
    orderBy('dueDate', 'asc')
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const docs = querySnapshot.docs.map(processComplianceDoc);
    callback(docs);
  }, (error) => {
    console.error('Error listening to all compliance documents:', error);
  });

  return unsubscribe;
}

export class ComplianceClientService {
  static async getAllCompliance(): Promise<ComplianceDocument[]> {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch compliance documents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching compliance documents:', error);
      throw error;
    }
  }

  static async getPendingCompliance(): Promise<ComplianceDocument[]> {
    try {
      const response = await fetch(`${API_BASE}?action=pending`);
      if (!response.ok) {
        throw new Error('Failed to fetch pending compliance documents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending compliance documents:', error);
      throw error;
    }
  }

  static async getComplianceByUser(userId: string): Promise<ComplianceDocument[]> {
    try {
      const response = await fetch(`${API_BASE}?action=by-user&userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user compliance documents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user compliance documents:', error);
      throw error;
    }
  }

  static async getComplianceByCategory(categoryId: string): Promise<ComplianceDocument[]> {
    try {
      const response = await fetch(`${API_BASE}?action=by-category&categoryId=${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category compliance documents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching category compliance documents:', error);
      throw error;
    }
  }

  static async createCompliance(
    complianceData: Omit<ComplianceDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ...complianceData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create compliance document');
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error creating compliance document:', error);
      throw error;
    }
  }

  static async updateCompliance(
    id: string,
    updates: Partial<ComplianceDocument>
  ): Promise<void> {
    try {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update compliance document');
      }
    } catch (error) {
      console.error('Error updating compliance document:', error);
      throw error;
    }
  }

  static async deleteCompliance(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete compliance document');
      }
    } catch (error) {
      console.error('Error deleting compliance document:', error);
      throw error;
    }
  }

  static async markComplianceCompleted(id: string): Promise<void> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark-completed',
          id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark compliance as completed');
      }
    } catch (error) {
      console.error('Error marking compliance as completed:', error);
      throw error;
    }
  }

  static async updateAllComplianceStatuses(): Promise<void> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-statuses',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update compliance statuses');
      }
    } catch (error) {
      console.error('Error updating compliance statuses:', error);
      throw error;
    }
  }
}