# Deployment Checklist

Complete this checklist before deploying to Vercel.

## ☐ Step 1: Firebase Setup (15 minutes)

### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "tooling-spend-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Firestore
1. In Firebase Console → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your region
5. Click "Enable"

### Set Security Rules
1. Go to Firestore → "Rules" tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For now - restrict later with auth
    }
  }
}
```

3. Click "Publish"

### Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click Web icon `</>`
4. Register app: "tooling-tracker-web"
5. **Copy these values** (you'll need them for Vercel):

```
API Key: AIza...
Auth Domain: your-project.firebaseapp.com
Project ID: your-project
Storage Bucket: your-project.appspot.com
Messaging Sender ID: 123...
App ID: 1:123...
```

✅ Mark complete when done

---

## ☐ Step 2: Create Ramp Developer App (10 minutes)

1. Log into https://app.ramp.com/
2. Go to **Settings** → **Developer**
3. Click **"Create App"** or **"New Application"**
4. Fill in:
   - Name: "Tooling Spend Tracker"
   - Description: "Internal spend tracking tool"
5. Under **Grant Types**: Click "Add new grant type" → Select **"Client Credentials"**
6. Under **Scopes**: Click "Configure allowed scopes" → Select:
   - ✅ `transactions:read`
   - ✅ `business:read` (optional)
7. Click **"Create"** or **"Save"**
8. **Copy BOTH values immediately** (shown only once):
   - Client ID: `ramp_xxxxx...`
   - Client Secret: `ramp_secret_xxxxx...`

⚠️ Save these in a secure location - you cannot retrieve the client secret later!

✅ Mark complete when done

---

## ☐ Step 3: Push to GitHub (2 minutes)

```bash
cd tooling-spend-tracker

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Tooling Spend Tracker"

# Create GitHub repo (via GitHub website)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/tooling-spend-tracker.git
git branch -M main
git push -u origin main
```

✅ Mark complete when done

---

## ☐ Step 4: Deploy to Vercel (5 minutes)

### Import Project
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Configure Build Settings (should be auto-detected)
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### ⚠️ DO NOT DEPLOY YET - Click "Environment Variables" first

---

## ☐ Step 5: Add Environment Variables to Vercel (CRITICAL!)

In the Vercel project setup, click **"Environment Variables"** and add these:

### Firebase Variables (all NEXT_PUBLIC)
```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [your Firebase API key from Step 1]
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: [your-project.firebaseapp.com]
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [your project ID]
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [your-project.appspot.com]
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [your sender ID]
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: [your app ID]
Environments: ☑ Production ☑ Preview ☑ Development
```

### Ramp OAuth Variables (server-side only - NO NEXT_PUBLIC prefix!)
```
Name: RAMP_CLIENT_ID
Value: [your Ramp client ID from Step 2]
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Name: RAMP_CLIENT_SECRET
Value: [your Ramp client secret from Step 2]
Environments: ☑ Production ☑ Preview ☑ Development
```

✅ Verify all 8 variables are added correctly (6 Firebase + 2 Ramp)

---

## ☐ Step 6: Deploy

Now click **"Deploy"**!

Vercel will:
1. Install dependencies
2. Build your Next.js app
3. Deploy to production

Wait 2-3 minutes for deployment to complete.

---

## ☐ Step 7: Verify Deployment (5 minutes)

### Test Your Live App

1. Visit your Vercel URL (e.g., `https://tooling-spend-tracker.vercel.app`)

2. **Test Home Page**
   - Should load without errors
   - Navigate buttons should work

3. **Test Admin Panel**
   - Go to `/admin`
   - Click "Add Vendor"
   - Fill in test data:
     - Name: "GitHub"
     - Monthly Budget: 50
     - Category: "Development"
     - Alternative Names: "Github, GitHub Inc"
   - Click "Create"
   - Verify vendor appears in table

4. **Test Dashboard**
   - Go to `/dashboard`
   - Select current month
   - Click "Sync" (this tests Ramp API connection)
   - Should fetch transactions (or show "0 transactions" if none exist)

### If Something Fails

**Check Vercel Logs:**
1. Go to Vercel project
2. Click "Deployments" tab
3. Click latest deployment
4. View "Runtime Logs"

**Common Issues:**

❌ **"Firebase not defined"**
- Environment variables not set correctly
- Make sure all `NEXT_PUBLIC_` variables are added
- Redeploy after adding variables

❌ **"Authentication failed" (Ramp)**
- RAMP_CLIENT_ID or RAMP_CLIENT_SECRET not set or incorrect
- Verify credentials in Vercel dashboard
- Check no extra spaces
- Ensure your Ramp app has `transactions:read` scope enabled

❌ **Build fails**
- Check Build Logs in Vercel
- Usually missing dependencies (already installed in package.json)

---

## ☐ Step 8: Initial Data Setup (10 minutes)

Once app is working:

### Add Your Vendors
1. Go to Admin panel
2. Add 5-10 of your main software vendors
3. Set monthly budgets
4. Add alternative names for better matching

### Sync Historical Data
1. Go to Dashboard
2. Start with last month
3. Click "Sync"
4. Repeat for last 2-3 months

### Review and Adjust
1. Check Non-Budgeted Tooling section
2. Add missing vendors
3. Update alternative names as needed

---

## ✅ Deployment Complete!

Your app is now live and tracking spend!

### Next Steps:
- Set up monthly sync schedule
- Share with finance team
- Review variance reports
- Optimize budgets

### Ongoing Maintenance:
- **Weekly**: Check new non-budgeted vendors
- **Monthly**: Sync transactions, review variances
- **Quarterly**: Update budgets, archive unused vendors

---

## Need Help?

- **Firebase Issues**: See [docs/FIREBASE_SETUP.md](./docs/FIREBASE_SETUP.md)
- **Ramp Issues**: See [docs/RAMP_SETUP.md](./docs/RAMP_SETUP.md)
- **Deployment Issues**: See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Usage Questions**: See [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)

## Pro Tips

💡 **Use Preview Deployments**: Every PR creates a preview URL for testing

💡 **Environment-Specific Keys**: Use different Ramp API keys for staging/production

💡 **Custom Domain**: Add your own domain in Vercel → Settings → Domains

💡 **Analytics**: Enable Vercel Analytics to track usage

💡 **Monitoring**: Set up Vercel notifications for deployment failures
