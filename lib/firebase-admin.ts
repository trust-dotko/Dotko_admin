import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

/**
 * Initialize Firebase Admin SDK (server-side only)
 * This should only be used in API routes or server components
 */
export function getAdminApp() {
  if (getApps().length === 0) {
    // Initialize with service account credentials from environment variables
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Private key needs to be formatted correctly (replace \\n with actual newlines)
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth() {
  return getAuth(getAdminApp());
}

/**
 * Get Firebase Admin Firestore instance
 */
export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}
