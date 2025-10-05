'use client';
import { db } from '@/lib/firebase/client-init';
import { Document, ActionPoint } from '@/lib/types';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';

function processDoc(doc: any): Document {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt?.toDate().toISOString(),
    } as Document;
}


export function listenToDocumentsForUser(userId: string, categoryIds: string[], callback: (docs: Document[]) => void): () => void {
    // If user has no categories and we're not including their uploads, return empty
    if (categoryIds.length === 0) {
        // Still listen for documents uploaded by this user
        const q = query(
            collection(db, 'documents'),
            where('uploaderId', '==', userId),
            orderBy('uploadedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const docs = querySnapshot.docs.map(processDoc);
            callback(docs);
        }, (error) => {
            console.error(`Error listening to documents for user ${userId}:`, error);
        });

        return unsubscribe;
    }

    // Create two separate queries and merge results
    const categoryQuery = query(
        collection(db, 'documents'),
        where('categoryId', 'in', categoryIds),
        orderBy('uploadedAt', 'desc')
    );

    const uploaderQuery = query(
        collection(db, 'documents'),
        where('uploaderId', '==', userId),
        orderBy('uploadedAt', 'desc')
    );

    let categoryDocs: Document[] = [];
    let uploaderDocs: Document[] = [];
    let unsubscribeCount = 0;

    const mergeAndCallback = () => {
        // Merge and deduplicate documents
        const docMap = new Map<string, Document>();
        
        // Add category docs
        categoryDocs.forEach(doc => docMap.set(doc.id, doc));
        
        // Add uploader docs (will overwrite duplicates, which is fine)
        uploaderDocs.forEach(doc => docMap.set(doc.id, doc));
        
        // Convert back to array and sort by uploadedAt
        const mergedDocs = Array.from(docMap.values()).sort((a, b) => {
            return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        });
        
        callback(mergedDocs);
    };

    const unsubscribeCategory = onSnapshot(categoryQuery, (querySnapshot) => {
        categoryDocs = querySnapshot.docs.map(processDoc);
        mergeAndCallback();
    }, (error) => {
        console.error(`Error listening to category documents for user ${userId}:`, error);
    });

    const unsubscribeUploader = onSnapshot(uploaderQuery, (querySnapshot) => {
        uploaderDocs = querySnapshot.docs.map(processDoc);
        mergeAndCallback();
    }, (error) => {
        console.error(`Error listening to uploader documents for user ${userId}:`, error);
    });

    // Return a combined unsubscribe function
    return () => {
        unsubscribeCategory();
        unsubscribeUploader();
    };
}

export function listenToAllDocuments(callback: (docs: Document[]) => void): () => void {
    const q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = querySnapshot.docs.map(processDoc);
        callback(docs);
    }, (error) => {
        console.error("Error listening to all documents:", error);
    });

    return unsubscribe;
}

export function listenToDocument(docId: string, callback: (doc: Document | null) => void): () => void {
    const docRef = doc(db, 'documents', docId);

    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            callback(processDoc(docSnapshot));
        } else {
            callback(null);
        }
    }, (error) => {
        console.error(`Error listening to document ${docId}:`, error);
    });

    return unsubscribe;
}


export async function updateActionPoints(docId: string, actionPoints: ActionPoint[]): Promise<void> {
  const docRef = doc(db, 'documents', docId);
  try {
    await updateDoc(docRef, { actionPoints });
  } catch (error) {
    console.error(`Error updating action points for doc ${docId}:`, error);
    throw new Error('Could not update action points.');
  }
}
