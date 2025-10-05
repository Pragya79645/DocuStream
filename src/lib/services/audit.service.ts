'use server';
import { getDb } from '@/lib/firebase/server-init';
import type { AuditLogEntry } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

const AUDIT_COLLECTION = 'auditLog';

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  const db = getDb();
  try {
    const snapshot = await db.collection(AUDIT_COLLECTION).orderBy('timestamp', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AuditLogEntry));
  } catch (error) {
    console.error('Error getting audit log:', error);
    throw new Error('Could not fetch audit log.');
  }
}

export async function addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const db = getDb();
    try {
        const docRef = await db.collection(AUDIT_COLLECTION).add({
            ...entry,
            timestamp: FieldValue.serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding audit log entry:', error);
        throw new Error('Could not add audit log entry.');
    }
}
