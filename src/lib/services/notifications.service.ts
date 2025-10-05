'use server';
import { getDb } from '@/lib/firebase/server-init';
import { Notification } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    const db = getDb();
    try {
        const docRef = await db.collection(NOTIFICATIONS_COLLECTION).add({
            ...notification,
            isRead: false,
            createdAt: FieldValue.serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new Error('Could not create notification.');
    }
}

export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'userId'>
): Promise<void> {
  const db = getDb();
  try {
    const batch = db.batch();
    const createdAt = FieldValue.serverTimestamp();

    userIds.forEach(userId => {
      const docRef = db.collection(NOTIFICATIONS_COLLECTION).doc();
      batch.set(docRef, {
        ...notification,
        userId,
        isRead: false,
        createdAt,
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw new Error('Could not create bulk notifications.');
  }
}
