import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { ActivityLog } from '../types';

const ACTIVITY_COLLECTION = 'activityLogs';
const LOCAL_ACTIVITY_KEY = 'hhd_activity_logs_cache';

function getLocalActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function saveLocalActivityLogs(logs: ActivityLog[]): void {
  try {
    localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (_) {}
}

/**
 * Log an administrative activity to Cloud Firestore
 */
export async function logActivity(
  data: Omit<ActivityLog, 'id' | 'timestamp'>
): Promise<ActivityLog> {
  const newId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const timestamp = Date.now();

  const entry: ActivityLog = {
    ...data,
    id: newId,
    timestamp,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, ACTIVITY_COLLECTION, newId);
      await setDoc(docRef, entry);
    } catch (e) {
      console.warn('Could not record activity log in Firestore:', e);
    }
  }

  const existing = getLocalActivityLogs();
  saveLocalActivityLogs([entry, ...existing]);

  return entry;
}

/**
 * Fetch latest activity logs from Cloud Firestore
 */
export async function getActivityLogs(limitCount = 20): Promise<ActivityLog[]> {
  if (isFirebaseConfigured) {
    try {
      const colRef = collection(db, ACTIVITY_COLLECTION);
      const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const logs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ActivityLog[];
        saveLocalActivityLogs(logs);
        return logs;
      }
    } catch (e) {
      console.warn('Failed to fetch activity logs from Firestore:', e);
    }
  }

  return getLocalActivityLogs().slice(0, limitCount);
}
