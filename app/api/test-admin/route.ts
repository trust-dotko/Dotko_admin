import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const auth = getAdminAuth();

    // Test: List first 5 users
    const listUsersResult = await auth.listUsers(5);

    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.metadata.creationTime,
    }));

    return NextResponse.json({
      success: true,
      message: 'Firebase Admin SDK is working!',
      userCount: users.length,
      users,
    });
  } catch (error: any) {
    console.error('Firebase Admin Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
