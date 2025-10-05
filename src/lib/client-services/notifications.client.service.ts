'use client';
import { db } from '@/lib/firebase/client-init';
import { Notification } from '@/lib/types';
import { collection, query, where, onSnapshot, orderBy, writeBatch, getDocs, limit } from 'firebase/firestore';

function processNotification(doc: any): Notification {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
    } as Notification;
}

export function listenToUnreadNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {

    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50) // Limit to a reasonable number to avoid performance issues
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notifications = querySnapshot.docs.map(processNotification);
        callback(notifications);
    }, (error) => {
        console.error(`Error listening to notifications for user ${userId}:`, error);
    });

    return unsubscribe;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
    const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('isRead', '==', false)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return;
        }

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });

        await batch.commit();

    } catch (error) {
        console.error(`Error marking notifications as read for user ${userId}:`, error);
        throw new Error('Could not update notifications.');
    }
}
