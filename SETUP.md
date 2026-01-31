# SETUP GUIDE - Ramp API Connector (Secure Version)

Follow these steps to get your secure, production-ready Ramp API integration running.

## 📝 Step-by-Step Setup

### 1. Get Ramp Developer Credentials

1. **Log in to Ramp**: https://app.ramp.com
2. **Navigate to Developer Settings**: 
   - Go to Settings → Developer
   - Or directly: https://app.ramp.com/settings/developer
3. **Create OAuth App**:
   - Click "Create new app" or use existing
   - Give it a name (e.g., "My Integration")
4. **Copy Your Credentials**:
   - **Client ID**: something like `clnt_abc123xyz...`
   - **Client Secret**: Click "Show" to reveal (keep this secret!)

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from this directory
vercel

# Follow the prompts and deploy
```

**Your app will deploy but won't work yet - we need to add environment variables!**

### 3. Configure Environment Variables in Vercel

**This is the most important step!** Your secrets are stored securely in Vercel.

#### Via Vercel Dashboard (Easiest):

1. Go to https://vercel.com/dashboard
2. Click on your deployed project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

   **Variable 1:**
   - Name: `RAMP_CLIENT_ID`
   - Value: Your Client ID (e.g., `clnt_abc123...`)
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `RAMP_CLIENT_SECRET`  
   - Value: Your Client Secret
   - Environments: ✅ Production ✅ Preview ✅ Development

5. **IMPORTANT**: Click **Redeploy** after adding variables
   - Go to Deployments tab
   - Click ⋯ on latest deployment
   - Click "Redeploy"

#### Via CLI (Alternative):

```bash
vercel env add RAMP_CLIENT_ID
# Paste your Client ID when prompted
# Select all environments

vercel env add RAMP_CLIENT_SECRET
# Paste your Client Secret when prompted  
# Select all environments

# Redeploy
vercel --prod
```

See [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) for detailed instructions.

### 4. Configure Ramp Redirect URI

1. Go back to https://app.ramp.com/settings/developer
2. Find your OAuth app
3. Add your Vercel URL as a redirect URI:
   ```
   https://your-project-name.vercel.app/
   ```
   **Important**: Include the trailing slash!

### 5. Test the Integration

1. Visit your Vercel URL: `https://your-project-name.vercel.app`
2. You should see: **"✅ Client ID loaded from backend"**
3. Click "Request Access Token from Ramp"
4. Authorize on Ramp
5. You'll be redirected back with a token!
6. Click "Test Token with API Call" to verify

## 🔍 Verification Checklist

Before testing, verify:

- [ ] Created Ramp OAuth app
- [ ] Deployed to Vercel
- [ ] Added `RAMP_CLIENT_ID` to Vercel environment variables
- [ ] Added `RAMP_CLIENT_SECRET` to Vercel environment variables
- [ ] Set variables for ALL environments (Production, Preview, Development)
- [ ] Redeployed after adding variables
- [ ] Configured redirect URI in Ramp settings
- [ ] Redirect URI matches your Vercel URL exactly

## ⚠️ Common Issues

### Issue: "Configuration loading... Please wait"
**Solution**: Environment variables not set or you didn't redeploy
1. Check Vercel dashboard → Settings → Environment Variables
2. Verify both variables exist
3. Redeploy: Deployments → ⋯ → Redeploy

### Issue: "Server configuration error"
**Solution**: Misspelled environment variable names
- Must be exactly: `RAMP_CLIENT_ID` and `RAMP_CLIENT_SECRET`
- Case-sensitive!

### Issue: "Redirect URI mismatch"
**Solution**: 
- Vercel URL: `https://your-project.vercel.app/`
- Ramp setting must match exactly (including trailing slash)

### Issue: OAuth flow starts but fails at token exchange
**Solution**: `RAMP_CLIENT_SECRET` not set correctly
1. Double-check you copied the entire secret
2. No extra spaces
3. Redeployed after adding it

## 🎯 What's Different from the Old Version?

### Old Version (Insecure):
- ❌ Client ID hardcoded in `index.html`
- ❌ Would need Client Secret in browser (security risk!)
- ❌ Secrets visible in source code

### New Version (Secure):
- ✅ Client ID loaded from backend
- ✅ Client Secret never leaves server
- ✅ Token exchange happens on backend
- ✅ All secrets in Vercel environment variables
- ✅ Production-ready security

## 🎯 What's Next?

After you've successfully:
1. ✅ Requested a token
2. ✅ Seen it displayed
3. ✅ Tested it with an API call

You're ready for **Step 2**! Tell me what you want to build next:

- Display transaction data?
- Card management interface?
- Expense analytics dashboard?
- Bill payment automation?
- Something else?

## 📞 Getting Help

**For Ramp API issues:**
- Email: developer-support@ramp.com
- Docs: https://docs.ramp.com

**For this code:**
- Check the browser console for errors (F12)
- Read the error messages carefully
- Verify all setup steps above

## 🎓 Understanding the Code

The app is a single HTML file with:
- **React 18** loaded from CDN (no build step needed)
- **OAuth 2.0 flow** implemented in vanilla React
- **State management** with useState hooks
- **Side effects** with useEffect hooks
- **localStorage** for token persistence

Key functions:
- `handleRequestToken()` - Initiates OAuth flow
- `exchangeCodeForToken()` - Exchanges code for token (needs backend in production!)
- `testToken()` - Makes a test API call

## 🔐 Security Reminder

**NEVER commit or share:**
- ❌ Your Client Secret
- ❌ Access tokens
- ❌ Any credentials

**DO share/commit:**
- ✅ Client ID (it's meant to be public)
- ✅ This code (after removing any tokens)

---

**Ready to proceed? Run the app and let me know when you want to add the next feature!**
