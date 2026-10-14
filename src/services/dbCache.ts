import { Product, Category } from '../types';

const DB_NAME = 'hhd_store_db';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_CATEGORIES = 'categories';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache all products in IndexedDB
 */
export async function cacheProductsInIDB(products: Product[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
    const store = tx.objectStore(STORE_PRODUCTS);
    
    // Clear and re-populate
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const p of products) {
      store.put(p);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB cache write failed:', err);
  }
}

/**
 * Get all cached products from IndexedDB
 */
export async function getProductsFromIDB(): Promise<Product[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_PRODUCTS, 'readonly');
    const store = tx.objectStore(STORE_PRODUCTS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IDB cache read failed:', err);
    return [];
  }
}

/**
 * Cache all categories in IndexedDB
 */
export async function cacheCategoriesInIDB(categories: Category[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIES);

    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const c of categories) {
      store.put(c);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB category cache write failed:', err);
  }
}

/**
 * Get all categories from IndexedDB
 */
export async function getCategoriesFromIDB(): Promise<Category[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_CATEGORIES, 'readonly');
    const store = tx.objectStore(STORE_CATEGORIES);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IDB category cache read failed:', err);
    return [];
  }
}
