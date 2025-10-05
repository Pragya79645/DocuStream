'use server';
import { getDb, getStorage } from '@/lib/firebase/server-init';
import { Document } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const DOCUMENTS_COLLECTION = 'documents';

// Function to get all documents for the admin view
export async function getAllDocuments(): Promise<Document[]> {
  const db = getDb();
  try {
    const snapshot = await db.collection(DOCUMENTS_COLLECTION).orderBy('uploadedAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            uploadedAt: (data.uploadedAt as Timestamp).toDate().toISOString(),
            // Provide default values for new fields to ensure backward compatibility
            targetingType: data.targetingType || 'department',
        } as Document
    });
  } catch (error) {
    console.error('Error getting all documents:', error);
    throw new Error('Could not fetch documents.');
  }
}

// Function to get documents for a specific user based on their categories AND their uploads
export async function getDocumentsForUser(userId: string): Promise<Document[]> {
    const db = getDb();
    try {
        // First, get the user's categories
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.warn(`User with ID ${userId} not found.`);
            return [];
        }
        const userData = userDoc.data();
        const categoryIds = userData?.categoryIds || [];

        const docMap = new Map<string, Document>();

        // Get documents from user's categories
        if (categoryIds.length > 0) {
            const categorySnapshot = await db.collection(DOCUMENTS_COLLECTION)
                .where('categoryId', 'in', categoryIds)
                .orderBy('uploadedAt', 'desc')
                .get();

            categorySnapshot.docs.forEach(doc => {
                const data = doc.data();
                const document = {
                    id: doc.id,
                    ...data,
                    uploadedAt: (data.uploadedAt as Timestamp).toDate().toISOString(),
                    // Provide default values for new fields to ensure backward compatibility
                    targetingType: data.targetingType || 'department',
                } as Document;
                docMap.set(doc.id, document);
            });
        }

        // Get documents uploaded by this user
        const uploaderSnapshot = await db.collection(DOCUMENTS_COLLECTION)
            .where('uploaderId', '==', userId)
            .orderBy('uploadedAt', 'desc')
            .get();

        uploaderSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const document = {
                id: doc.id,
                ...data,
                uploadedAt: (data.uploadedAt as Timestamp).toDate().toISOString(),
                // Provide default values for new fields to ensure backward compatibility
                targetingType: data.targetingType || 'department',
            } as Document;
            docMap.set(doc.id, document); // This will overwrite duplicates, which is fine
        });

        // Convert back to array and sort by uploadedAt
        const mergedDocs = Array.from(docMap.values()).sort((a, b) => {
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });

        return mergedDocs;
    } catch (error) {
        console.error(`Error getting documents for user ${userId}:`, error);
        throw new Error('Could not fetch documents for user.');
    }
}


export async function createDocument(docData: Omit<Document, 'id' | 'uploadedAt'>): Promise<string> {
    const db = getDb();
    try {
        const docRef = await db.collection(DOCUMENTS_COLLECTION).add({
            ...docData,
            uploadedAt: FieldValue.serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating document:', error);
        throw new Error('Could not create document.');
    }
}

export async function getDocumentById(docId: string): Promise<Document | null> {
    const db = getDb();
    try {
        const docSnap = await db.collection(DOCUMENTS_COLLECTION).doc(docId).get();
        if (!docSnap.exists) {
            return null;
        }
        const data = docSnap.data()!;
        return {
            id: docSnap.id,
            ...data,
            uploadedAt: (data.uploadedAt as Timestamp).toDate().toISOString(),
            // Provide default values for new fields to ensure backward compatibility
            targetingType: data.targetingType || 'department',
        } as Document;
    } catch (error) {
        console.error(`Error getting document ${docId}:`, error);
        throw new Error('Could not fetch document.');
    }
}

export async function updateDocument(docId: string, updates: Partial<Document>): Promise<void> {
    const db = getDb();
    try {
        // Filter out undefined values to avoid Firestore issues
        const filteredUpdates: { [key: string]: any } = {};
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                filteredUpdates[key] = value;
            }
        });

        // Only update if there are actual changes
        if (Object.keys(filteredUpdates).length > 0) {
            await db.collection(DOCUMENTS_COLLECTION).doc(docId).update(filteredUpdates);
        }
    } catch (error) {
        console.error(`Error updating document ${docId}:`, error);
        console.error('Update data:', updates);
        throw new Error(`Could not update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteDocument(docId: string): Promise<void> {
    const db = getDb();
    try {
        const docRef = db.collection(DOCUMENTS_COLLECTION).doc(docId);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            throw new Error("Document not found.");
        }
        // Potentially delete associated file from Cloudinary here if needed
        // This requires storing the public_id from cloudinary response
        await docRef.delete();

    } catch (error) {
        console.error(`Error deleting document ${docId}:`, error);
        throw new Error('Could not delete document.');
    }
}
