'use server';
import { getDb } from '@/lib/firebase/server-init';
import type { User } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

const USERS_COLLECTION = 'users';

export async function getUsers(): Promise<User[]> {
  const db = getDb();
  try {
    const snapshot = await db.collection(USERS_COLLECTION).orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as User));
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Could not fetch users.');
  }
}

export async function getUsersInCategory(categoryId: string): Promise<User[]> {
    const db = getDb();
    try {
        const snapshot = await db.collection(USERS_COLLECTION).where('categoryIds', 'array-contains', categoryId).get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
        console.error(`Error getting users in category ${categoryId}:`, error);
        throw new Error('Could not fetch users for category.');
    }
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = getDb();
  try {
    const doc = await db.collection(USERS_COLLECTION).doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as User;
  } catch (error) {
    console.error(`Error getting user ${userId}:`, error);
    throw new Error('Could not fetch user.');
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    const db = getDb();
    try {
      const snapshot = await db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      throw new Error('Could not fetch user by email.');
    }
}


export async function createUser(userData: Omit<User, 'id'>): Promise<string> {
    const db = getDb();
    try {
        const existingUser = await getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('A user with this email already exists.');
        }
        // Firestore doesn't return the added doc, so we add and then get.
        const { id } = await db.collection(USERS_COLLECTION).add(userData);
        return id;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error((error as Error).message || 'Could not create user.');
    }
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const db = getDb();
    try {
        await db.collection(USERS_COLLECTION).doc(userId).update(updates);
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw new Error('Could not update user.');
    }
}

export async function deleteUser(userId: string): Promise<void> {
    const db = getDb();
    try {
        // You might want to add more logic here, e.g., what to do with documents
        // uploaded by this user. For now, we just delete the user document.
        await db.collection(USERS_COLLECTION).doc(userId).delete();
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw new Error('Could not delete user.');
    }
}
