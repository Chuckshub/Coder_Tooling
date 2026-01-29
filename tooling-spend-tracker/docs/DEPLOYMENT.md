# Deployment Guide

This guide covers deploying the Tooling Spend Tracker to Vercel.

## Vercel Deployment

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Completed Firebase and Ramp setup

### Step 1: Prepare Your Repository

1. Initialize Git repository:

```bash
git init
git add .
git commit -m "Initial commit: Tooling Spend Tracker"
```

2. Create a new repository on GitHub

3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/tooling-spend-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add environment variables (see below)
6. Click "Deploy"

#### Option B: Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy:

```bash
vercel
```

4. Follow the prompts
5. Add environment variables using CLI or dashboard

### Step 3: Configure Environment Variables

Add all environment variables in Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:

**Firebase Variables** (all should be visible to client):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Ramp API Variable** (server-side only):
- `RAMP_API_KEY`

4. Select environments: Production, Preview, Development
5. Click "Save"

### Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the three dots (⋮) on the latest deployment
3. Click "Redeploy"
4. Or push a new commit to trigger automatic deployment

### Step 5: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Test the following:
   - Home page loads
   - Navigate to `/dashboard`
   - Navigate to `/admin`
   - Add a vendor
   - Sync transactions

## Custom Domain (Optional)

### Add Custom Domain

1. In Vercel project, go to **Settings** → **Domains**
2. Click "Add"
3. Enter your domain (e.g., `spend.yourcompany.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you open a pull request

### Branch Deployments

Configure branch deployments in **Settings** → **Git**:
- Set production branch (default: `main`)
- Enable/disable preview deployments
- Configure deployment protection

## Performance Optimization

### Build Optimization

The app is configured for optimal performance:
- Static page generation where possible
- API routes for dynamic data
- Tree-shaking and code splitting
- Image optimization with Next.js Image component

### Caching Strategy

- Static assets: Cached indefinitely
- API responses: No caching (real-time data)
- Firestore data: Cached client-side (adjust as needed)

## Monitoring

### Vercel Analytics

Enable analytics in Vercel dashboard:
1. Go to **Analytics** tab
2. Enable Web Analytics
3. View performance metrics

### Error Tracking

View errors and logs:
1. Go to **Deployments** tab
2. Click on a deployment
3. View **Runtime Logs**
4. Check **Build Logs** for build-time issues

### Firebase Console

Monitor Firestore usage:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Firestore Database**
3. Check **Usage** tab for:
   - Document reads/writes
   - Storage usage
   - Index efficiency

## Scaling Considerations

### Vercel Limits (Free Tier)

- 100 GB bandwidth/month
- 100 hours build time/month
- Unlimited API requests
- 10-second serverless function timeout

### Firebase Limits (Free Tier - Spark Plan)

- 50K document reads/day
- 20K document writes/day
- 1 GB storage
- 10 GB/month network egress

### Upgrading

If you exceed limits:
- **Vercel**: Upgrade to Pro ($20/month)
- **Firebase**: Upgrade to Blaze (pay-as-you-go)

## Security Best Practices

### Environment Variables

- Never commit `.env.local` to Git
- Rotate API keys regularly
- Use different keys for development and production

### Firestore Security

- Use production security rules before launch
- Enable Firebase Authentication for multi-user access
- Review audit logs regularly

### API Security

- Rate limit API endpoints
- Validate input data
- Use HTTPS only (Vercel enforces this)

## Backup and Recovery

### Database Backups

1. Export Firestore data:
   - Use Firebase CLI or Console
   - Schedule regular exports
   - Store in Cloud Storage

2. Automated backups:
   - Enable Firebase automated backups (Blaze plan)
   - Configure retention policy

### Code Backups

- Git repository serves as backup
- Tag releases: `git tag v1.0.0`
- Keep production branch protected

## Troubleshooting Deployment

### Build Failures

**TypeScript errors**:
```bash
npm run type-check
```

**ESLint errors**:
```bash
npm run lint
```

Fix all errors before deploying.

### Runtime Errors

**API routes failing**:
- Check environment variables are set
- Review Vercel function logs
- Verify Firebase/Ramp credentials

**Page not loading**:
- Check browser console for errors
- Verify all dependencies installed
- Clear browser cache

### Environment Variable Issues

**Variables not loading**:
- Ensure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding variables
- Check variable names match exactly

## Rollback

### Revert to Previous Deployment

1. Go to **Deployments** tab
2. Find a working deployment
3. Click three dots (⋮)
4. Click "Promote to Production"

### Revert Code Changes

```bash
git revert <commit-hash>
git push
```

Vercel will automatically deploy the reverted version.

## Production Checklist

Before launching to production:

- [ ] All environment variables configured in Vercel
- [ ] Firebase security rules set to production mode
- [ ] Ramp API key is valid and has correct permissions
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate provisioned
- [ ] Error tracking enabled
- [ ] Backup strategy in place
- [ ] Documentation reviewed and updated
- [ ] Initial vendor data loaded
- [ ] Test sync with real Ramp data
- [ ] Export functionality tested
- [ ] Admin panel access restricted (if using auth)

## Post-Deployment

### Initial Data Load

1. Add all vendors with budgets
2. Sync historical transactions (last 3-12 months)
3. Review and verify data accuracy
4. Map any unmatched vendors

### User Training

Provide users with:
- Dashboard tour
- How to read roll-forward presentation
- When to sync data
- How to interpret variance flags

### Maintenance Schedule

**Weekly**:
- Review non-budgeted vendors
- Map new merchants

**Monthly**:
- Sync new month's transactions
- Review budget variances
- Update budgets if needed

**Quarterly**:
- Review unused subscriptions
- Archive inactive vendors
- Audit vendor mappings

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
