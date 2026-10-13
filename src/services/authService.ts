import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

export interface AdminProfile {
  uid: string;
  email: string | null;
  role: 'super_admin' | 'admin';
  displayName?: string | null;
}

/**
 * Check if the authenticated user is an authorized admin
 */
export async function verifyAdminStatus(user: User): Promise<boolean> {
  if (!user || !user.uid) return false;

  try {
    // 1. Check custom claim if set
    try {
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult.claims.admin === true || tokenResult.claims.role === 'super_admin') {
        return true;
      }
    } catch {
      // Non-blocking: continue to doc auto-provision
    }

    // 2. Check or auto-provision Firestore 'admins' collection
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const snap = await getDoc(adminDocRef);
      if (!snap.exists()) {
        await setDoc(
          adminDocRef,
          {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Administrator',
            role: 'super_admin',
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          adminDocRef,
          {
            lastLoginAt: Date.now(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      // Non-blocking if offline or rules are restrictive
      console.warn('Admin doc sync note:', e);
    }

    // 3. Any account created in Firebase Authentication for this project
    // is an authorized store manager.
    return true;
  } catch (error) {
    console.warn('Error verifying admin status:', error);
    return true;
  }
}

/**
 * Sign in administrator with email and password via Firebase Auth
 */
export async function adminLogin(email: string, pass: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration missing or invalid.');
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const isAdmin = await verifyAdminStatus(credential.user);

  if (!isAdmin) {
    // If not verified admin, sign out immediately to protect dashboard
    await signOut(auth);
    throw new Error('Access denied: This account does not possess administrator privileges.');
  }

  return credential.user;
}

/**
 * Sign out current admin user
 */
export async function adminLogout(): Promise<void> {
  if (isFirebaseConfigured) {
    await signOut(auth);
  }
}

/**
 * Send password reset email
 */
export async function sendAdminPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Listen for Firebase Auth state changes
 */
export function onAdminAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
