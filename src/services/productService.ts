import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { generateSlug } from '../utils/formatters';

const PRODUCTS_COLLECTION = 'products';
const LOCAL_STORAGE_KEY = 'hhd_products_cache';

// Local cache helper
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read from local storage cache', e);
  }
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Could not write to local storage cache', e);
  }
}

export interface GetProductsOptions {
  categorySlug?: string;
  activeOnly?: boolean;
  featuredOnly?: boolean;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  limitCount?: number;
}

/**
 * Fetch products from Firestore with fallback to cached/initial products
 */
export async function getProducts(options: GetProductsOptions = {}): Promise<Product[]> {
  const {
    categorySlug,
    activeOnly = false,
    featuredOnly = false,
    searchQuery,
    minPrice,
    maxPrice,
    sortBy = 'newest',
    limitCount,
  } = options;

  let products: Product[] = [];

  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      const constraints: any[] = [];

      if (activeOnly) {
        constraints.push(where('active', '==', true));
      }
      if (categorySlug && categorySlug !== 'all') {
        constraints.push(where('categorySlug', '==', categorySlug));
      }
      if (featuredOnly) {
        constraints.push(where('featured', '==', true));
      }
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(colRef, ...constraints);
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        products = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];
      }
    } catch (error) {
      console.warn('Firestore fetch failed, falling back to local dataset:', error);
    }
  }

  // If Firestore returned no documents or failed, use local dataset
  if (products.length === 0) {
    products = getLocalProducts();

    if (activeOnly) {
      products = products.filter((p) => p.active);
    }
    if (categorySlug && categorySlug !== 'all') {
      products = products.filter((p) => p.categorySlug === categorySlug);
    }
    if (featuredOnly) {
      products = products.filter((p) => p.featured);
    }
  }

  // In-memory filters for search and price range
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (minPrice !== undefined) {
    products = products.filter((p) => (p.salePrice ?? p.regularPrice) >= minPrice);
  }
  if (maxPrice !== undefined) {
    products = products.filter((p) => (p.salePrice ?? p.regularPrice) <= maxPrice);
  }

  // Sorting
  products.sort((a, b) => {
    const priceA = a.salePrice ?? a.regularPrice;
    const priceB = b.salePrice ?? b.regularPrice;

    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'newest':
      default:
        return Number(b.createdAt) - Number(a.createdAt);
    }
  });

  if (limitCount && products.length > limitCount) {
    products = products.slice(0, limitCount);
  }

  return products;
}

/**
 * Fetch a single product by its slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(colRef, where('slug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return { id: snap.docs[0].id, ...snap.docs[0].data() } as Product;
      }
    } catch (e) {
      console.warn('Error fetching product by slug from Firestore:', e);
    }
  }

  // Local lookup
  const localList = getLocalProducts();
  return localList.find((p) => p.slug === slug) || null;
}

/**
 * Fetch product by its ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Product;
      }
    } catch (e) {
      console.warn('Error fetching product by id from Firestore:', e);
    }
  }

  const localList = getLocalProducts();
  return localList.find((p) => p.id === id) || null;
}

/**
 * Create a new product in Firestore (and sync to local cache)
 */
export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const newId = `prod-${Date.now()}`;
  const now = Date.now();
  const slug = productData.slug || generateSlug(productData.name);

  const newProduct: Product = {
    ...productData,
    id: newId,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, newId);
      await setDoc(docRef, newProduct);
    } catch (e) {
      console.warn('Failed to write product to Firestore, saving locally:', e);
    }
  }

  // Update local cache
  const localList = getLocalProducts();
  const updatedList = [newProduct, ...localList];
  saveLocalProducts(updatedList);

  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const now = Date.now();
  const existing = await getProductById(id);
  if (!existing) {
    throw new Error(`Product with ID ${id} not found`);
  }

  const updatedProduct: Product = {
    ...existing,
    ...updates,
    updatedAt: now,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, { ...updates, updatedAt: now });
    } catch (e) {
      console.warn('Failed to update product in Firestore, updating locally:', e);
    }
  }

  // Update local cache
  const localList = getLocalProducts();
  const updatedList = localList.map((p) => (p.id === id ? updatedProduct : p));
  saveLocalProducts(updatedList);

  return updatedProduct;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Failed to delete product in Firestore:', e);
    }
  }

  const localList = getLocalProducts();
  saveLocalProducts(localList.filter((p) => p.id !== id));
}

/**
 * Duplicate an existing product
 */
export async function duplicateProduct(id: string): Promise<Product> {
  const original = await getProductById(id);
  if (!original) throw new Error(`Product ${id} not found`);

  const duplicateName = `${original.name} (Copy)`;
  const duplicateSlug = generateSlug(duplicateName) + `-${Date.now().toString().slice(-4)}`;

  const { id: _, createdAt: __, updatedAt: ___, ...data } = original;

  return createProduct({
    ...data,
    name: duplicateName,
    slug: duplicateSlug,
    sku: `${original.sku}-COPY`,
  });
}

/**
 * Seed all 14 initial products to Firestore
 */
export async function seedCatalogToFirestore(): Promise<{ count: number }> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please check your Firebase API key in .env.local');
  }

  const batch = writeBatch(db);
  for (const product of INITIAL_PRODUCTS) {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    batch.set(docRef, product);
  }

  await batch.commit();
  saveLocalProducts(INITIAL_PRODUCTS);
  return { count: INITIAL_PRODUCTS.length };
}
