import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

/**
 * API Route to set admin custom claims for a user
 *
 * This is a one-time setup endpoint. For security, it requires:
 * 1. A secret key (ADMIN_SETUP_SECRET) in the request
 * 2. The user's email address
 *
 * Usage:
 *   POST /api/set-admin
 *   Body: { email: "admin@dotko.in", secret: "your-secret-key" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, secret } = body;

    // Validate inputs
    if (!email || !secret) {
      return NextResponse.json(
        { error: 'Email and secret are required' },
        { status: 400 }
      );
    }

    // Check secret key (set in .env.local)
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

    // Get user by email
    const user = await auth.getUserByEmail(email);

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
      message: 'Admin privileges granted successfully',
      user: {
        uid: user.uid,
        email: user.email,
        admin: true,
      },
      note: 'User must sign out and sign in again for changes to take effect',
    });

  } catch (error: any) {
    console.error('Set admin error:', error);

    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        {
          error: 'User not found',
          hint: 'Create the user in Firebase Authentication first'
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
