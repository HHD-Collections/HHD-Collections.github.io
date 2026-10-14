import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAXDdrMYSowHRScbZMfUADKNG4OBTCJYSY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hhd-collections.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hhd-collections",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hhd-collections.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "392638208744",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:392638208744:web:bd0975276877fd4db6075d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2FRHJDKJB6"
};

// Check if Firebase has a valid API key configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_firebase_api_key_here" &&
  firebaseConfig.projectId
);

export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth: Auth = getAuth(app);
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });
  } catch (_) {
    return getFirestore(app);
  }
})();
export const storage: FirebaseStorage = getStorage(app);

export const analyticsPromise: Promise<Analytics | null> = isSupported().then(
  (supported) => (supported && typeof window !== "undefined" ? getAnalytics(app) : null)
).catch(() => null);
