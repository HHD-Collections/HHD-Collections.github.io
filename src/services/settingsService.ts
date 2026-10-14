import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { StoreSettings } from '../types';

export const SETTINGS_COLLECTION = 'settings';
export const SETTINGS_DOC_ID = 'store_config';
export const LOCAL_SETTINGS_KEY = 'hhd_store_settings';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'HHD Collections',
  tagline: 'Curated Luxury Essentials & Smart Innovations',
  email: 'murtuza.tech.savvy@gmail.com',
  phone: '+92 306 0824762',
  whatsapp: '+92 306 0824762',
  currency: 'PKR',
  freeShippingThreshold: 3000,
  standardShippingFee: 250,
  announcementBarText: 'Free Delivery Across Pakistan on Orders Over Rs. 3,000 | Cash on Delivery Available',
  announcementActive: true,
  codEnabled: true,
  bankDetails: {
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
  },
};

/**
 * Read settings from localStorage with fallback to default settings
 */
export function getLocalStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STORE_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Could not read store settings from localStorage', err);
  }
  return { ...DEFAULT_STORE_SETTINGS };
}

/**
 * Persist store settings to localStorage and notify listeners
 */
export function saveLocalStoreSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hhd:settings-updated', { detail: settings }));
    }
  } catch (err) {
    console.warn('Could not save store settings to localStorage', err);
  }
}

/**
 * Fetch settings from Cloud Firestore with fallback to localStorage
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const localSettings = getLocalStoreSettings();

  if (!isFirebaseConfigured) {
    return localSettings;
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    
    // Timeout guard so Firestore network issues do not freeze the app
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore fetch timeout')), 5000)
    );

    const docSnap = await Promise.race([getDoc(docRef), timeoutPromise]);

    if (docSnap && docSnap.exists()) {
      const remoteData = docSnap.data() as Partial<StoreSettings>;
      const merged: StoreSettings = {
        ...DEFAULT_STORE_SETTINGS,
        ...localSettings,
        ...remoteData,
      };
      saveLocalStoreSettings(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Firestore settings fetch error, using local fallback:', err);
  }

  return localSettings;
}

export interface SaveSettingsResult {
  success: boolean;
  firestoreSynced: boolean;
  settings: StoreSettings;
  error?: string;
}

/**
 * Save store settings both locally and to Cloud Firestore
 */
export async function saveStoreSettings(
  partial: Partial<StoreSettings>
): Promise<SaveSettingsResult> {
  const current = getLocalStoreSettings();
  const merged: StoreSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  // Immediate local persistence
  saveLocalStoreSettings(merged);

  if (!isFirebaseConfigured) {
    return {
      success: true,
      firestoreSynced: false,
      settings: merged,
    };
  }

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore network timeout while saving settings')), 8000)
    );

    await Promise.race([
      setDoc(docRef, merged, { merge: true }),
      timeoutPromise,
    ]);

    return {
      success: true,
      firestoreSynced: true,
      settings: merged,
    };
  } catch (err: any) {
    console.warn('Could not sync store settings to Cloud Firestore, local cache preserved:', err);
    return {
      success: true,
      firestoreSynced: false,
      error: err?.message || 'Cloud Firestore could not be updated',
      settings: merged,
    };
  }
}
