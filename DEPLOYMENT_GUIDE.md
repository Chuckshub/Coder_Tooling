# Deployment Guide for Ramp API Vercel App

This guide walks you through deploying the Ramp API integration app to Vercel.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Ramp API credentials (Client ID and Client Secret from https://app.ramp.com/developer)
- [ ] Git installed on your computer

## Step 1: Get Your Ramp API Credentials

1. Go to https://app.ramp.com/developer
2. Navigate to the Developer section
3. Create a new application or select an existing one
4. Copy your **Client ID** (starts with something like `client_...`)
5. Copy your **Client Secret** (keep this secure!)
6. Note: You don't need to set a redirect URI for this app since we're using client credentials flow

## Step 2: Create GitHub Repository

### Option A: Use GitHub Desktop (Easier)

1. Open GitHub Desktop
2. File → New Repository
3. Name: `ramp-vercel-app`
4. Local Path: Choose where to save the project
5. Click "Create Repository"
6. Copy all the project files into this directory
7. Click "Commit to main" in GitHub Desktop
8. Click "Publish repository" to GitHub

### Option B: Use Command Line

```bash
# Navigate to the project directory
cd /path/to/ramp-vercel-app

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Ramp API integration app"

# Create repository on GitHub (go to github.com/new)
# Then connect your local repo:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ramp-vercel-app.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1: Connect Vercel to GitHub

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. If this is your first time, authorize Vercel to access your GitHub
5. Find and select the `ramp-vercel-app` repository
6. Click "Import"

### 3.2: Configure Project Settings

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** ./ (leave as default)

**Build Command:** `npm run build` (should auto-populate)

**Output Directory:** .next (should auto-populate)

**Install Command:** `npm install` (should auto-populate)

### 3.3: Add Environment Variables

**CRITICAL:** You must add these environment variables before deploying!

Click "Environment Variables" and add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `RAMP_CLIENT_ID` | Your Client ID from Ramp | Production, Preview, Development |
| `RAMP_CLIENT_SECRET` | Your Client Secret from Ramp | Production, Preview, Development |
| `RAMP_TOKEN_URL` | `https://api.ramp.com/v1/public/customer/token` | Production, Preview, Development |
| `RAMP_API_BASE` | `https://api.ramp.com` | Production, Preview, Development |

**Important:** 
- Select all three environments (Production, Preview, Development) for each variable
- Double-check your Client ID and Client Secret - any typos will cause authentication to fail

### 3.4: Deploy

1. Click "Deploy"
2. Wait 1-2 minutes for the build to complete
3. You'll see a success screen with your deployment URL (e.g., `https://ramp-vercel-app-xyz.vercel.app`)

## Step 4: Test Your Deployment

1. Click on the deployment URL from Vercel
2. You should see the "Ramp API Integration Test" page
3. Click "1. Get Access Token"
   - Watch the debug log - you should see "Token obtained successfully"
   - If you see an error, check your environment variables
4. Click "2. Fetch Transactions"
   - You should see your Ramp transactions displayed in a table
   - The debug log will show request details

## Step 5: Monitor and Debug

### View Logs in Vercel

1. In your Vercel dashboard, click on your project
2. Go to the "Deployments" tab
3. Click on your latest deployment
4. Click "Functions" to see API logs
5. Click on any API route (e.g., `/api/auth/token`) to see detailed logs

**What to look for in logs:**
- Request timestamps
- HTTP status codes
- Token information
- Error messages with full details
- Request/response bodies

### Common Issues and Solutions

**Issue: "Configuration error: Missing Ramp credentials"**
- Solution: Check that environment variables are set correctly in Vercel
- Go to Project Settings → Environment Variables
- Redeploy after adding/updating variables

**Issue: "Token request failed"**
- Check that your Client ID and Client Secret are correct
- Verify they're copied exactly from Ramp (no extra spaces)
- Check Vercel function logs for detailed error message

**Issue: "No access token found"**
- This is normal if you just loaded the page
- Click "Get Access Token" first
- If the button is disabled, the token may have expired (refresh and try again)

**Issue: Seeing old code after making changes**
- Vercel caches deployments
- Push new commit to GitHub to trigger new deployment
- Or click "Redeploy" in Vercel dashboard

## Step 6: Make Updates

When you want to update the code:

1. Make changes to your local files
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. Vercel automatically detects the push and redeploys
4. Check the "Deployments" tab to see progress

## Step 7: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Debugging Checklist

If something isn't working, check:

- [ ] Environment variables are set in Vercel (all 4 required variables)
- [ ] Client ID and Client Secret are correct (no typos)
- [ ] You selected all three environments when adding variables
- [ ] You clicked "Deploy" or pushed a new commit after adding variables
- [ ] You're using HTTPS URLs (Vercel provides this automatically)
- [ ] Check function logs in Vercel for detailed error messages

## Getting Help

1. **Check Vercel Logs:** Most issues show detailed errors in function logs
2. **Check Browser Console:** Press F12 in your browser to see client-side errors
3. **Ramp API Docs:** https://docs.ramp.com/developer-api/v1/introduction
4. **Vercel Docs:** https://vercel.com/docs

## Next Steps

Once deployed and working:

1. Customize the UI to match your needs
2. Add more API endpoints (users, receipts, etc.)
3. Implement proper session management for production
4. Add authentication for your app (protect the UI)
5. Set up monitoring and alerting
6. Configure custom domain

## Security Reminders

- ✅ Never commit `.env` files to GitHub
- ✅ Store secrets only in Vercel environment variables
- ✅ Tokens are stored in HTTP-only cookies (secure)
- ✅ Use HTTPS in production (Vercel handles this)
- ✅ Rotate your Ramp API credentials regularly

## Estimated Time

- First-time setup: 15-20 minutes
- Subsequent deployments: 2-3 minutes (automatic)

---

**That's it!** You now have a working Ramp API integration deployed on Vercel with comprehensive debugging. 🎉
