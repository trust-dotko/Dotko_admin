import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

/**
 * API Route to set admin custom claims for a user by UID
 *
 * Usage:
 *   POST /api/set-admin-uid
 *   Body: { uid: "user-uid-here", secret: "your-secret-key" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, secret } = body;

    // Validate inputs
    if (!uid || !secret) {
      return NextResponse.json(
        { error: 'UID and secret are required' },
        { status: 400 }
      );
    }

    // Check secret key
    const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;

    if (!ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        {
          error: 'Admin setup not configured',
          hint: 'Set ADMIN_SETUP_SECRET in .env.local'
        },
        { status: 500 }
      );
    }

    if (secret !== ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      );
    }

    // Get Firebase Admin Auth
    const auth = getAdminAuth();

    // Get user by UID
    const user = await auth.getUser(uid);

    // Check current claims
    const currentClaims = user.customClaims || {};

    if (currentClaims.admin === true) {
      return NextResponse.json({
        success: true,
        message: 'User is already an admin',
        user: {
          uid: user.uid,
          email: user.email,
          admin: true,
        },
      });
    }

    // Set admin custom claim
    await auth.setCustomUserClaims(user.uid, {
      ...currentClaims,
      admin: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin privileges granted successfully!',
      user: {
        uid: user.uid,
        email: user.email,
        admin: true,
      },
      note: '⚠️ IMPORTANT: User must sign out and sign in again for changes to take effect',
    });

  } catch (error: any) {
    console.error('Set admin error:', error);

    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        {
          error: 'User not found',
          hint: 'Make sure the UID is correct'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to set admin privileges' },
      { status: 500 }
    );
  }
}
