import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Allow overriding via environment variables for easy rebranding and multi-instance hosting
const dynamicConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || (firebaseConfig as any).firestoreDatabaseId
};

export const app = getApps().length > 0 ? getApp() : initializeApp(dynamicConfig);

let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {}, dynamicConfig.firestoreDatabaseId);
} catch {
  firestoreDb = getFirestore(app, dynamicConfig.firestoreDatabaseId);
}
export const db = firestoreDb;
export const auth = getAuth(app);

// Get a unique namespace prefix to isolate different website deployments
export const getDatabasePrefix = () => {
  if (typeof window !== 'undefined') {
    // Always use a static prefix for this applet to ensure data is shared across Dev and Shared Preview environments
    const envPrefix = import.meta.env.VITE_DB_PREFIX || 'remix_smartvault_v3';
    return envPrefix.replace(/[^a-zA-Z0-9_\-]/g, '_');
  }
  return 'remix_smartvault_v3';
};

export const DB_PREFIX = `${getDatabasePrefix()}_`;

// Normalize key to guarantee no double prefixing
export const formatNamespacedKey = (key: string): string => {
  const prefix = getDatabasePrefix();
  let cleanKey = key;
  // If the key starts with the prefix followed by '_' (or multiple times), clean it down to canonical name
  while (cleanKey.startsWith(`${prefix}_`)) {
    cleanKey = cleanKey.slice(prefix.length + 1);
  }
  return `${prefix}_${cleanKey}`;
};

// Simple sync mechanism to backup and restore database state to Firestore in real-time
export const syncKeyToFirestore = async (key: string, value: any) => {
  const namespacedKey = formatNamespacedKey(key);
  const path = `app_state/${namespacedKey}`;
  try {
    await setDoc(
      doc(db, 'app_state', namespacedKey), 
      { 
        data: JSON.stringify(value),
        updatedAt: new Date().toISOString()
      }, 
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchKeyFromFirestore = async (key: string) => {
  const namespacedKey = formatNamespacedKey(key);
  const path = `app_state/${namespacedKey}`;
  try {
    const docSnap = await getDoc(doc(db, 'app_state', namespacedKey));
    if (docSnap.exists() && docSnap.data()?.data) {
      return JSON.parse(docSnap.data().data);
    }
    // Fallback attempt for legacy unprefixed or variant key
    if (key !== namespacedKey) {
      const fallbackSnap = await getDoc(doc(db, 'app_state', key));
      if (fallbackSnap.exists() && fallbackSnap.data()?.data) {
        return JSON.parse(fallbackSnap.data().data);
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const listenToFirestoreKey = (key: string, callback: (data: any) => void) => {
  const namespacedKey = formatNamespacedKey(key);
  const path = `app_state/${namespacedKey}`;
  return onSnapshot(
    doc(db, 'app_state', namespacedKey),
    (docSnap) => {
      if (docSnap.exists() && docSnap.data()?.data) {
        try {
          callback(JSON.parse(docSnap.data().data));
        } catch (e) {
          console.warn('Failed to parse snapshot JSON for', namespacedKey, e);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
};

