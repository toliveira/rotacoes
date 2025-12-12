import { initializeApp, applicationDefault, cert, type App } from 'firebase-admin/app';
import { getFirestore as getDb } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK
let firebaseApp: App | null = null;

export function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (process.env.FIREBASE_CREDENTIALS) {
    try {
      const raw = String(process.env.FIREBASE_CREDENTIALS);
      const credsPath = path.resolve(process.cwd(), raw);
      console.log('Resolved Firebase credentials path:', credsPath);
      const file = fs.readFileSync(credsPath, 'utf8');
      const parsed = JSON.parse(file);
      firebaseApp = initializeApp({
        credential: cert(parsed),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error('Failed to initialize Firebase with credentials:', error);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      firebaseApp = initializeApp({
        credential: applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error('Failed to initialize Firebase with application default credentials:', error);
    }
  } else {
    console.warn("Firebase Admin SDK not initialized: Missing FIREBASE_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS in environment variables.");
  }

  return firebaseApp;
}

export function getFirebaseApp() {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
}

export function getFirestore() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  return getDb(app);
}

export function getAuth() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase app not initialized');
  }
  return getAdminAuth(app);
}
