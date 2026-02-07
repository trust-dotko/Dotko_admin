# Firebase Cloud Messaging (FCM) Setup Guide

This guide will help you set up push notifications for the DOTKO Admin Panel.

## Prerequisites

- Firebase project configured (✅ Already done: `dotko-b2543`)
- Admin panel deployed and running

## Step 1: Generate VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/dotko-b2543/settings/cloudmessaging)
2. Navigate to: **Project Settings** → **Cloud Messaging** tab
3. Scroll down to **Web Push certificates** section
4. Click **"Generate key pair"** button
5. Copy the generated **Key pair** (starts with `B...`)

## Step 2: Add VAPID Key to Environment Variables

1. Open `.env.local` file
2. Find the line: `NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-here`
3. Replace `your-vapid-key-here` with your actual VAPID key
4. Save the file

Example:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKx1234567890abcdefghijklmnopqrstuvwxyz...
```

## Step 3: Register Service Worker in Next.js

The service worker is already created at `/public/firebase-messaging-sw.js`

Add this to your `next.config.js` (if needed):

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
};
```

## Step 4: Restart Development Server

```bash
npm run dev
```

## Step 5: Test Push Notifications

### A. Grant Notification Permission

1. Login to the admin panel: `http://localhost:3001/login`
2. You should see a browser prompt asking for notification permission
3. Click **"Allow"**
4. Your FCM token will be automatically stored in Firestore

### B. Test Notification

1. Go to **Reports** page
2. Update a report's status (e.g., from "pending" to "under_discussion")
3. The supplier (reporter) will receive a push notification!

## How It Works

### 1. **User Login**
- When a user logs in, the app requests notification permission
- If granted, an FCM token is generated and stored in Firestore (`fcm_tokens` collection)

### 2. **Admin Updates Report**
- Admin changes report status in the Reports page
- The app calls `/api/send-notification` API route
- API route:
  - Retrieves the supplier's FCM token from Firestore
  - Sends push notification via Firebase Admin SDK
  - Stores notification in `notifications` collection

### 3. **User Receives Notification**
- **Foreground** (app open): Notification shows in-app
- **Background** (app closed): Browser notification appears
- User can click notification to open the app and view details

## File Structure

```
dtk-admin/
├── public/
│   └── firebase-messaging-sw.js        # Service worker for background notifications
├── lib/
│   └── fcm.ts                          # FCM utility functions (client-side)
├── app/
│   └── api/
│       └── send-notification/
│           └── route.ts                # API route for sending notifications
├── contexts/
│   └── AuthContext.tsx                 # Integrates FCM on login/logout
└── .env.local                          # Contains VAPID key
```

## Notification Triggers

Push notifications are sent when:

1. ✅ **Report Status Updated** by admin
   - Status changes to: `under_discussion`, `resolved`, `published`, or `rejected`
   - Notification sent to: Supplier (reporter)

## Troubleshooting

### Issue: "Notification permission denied"
**Solution**:
- Clear browser data for localhost
- Restart browser
- Try again and click "Allow"

### Issue: "User does not have FCM token registered"
**Solution**:
- User needs to login and grant notification permission
- Check `fcm_tokens` collection in Firestore

### Issue: "Invalid VAPID key"
**Solution**:
- Make sure VAPID key is correctly copied from Firebase Console
- Restart dev server after updating `.env.local`

### Issue: "Service worker not registering"
**Solution**:
- Check browser console for errors
- Make sure `/firebase-messaging-sw.js` is accessible at `http://localhost:3001/firebase-messaging-sw.js`
- Clear service worker cache: Chrome DevTools → Application → Service Workers → Unregister

## Testing Notifications Manually

You can also test by calling the API directly:

```bash
curl -X POST http://localhost:3001/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UID_HERE",
    "title": "Test Notification",
    "message": "This is a test push notification!",
    "reportId": "REPORT_ID_HERE"
  }'
```

## Security

- ✅ Firestore rules protect `fcm_tokens` collection
- ✅ Users can only read/write their own tokens
- ✅ Admins have full access
- ✅ API route validates inputs before sending notifications

## Next Steps

1. Generate VAPID key from Firebase Console
2. Add VAPID key to `.env.local`
3. Restart dev server
4. Test notification flow

---

**Questions?** Check the Firebase Cloud Messaging documentation:
https://firebase.google.com/docs/cloud-messaging/js/client
