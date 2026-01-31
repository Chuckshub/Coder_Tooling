# Vercel Environment Variables Setup Guide

This guide walks you through securely configuring your Ramp API credentials in Vercel.

## 🎯 Overview

Your Ramp credentials are stored as **environment variables** in Vercel:
- ✅ **RAMP_CLIENT_ID** - Your OAuth Client ID (public identifier)
- ✅ **RAMP_CLIENT_SECRET** - Your OAuth Client Secret (must be kept secret!)

These are loaded by your serverless backend functions and **never exposed** to the frontend.

## 📋 Step-by-Step Setup

### Step 1: Get Your Ramp Credentials

1. **Log in to Ramp**: https://app.ramp.com
2. **Navigate to Developer Settings**: 
   ```
   Settings → Developer
   or: https://app.ramp.com/settings/developer
   ```
3. **Create or Select OAuth App**:
   - Click "Create new app" if you don't have one
   - Or select your existing app
4. **Copy Credentials**:
   ```
   Client ID: clnt_xxxxxxxxxxxxxxxxxxxxxxxx
   Client Secret: (click "Show" to reveal)
   ```
   
⚠️ **IMPORTANT**: Keep your Client Secret safe! Never commit it to git or share it publicly.

### Step 2: Deploy to Vercel (First Time)

If you haven't deployed yet:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (enter name or accept default)
# - Directory? ./ (or just press Enter)
# - Want to override settings? No
```

Your app will deploy, but won't work yet without environment variables.

### Step 3: Add Environment Variables to Vercel

#### Method A: Via Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Your Project**: Click on your deployed project
3. **Go to Settings**: Click "Settings" tab
4. **Navigate to Environment Variables**: 
   - Click "Environment Variables" in the left sidebar
5. **Add RAMP_CLIENT_ID**:
   - Click "Add New"
   - Name: `RAMP_CLIENT_ID`
   - Value: `clnt_your_actual_client_id_here`
   - Environments: Check ALL boxes (Production, Preview, Development)
   - Click "Save"
6. **Add RAMP_CLIENT_SECRET**:
   - Click "Add New" again
   - Name: `RAMP_CLIENT_SECRET`
   - Value: `your_actual_client_secret_here`
   - Environments: Check ALL boxes
   - Click "Save"

#### Method B: Via Vercel CLI

```bash
# Navigate to your project directory
cd your-project

# Link to Vercel project (if not already linked)
vercel link

# Add environment variables
vercel env add RAMP_CLIENT_ID
# When prompted, paste your Client ID
# Select all environments (Production, Preview, Development)

vercel env add RAMP_CLIENT_SECRET
# When prompted, paste your Client Secret
# Select all environments
```

### Step 4: Redeploy to Apply Changes

Environment variables are only loaded during build time, so you need to redeploy:

#### Method A: Via Dashboard
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the ⋯ (three dots) menu
4. Click **Redeploy**
5. Confirm the redeployment

#### Method B: Via CLI
```bash
# From your project directory
vercel --prod
```

#### Method C: Push to Git (if using GitHub integration)
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Step 5: Verify Setup

1. **Visit Your Deployed URL**: `https://your-project.vercel.app`
2. **Check Status**: You should see:
   ```
   Status: ✅ Client ID loaded from backend
   ```
3. **If you see an error**: Check that:
   - Environment variables are spelled correctly
   - Variables are set for all environments
   - You redeployed after adding variables

## 🔍 Troubleshooting

### "Server configuration error"
**Problem**: Environment variables not set or misspelled

**Solution**:
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Verify both `RAMP_CLIENT_ID` and `RAMP_CLIENT_SECRET` exist
3. Check spelling (case-sensitive!)
4. Ensure they're set for all environments
5. Redeploy

### "Status: ⏳ Loading configuration..."
**Problem**: Backend can't load environment variables

**Solution**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for request to `/api/config`
5. Check the response:
   - 200: Should have `client_id` field
   - 500: Server configuration error
   - 404: API route not deployed correctly

### "Configuration loading... Please wait"
**Problem**: Frontend can't reach backend API

**Solution**:
1. Check if `/api/config` endpoint exists in your deployment
2. Verify you deployed the `/api` folder with serverless functions
3. Check Vercel function logs for errors

### Variables Work Locally But Not in Production
**Problem**: Local `.env.local` file but no Vercel environment variables

**Solution**:
1. Local development uses `.env.local` file
2. Production uses Vercel environment variables
3. Set variables in Vercel dashboard (see Step 3)

## 🧪 Testing Locally with Environment Variables

To test locally with your production environment variables:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# This creates a .env.local file with your variables

# Run local development server
vercel dev

# Visit http://localhost:3000
```

**Note**: The `.env.local` file contains secrets and is in `.gitignore`. Never commit it!

## 🔐 Security Best Practices

### ✅ DO:
- Store credentials in Vercel environment variables
- Use different credentials for development/production if possible
- Rotate your Client Secret periodically
- Monitor your Ramp API usage

### ❌ DON'T:
- Commit `.env.local` or any file with secrets
- Share your Client Secret in Slack, email, or anywhere
- Hardcode credentials in source code
- Use production credentials in local development if avoidable

## 📊 Environment Variable Checklist

Before deploying:

- [ ] Created Ramp OAuth app
- [ ] Copied Client ID and Client Secret
- [ ] Added `RAMP_CLIENT_ID` to Vercel
- [ ] Added `RAMP_CLIENT_SECRET` to Vercel
- [ ] Set variables for ALL environments
- [ ] Redeployed after adding variables
- [ ] Verified "Client ID loaded" message appears
- [ ] Tested OAuth flow end-to-end

## 🔄 Updating Credentials

If you need to rotate credentials:

1. Generate new credentials in Ramp Developer Settings
2. Update Vercel environment variables with new values
3. Redeploy (old tokens will stop working)
4. Update redirect URIs if your domain changed

## 📞 Getting Help

**Vercel Issues**:
- Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Support: https://vercel.com/support

**Ramp API Issues**:
- Email: developer-support@ramp.com
- Docs: https://docs.ramp.com

**Still Stuck?**
1. Check Vercel function logs in dashboard
2. Check browser console (F12) for errors
3. Verify environment variables are set correctly
4. Ensure you redeployed after adding variables

---

**Once configured, your secrets are safe and your app is production-ready! 🚀**
