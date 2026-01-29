# Ramp OAuth 2.0 Update

## What Changed

The application has been updated to use **Ramp's proper OAuth 2.0 authentication** instead of simple API keys.

### Why This Matters

<cite index="1-1,1-2">Ramp uses OAuth 2.0 for secure API access with granular permission control through scopes</cite>. <cite index="1-5">Access tokens expire after 10 days</cite>, so the application now handles token management automatically.

## What You Need

### OLD (Incorrect) ❌
```bash
RAMP_API_KEY=your_api_key
```

### NEW (Correct) ✅
```bash
RAMP_CLIENT_ID=your_client_id
RAMP_CLIENT_SECRET=your_client_secret
```

## How to Get OAuth Credentials

### Step-by-Step Process

1. **Log into Ramp**
   - Go to https://app.ramp.com/
   - You need **Admin** or **Business Owner** access

2. **Navigate to Developer Settings**
   - Settings → Developer

3. **Create a New App**
   - Click "Create App" or "New Application"
   - Name: "Tooling Spend Tracker"
   - Description: "Internal spend tracking tool"

4. **Configure Grant Type**
   - Click "Add new grant type"
   - Select **"Client Credentials"** (for server-to-server)
   
5. **Set Scopes**
   - Click "Configure allowed scopes"
   - Enable: `transactions:read` (required)
   - Optional: `business:read`

6. **Get Credentials**
   - After saving, you'll receive:
     - **Client ID**: `ramp_xxxxx...`
     - **Client Secret**: `ramp_secret_xxxxx...`
   - ⚠️ **IMPORTANT**: Copy both immediately - you can't retrieve the secret later!

## For Development (Local)

Update your `.env.local` file:

```bash
# Remove old variable
# RAMP_API_KEY=...  ❌ DELETE THIS

# Add new variables
RAMP_CLIENT_ID=your_client_id_here
RAMP_CLIENT_SECRET=your_client_secret_here
```

Then restart your dev server:
```bash
npm run dev
```

## For Production (Vercel)

You need to update your environment variables in Vercel:

### 1. Remove Old Variable
1. Go to your Vercel project
2. Settings → Environment Variables
3. Find `RAMP_API_KEY`
4. Click the three dots → Delete

### 2. Add New Variables
Add these two variables:

**Variable 1:**
- Name: `RAMP_CLIENT_ID`
- Value: [your client ID from Ramp]
- Environments: ☑ Production ☑ Preview ☑ Development

**Variable 2:**
- Name: `RAMP_CLIENT_SECRET`
- Value: [your client secret from Ramp]
- Environments: ☑ Production ☑ Preview ☑ Development

### 3. Redeploy
- Go to Deployments tab
- Click latest deployment → Redeploy

## What The App Does Automatically

The updated `RampClient` now:

1. **Requests Access Tokens**
   - Uses Client Credentials flow
   - Requests `transactions:read` scope
   - Tokens are valid for 10 days

2. **Caches Tokens**
   - Stores token in memory
   - Reuses until expiry

3. **Auto-Refreshes**
   - Checks expiry before each request
   - Automatically gets new token when needed
   - No manual intervention required

4. **Handles Errors**
   - Better error messages
   - Specific OAuth error handling

## Technical Changes

### Files Modified

1. **`lib/ramp/client.ts`**
   - Added OAuth token management
   - Changed from `Bearer {api_key}` to OAuth flow
   - Added `getAccessToken()` method
   - Added `authenticatedRequest()` wrapper

2. **`.env.example`**
   - Updated to show `RAMP_CLIENT_ID` and `RAMP_CLIENT_SECRET`

3. **Documentation**
   - `docs/RAMP_SETUP.md` - Complete rewrite
   - `DEPLOYMENT_CHECKLIST.md` - Updated Step 2
   - `README.md` - Updated troubleshooting
   - `QUICK_START.md` - Updated Step 3

### API Changes

**Old:**
```typescript
// Constructor took single API key
const client = new RampClient(apiKey);

// Direct Authorization header
headers: { 'Authorization': `Bearer ${apiKey}` }
```

**New:**
```typescript
// Constructor takes client credentials
const client = new RampClient(clientId, clientSecret);

// Automatic OAuth token management
const token = await this.getAccessToken();
headers: { 'Authorization': `Bearer ${token}` }
```

### Token Lifecycle

```
Initial Request
    ↓
Get Access Token
    ↓
POST to /developer/v1/token
    ↓
Receive access_token (valid 10 days)
    ↓
Cache token + expiry
    ↓
Use token for API calls
    ↓
Before expiry (9 days) → Request new token
```

## Environment Variables Summary

You now need **8 total variables** (was 7):

### Firebase (6 variables) - UNCHANGED
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Ramp (2 variables) - CHANGED
- ~~`RAMP_API_KEY`~~ ❌ REMOVED
- `RAMP_CLIENT_ID` ✅ NEW
- `RAMP_CLIENT_SECRET` ✅ NEW

## Troubleshooting

### "Failed to authenticate with Ramp API"
- Verify both `RAMP_CLIENT_ID` and `RAMP_CLIENT_SECRET` are set
- Check credentials are correct (no typos)
- Ensure no extra spaces in environment variables

### "Invalid client credentials"
- Client ID or Secret is wrong
- App may have been deleted in Ramp
- Check the app still exists in Ramp Settings → Developer

### "Insufficient scope"
- Your app needs `transactions:read` scope
- Go to Ramp → Settings → Developer → Your App
- Under Scopes, enable `transactions:read`
- You may need to regenerate credentials

### "Token expired" errors
- Should auto-refresh, but if not:
- Restart the application
- Check server has correct system time

## Security Notes

### Client Secret Protection

⚠️ **The Client Secret is as sensitive as a password**

- Never commit to Git
- Never share publicly
- Store securely in environment variables
- Rotate if exposed

### Scope Principle

The app only requests `transactions:read` - it cannot:
- Modify transactions
- Create cards
- Change settings
- Access other resources

This follows the **principle of least privilege**.

## Migration Checklist

- [ ] Create Ramp Developer App
- [ ] Copy Client ID and Secret
- [ ] Update `.env.local` (local dev)
- [ ] Update Vercel environment variables (production)
- [ ] Remove old `RAMP_API_KEY` variable
- [ ] Redeploy application
- [ ] Test sync functionality
- [ ] Verify transactions load correctly

## Support

If you have issues:
1. Review [docs/RAMP_SETUP.md](./docs/RAMP_SETUP.md)
2. Check Ramp Developer documentation
3. Contact developer-support@ramp.com for Ramp API issues

---

**Updated**: January 2026  
**Breaking Change**: Yes - requires new OAuth credentials  
**Backward Compatible**: No - old API keys will not work
