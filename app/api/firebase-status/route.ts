import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    adminSDK: {
      status: 'unknown',
      auth: false,
      firestore: false,
      userCount: 0,
      error: null as string | null,
    },
    environment: {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientConfig: {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      }
    }
  };

  // Test Firebase Admin SDK
  try {
    // Test Auth
    const auth = getAdminAuth();
    const listUsersResult = await auth.listUsers(1);
    results.adminSDK.auth = true;
    results.adminSDK.userCount = listUsersResult.users.length;

    // Test Firestore
    const firestore = getAdminFirestore();
    await firestore.collection('_test').limit(1).get();
    results.adminSDK.firestore = true;

    results.adminSDK.status = 'connected';
  } catch (error: any) {
    results.adminSDK.status = 'error';
    results.adminSDK.error = error.message;
  }

  return NextResponse.json(results, {
    status: results.adminSDK.status === 'connected' ? 200 : 500
  });
}
