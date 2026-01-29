# Firebase Setup Guide

This guide walks you through setting up Firebase for the Tooling Spend Tracker application.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "tooling-spend-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore

1. In the Firebase Console, navigate to **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** initially (we'll add custom rules)
4. Select a location (choose closest to your users)
5. Click "Enable"

## 3. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "tooling-tracker-web")
5. Copy the configuration values:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

6. Add these values to your `.env.local` file:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 4. Create Firestore Collections

The application will automatically create collections when you add data, but you should create indexes manually.

### Required Collections:
- `vendors`
- `transactions`

### Collection Schemas:

#### vendors
```
{
  name: string
  monthlyBudget: number
  category: string
  active: boolean
  alternativeNames: string[]
  notes?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### transactions
```
{
  vendorId?: string
  merchantName: string
  amount: number
  date: timestamp
  month: string
  description?: string
  rampTransactionId: string
  category?: string
  cardLastFour?: string
  employeeName?: string
  createdAt: timestamp
}
```

## 5. Create Firestore Indexes

Firestore requires composite indexes for certain queries. Create these indexes in the Firebase Console:

### Index 1: Vendors by active status and name
- Collection: `vendors`
- Fields:
  - `active` (Ascending)
  - `name` (Ascending)

### Index 2: Vendors by category, active status, and name
- Collection: `vendors`
- Fields:
  - `category` (Ascending)
  - `active` (Ascending)
  - `name` (Ascending)

### Index 3: Transactions by month and date
- Collection: `transactions`
- Fields:
  - `month` (Ascending)
  - `date` (Descending)

### Index 4: Transactions by vendor and month
- Collection: `transactions`
- Fields:
  - `vendorId` (Ascending)
  - `month` (Ascending)
  - `date` (Descending)

### Index 5: Transactions by month, vendorId (null), and date
- Collection: `transactions`
- Fields:
  - `month` (Ascending)
  - `vendorId` (Ascending)
  - `date` (Descending)

### Index 6: Transactions by date range
- Collection: `transactions`
- Fields:
  - `date` (Ascending)
  - `date` (Descending)

**To create indexes:**
1. Go to Firestore Database in Firebase Console
2. Click on "Indexes" tab
3. Click "Create Index"
4. Enter collection name and fields as listed above
5. Click "Create"

Or, the application will provide error messages with direct links to create indexes when you first run queries.

## 6. Set Up Firestore Security Rules

Replace the default rules with these production-ready rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Vendors collection - read/write for authenticated users
    match /vendors/{vendorId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Transactions collection - read/write for authenticated users
    match /transactions/{transactionId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Block all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**For development (less restrictive):**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: The development rules allow unrestricted access. Use only in development and switch to production rules before deploying.

## 7. Enable Firebase Authentication (Optional)

If you want to add user authentication:

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - Email/Password
   - Google (recommended)
   - Or other providers as needed
4. Update security rules to check authentication
5. Add authentication UI to your app

## 8. Test Firebase Connection

After setup, test your connection:

```bash
npm run dev
```

Navigate to `/admin` and try adding a vendor. If successful, your Firebase setup is complete!

## Troubleshooting

### "Missing or insufficient permissions" error
- Check security rules are correctly configured
- Ensure you're authenticated (if using auth)

### "The query requires an index" error
- Click the link in the error message to create the index
- Or manually create the index as described above

### Configuration values not loading
- Ensure all environment variables are set in `.env.local`
- Restart the development server after changing env vars
- Check that variable names start with `NEXT_PUBLIC_` for client-side access

### Firestore operations timing out
- Check your network connection
- Verify Firebase project is in the correct region
- Review Firestore usage quotas in Firebase Console

## Next Steps

After Firebase is set up:
1. Configure your Ramp API key (see [RAMP_SETUP.md](./RAMP_SETUP.md))
2. Add your first vendors in the Admin panel
3. Sync transactions from Ramp
4. View your dashboard!
