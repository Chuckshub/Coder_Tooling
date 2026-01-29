# Quick Start Guide

Get the Tooling Spend Tracker up and running in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier)
- Ramp account with API access

## Step 1: Clone and Install (2 minutes)

```bash
cd tooling-spend-tracker
npm install
```

## Step 2: Firebase Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Firestore Database
4. Get config from Project Settings → Your apps → Web app
5. Copy values to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 3: Ramp OAuth Setup (5 minutes)

1. Log into [Ramp](https://app.ramp.com/)
2. Go to Settings → Developer
3. Click "Create App"
4. Name: "Tooling Spend Tracker"
5. Grant Type: "Client Credentials"
6. Scopes: `transactions:read`
7. Copy Client ID and Client Secret
8. Add to `.env.local`:

```bash
RAMP_CLIENT_ID=your_client_id
RAMP_CLIENT_SECRET=your_client_secret
```

## Step 4: Start Development Server (1 minute)

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Initial Setup (5 minutes)

### Add Your First Vendor

1. Navigate to `/admin`
2. Click "Add Vendor"
3. Fill in:
   - Name: "GitHub"
   - Monthly Budget: 50
   - Category: "Development"
   - Alternative Names: "Github, GitHub Inc"
4. Click "Create"

### Sync Transactions

1. Navigate to `/dashboard`
2. Select current month
3. Click "Sync"
4. Wait for transactions to load

### Verify Setup

You should see:
- Summary cards with totals
- Your vendor in the Known Tooling table
- Any unmatched transactions in Non-Budgeted Tooling

## Next Steps

- Add more vendors in Admin panel
- Review non-budgeted vendors and add to your list
- Export data to CSV
- Check Unused Subscriptions

## Common Issues

**"Firebase not defined" error:**
```bash
# Make sure all NEXT_PUBLIC_ variables are set
# Restart dev server after changing .env.local
```

**"Authentication failed" for Ramp:**
```bash
# Verify RAMP_API_KEY is correct
# Check no extra spaces in .env.local
```

**No transactions appearing:**
```bash
# Verify date range has settled transactions
# Check Ramp dashboard for transaction state
```

## Documentation

For detailed information:
- [README.md](./README.md) - Full overview
- [Firebase Setup](./docs/FIREBASE_SETUP.md) - Complete Firebase guide
- [Ramp Setup](./docs/RAMP_SETUP.md) - Complete Ramp guide
- [User Guide](./docs/USER_GUIDE.md) - How to use the application
- [Deployment](./docs/DEPLOYMENT.md) - Deploy to Vercel

## Getting Help

- Check documentation in `/docs`
- Review inline code comments
- Open GitHub issue

---

**You're all set!** Start tracking your software tooling spend. 🎉
