#!/usr/bin/env node

/**
 * Script to set admin custom claims for a Firebase user
 *
 * Usage:
 *   node scripts/set-admin.js <email>
 *
 * Example:
 *   node scripts/set-admin.js admin@dotko.in
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function setAdminClaim(email) {
  try {
    // Get user by email
    console.log(`\nSearching for user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);

    console.log(`Found user: ${user.uid} (${user.email})`);

    // Check current claims
    const currentClaims = user.customClaims || {};
    console.log('Current custom claims:', currentClaims);

    if (currentClaims.admin === true) {
      console.log('\n✅ User is already an admin!');
      return;
    }

    // Confirm action
    const answer = await new Promise((resolve) => {
      rl.question('\n⚠️  Are you sure you want to grant admin privileges to this user? (yes/no): ', resolve);
    });

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled.');
      return;
    }

    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, {
      ...currentClaims,
      admin: true,
    });

    console.log('\n✅ Admin privileges granted successfully!');
    console.log('\n📝 Important: The user must sign out and sign in again for the changes to take effect.');
    console.log('   You can do this by:');
    console.log('   1. Clicking "Logout" in the admin panel');
    console.log('   2. Logging back in with the same credentials');

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 Tip: Make sure you created the user in Firebase Authentication first.');
      console.log('   Go to: https://console.firebase.google.com/project/dotko-b2543/authentication/users');
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Main
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address is required');
  console.log('\nUsage: node scripts/set-admin.js <email>');
  console.log('Example: node scripts/set-admin.js admin@dotko.in');
  process.exit(1);
}

// Validate environment variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Error: Firebase Admin SDK credentials not found in environment variables');
  console.log('\n💡 Make sure .env.local file exists with:');
  console.log('   FIREBASE_PROJECT_ID');
  console.log('   FIREBASE_CLIENT_EMAIL');
  console.log('   FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

setAdminClaim(email);
