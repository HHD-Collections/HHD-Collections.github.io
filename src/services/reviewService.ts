import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { ProductReview } from '../types';
import { getProductById, updateProduct } from './productService';

const REVIEWS_COLLECTION = 'reviews';
const LOCAL_REVIEWS_KEY = 'hhd_reviews_cache';

function getLocalReviews(): ProductReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveLocalReviews(reviews: ProductReview[]): void {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (_) {}
}

/**
 * Add a verified customer review to Cloud Firestore and update product aggregate rating
 */
export async function addProductReview(
  data: Omit<ProductReview, 'id' | 'createdAt'>
): Promise<ProductReview> {
  const newId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const now = Date.now();

  const newReview: ProductReview = {
    ...data,
    id: newId,
    createdAt: now,
    verified: true,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, REVIEWS_COLLECTION, newId);
      await setDoc(docRef, newReview);

      // Recalculate and update product rating in Firestore
      const reviews = await getProductReviews(data.productId);
      const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0) + data.rating;
      const count = reviews.length + 1;
      const avgRating = Number((totalRatings / count).toFixed(1));

      await updateProduct(data.productId, {
        rating: avgRating,
        reviewCount: count,
      });
    } catch (e) {
      console.warn('Failed to write review to Firestore, saved locally:', e);
    }
  }

  const existing = getLocalReviews();
  saveLocalReviews([newReview, ...existing]);

  return newReview;
}

/**
 * Fetch reviews for a specific product
 */
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, REVIEWS_COLLECTION);
      const q = query(
        colRef,
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        return snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ProductReview[];
      }
    } catch (e) {
      console.warn('Firestore reviews fetch failed, returning local cached reviews:', e);
    }
  }

  return getLocalReviews().filter((r) => r.productId === productId);
}
