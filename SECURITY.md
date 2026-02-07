# Security Guidelines

## Environment Variables

### ⚠️ NEVER COMMIT SENSITIVE DATA TO GIT

All sensitive information is stored in `.env.local` which is **automatically ignored** by git.

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **Verify `.env.local` is NOT tracked:**
   ```bash
   git status
   # .env.local should NOT appear in the list
   ```

### Protected Files

The following files are **automatically ignored** by git (see `.gitignore`):

- `.env.local` - Your actual environment variables
- `.env` - Any generic env file
- `.env.development.local`
- `.env.production.local`
- All other `.env*.local` files

### What's Safe to Commit

- ✅ `.env.example` - Template with placeholder values
- ✅ Code files that **read** from `process.env.*`
- ✅ Documentation files

### What's NEVER Safe to Commit

- ❌ `.env.local` - Contains real credentials
- ❌ Any file with hardcoded API keys, secrets, or passwords
- ❌ Firebase service account JSON files
- ❌ Private keys

## Current Environment Variables

### Public (Client-side)
These are prefixed with `NEXT_PUBLIC_` and are safe to expose in the browser:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Private (Server-side only)
These must NEVER be exposed to the browser:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` ⚠️ **HIGHLY SENSITIVE**
- `ADMIN_SETUP_SECRET` ⚠️ **HIGHLY SENSITIVE**

## Security Checklist

Before committing code:

- [ ] Check that no API keys are hardcoded
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Run `git status` and confirm `.env.local` is NOT listed
- [ ] Ensure all sensitive values use `process.env.*`
- [ ] Review diff before pushing: `git diff`

## If You Accidentally Commit Secrets

1. **Rotate all exposed credentials immediately:**
   - Generate new Firebase service account key
   - Update ADMIN_SETUP_SECRET
   - Update any other exposed secrets

2. **Remove from git history:**
   ```bash
   # This is complex - contact a senior developer for help
   # DO NOT try to remove history unless you know what you're doing
   ```

3. **Update `.env.local` with new credentials**

4. **Deploy new credentials to production**

## Firebase Security

### Firestore Rules
Security rules are stored in `firestore.rules` and can be safely committed to git.
They control data access and do NOT contain secrets.

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Admin SDK
The Firebase Admin SDK has full access to your project.
NEVER expose these credentials:
- ❌ Don't commit `FIREBASE_PRIVATE_KEY`
- ❌ Don't log it to console
- ❌ Don't send it to the client
- ❌ Don't include it in API responses

## Questions?

If you're unsure whether something is safe to commit, **ask first!**

Better to be safe than to expose credentials and have to rotate everything.
