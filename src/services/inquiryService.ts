import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { ContactInquiry, InquiryStatus, NewsletterSubscriber } from '../types';
import { logActivity } from './activityLogService';

const INQUIRIES_COLLECTION = 'inquiries';
const NEWSLETTER_COLLECTION = 'newsletter_subscribers';
const LOCAL_INQUIRIES_KEY = 'hhd_inquiries_cache';

function getLocalInquiries(): ContactInquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveLocalInquiries(items: ContactInquiry[]): void {
  try {
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(items));
  } catch (_) {}
}

/**
 * Submit a new customer contact inquiry to Firestore
 */
export async function createInquiry(
  data: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>
): Promise<ContactInquiry> {
  const newId = `inq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const now = Date.now();

  const newInquiry: ContactInquiry = {
    ...data,
    id: newId,
    status: 'unread',
    createdAt: now,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, INQUIRIES_COLLECTION, newId);
      await setDoc(docRef, newInquiry);
    } catch (e) {
      console.warn('Failed to save inquiry to Firestore, saving locally:', e);
    }
  }

  const existing = getLocalInquiries();
  saveLocalInquiries([newInquiry, ...existing]);

  return newInquiry;
}

/**
 * Retrieve all customer inquiries for store administrators
 */
export async function getInquiries(): Promise<ContactInquiry[]> {
  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, INQUIRIES_COLLECTION);
      const q = query(colRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const inquiries = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ContactInquiry[];
        saveLocalInquiries(inquiries);
        return inquiries;
      }
    } catch (e) {
      console.warn('Firestore inquiries fetch failed, falling back to local cache:', e);
    }
  }

  return getLocalInquiries();
}

/**
 * Update the status of a customer inquiry (unread, read, replied, archived)
 */
export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, INQUIRIES_COLLECTION, id);
      const updates: any = { status };
      if (status === 'replied') {
        updates.repliedAt = Date.now();
      }
      await updateDoc(docRef, updates);
    } catch (e) {
      console.warn('Failed to update inquiry in Firestore:', e);
    }
  }

  const list = getLocalInquiries();
  saveLocalInquiries(
    list.map((inq) =>
      inq.id === id
        ? { ...inq, status, ...(status === 'replied' ? { repliedAt: Date.now() } : {}) }
        : inq
    )
  );

  logActivity({
    action: `Updated inquiry ${id} status to ${status}`,
    entityType: 'inquiry',
    entityId: id,
    details: `Customer inquiry status set to ${status}`,
  }).catch(() => {});
}

/**
 * Delete an inquiry
 */
export async function deleteInquiry(id: string): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, INQUIRIES_COLLECTION, id));
    } catch (e) {
      console.warn('Failed to delete inquiry from Firestore:', e);
    }
  }

  const list = getLocalInquiries();
  saveLocalInquiries(list.filter((inq) => inq.id !== id));
}

/**
 * Subscribe customer email to the newsletter in Firestore
 */
export async function subscribeNewsletter(email: string): Promise<NewsletterSubscriber> {
  const cleanEmail = email.trim().toLowerCase();
  const docId = `sub-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const now = Date.now();

  const subscriber: NewsletterSubscriber = {
    id: docId,
    email: cleanEmail,
    subscribedAt: now,
    active: true,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, NEWSLETTER_COLLECTION, docId);
      await setDoc(docRef, subscriber, { merge: true });
    } catch (e) {
      console.warn('Failed to save newsletter subscriber to Firestore:', e);
    }
  }

  return subscriber;
}

/**
 * Fetch all newsletter subscribers for marketing or export
 */
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, NEWSLETTER_COLLECTION);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as NewsletterSubscriber[];
      }
    } catch (e) {
      console.warn('Failed to fetch subscribers from Firestore:', e);
    }
  }
  return [];
}
