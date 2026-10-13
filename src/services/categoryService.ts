import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import { generateSlug } from '../utils/formatters';

const CATEGORIES_COLLECTION = 'categories';
const LOCAL_STORAGE_KEY = 'hhd_categories_cache';

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read categories from cache', e);
  }
  return INITIAL_CATEGORIES;
}

function saveLocalCategories(cats: Category[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
  } catch (e) {
    console.warn('Could not save categories to cache', e);
  }
}

export async function getCategories(): Promise<Category[]> {
  let categories: Category[] = [];

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
      if (!snap.empty) {
        categories = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Category[];
      }
    } catch (e) {
      console.warn('Firestore categories fetch error, using local dataset', e);
    }
  }

  if (categories.length === 0) {
    categories = getLocalCategories();
  }

  // Sort by order ascending
  return categories.sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const all = await getCategories();
  return all.find((c) => c.slug === slug) || null;
}

export async function createCategory(
  data: Omit<Category, 'id'>
): Promise<Category> {
  const newId = `cat-${Date.now()}`;
  const slug = data.slug || generateSlug(data.name);
  const newCat: Category = { ...data, id: newId, slug };

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, CATEGORIES_COLLECTION, newId), newCat);
    } catch (e) {
      console.warn('Failed to write category to Firestore, saved locally:', e);
    }
  }

  const local = getLocalCategories();
  saveLocalCategories([...local, newCat]);
  return newCat;
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  const all = await getCategories();
  const existing = all.find((c) => c.id === id);
  if (!existing) throw new Error(`Category ${id} not found`);

  const updated: Category = { ...existing, ...updates };

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, CATEGORIES_COLLECTION, id), updates);
    } catch (e) {
      console.warn('Failed to update category in Firestore:', e);
    }
  }

  const local = getLocalCategories();
  saveLocalCategories(local.map((c) => (c.id === id ? updated : c)));
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
    } catch (e) {
      console.warn('Failed to delete category in Firestore:', e);
    }
  }

  const local = getLocalCategories();
  saveLocalCategories(local.filter((c) => c.id !== id));
}

export async function seedCategoriesToFirestore(): Promise<{ count: number }> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  const batch = writeBatch(db);
  for (const cat of INITIAL_CATEGORIES) {
    batch.set(doc(db, CATEGORIES_COLLECTION, cat.id), cat);
  }
  await batch.commit();
  saveLocalCategories(INITIAL_CATEGORIES);
  return { count: INITIAL_CATEGORIES.length };
}
