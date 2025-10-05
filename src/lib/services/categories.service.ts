'use server';
import { getDb } from '@/lib/firebase/server-init';
import type { Category } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

const CATEGORIES_COLLECTION = 'categories';

export async function getCategories(): Promise<Category[]> {
  const db = getDb();
  try {
    const snapshot = await db.collection(CATEGORIES_COLLECTION).orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Category));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw new Error('Could not fetch categories.');
  }
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<string> {
    const db = getDb();
    try {
        // Check for uniqueness of ID
        const existing = await db.collection(CATEGORIES_COLLECTION).doc(category.id).get();
        if (existing.exists) {
            throw new Error(`Category with ID "${category.id}" already exists.`);
        }
        await db.collection(CATEGORIES_COLLECTION).doc(category.id).set(category);
        return category.id;
    } catch (error) {
        console.error('Error creating category:', error);
        throw new Error((error as Error).message || 'Could not create category.');
    }
}

export async function deleteCategory(categoryId: string): Promise<void> {
    const db = getDb();
    try {
        // Here you might want to add logic to handle what happens to documents
        // in this category. For now, we'll just delete the category.
        await db.collection(CATEGORIES_COLLECTION).doc(categoryId).delete();
        
        // Bonus: Remove this categoryId from all users that have it
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('categoryIds', 'array-contains', categoryId).get();
        
        if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    categoryIds: FieldValue.arrayRemove(categoryId)
                });
            });
            await batch.commit();
        }

    } catch (error) {
        console.error(`Error deleting category ${categoryId}:`, error);
        throw new Error('Could not delete category.');
    }
}
