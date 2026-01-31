# Ramp API Connector - Secure OAuth 2.0 Integration

A production-ready React application with secure backend authentication for the Ramp API. All secrets are stored in Vercel environment variables - **nothing sensitive in the code**.

## 🎯 Current Features (v0.2)

- ✅ OAuth 2.0 Authorization Code Flow with secure backend
- ✅ **No secrets in code** - all credentials in Vercel environment variables
- ✅ Serverless backend API routes for token exchange
- ✅ Token refresh functionality
- ✅ Request and display access tokens
- ✅ Token storage in localStorage
- ✅ Test token with real API call
- ✅ CSRF protection with state parameter
- ✅ Clean, modern UI with error handling

## 🔒 Security Features

- **Client Secret Protection**: Never exposed to frontend
- **Backend Token Exchange**: All OAuth flows handled server-side
- **Environment Variables**: Secrets stored securely in Vercel
- **HTTPS Only**: Enforced through Vercel deployment
- **CSRF Protection**: State parameter validation

## 📋 Prerequisites

Before you begin, you need:

1. **Ramp Account** with API access
2. **Ramp Developer App** configured at: https://app.ramp.com/settings/developer
3. **Vercel Account** (free tier works perfectly)
4. **Client ID and Client Secret** from your Ramp Developer App

## 🚀 Quick Start

### Step 1: Get Your Ramp Credentials

1. Go to https://app.ramp.com/settings/developer
2. Create a new OAuth app or use an existing one
3. Copy your **Client ID** (starts with `clnt_`)
4. Copy your **Client Secret** (keep this secret!)
5. Note these down - you'll add them to Vercel

### Step 2: Deploy to Vercel

#### Option A: One-Click Deploy (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from this directory
vercel

# Follow prompts and deploy
```

#### Option B: GitHub Integration
1. Push this code to a GitHub repository
2. Go to https://vercel.com/new
3. Import your repository
4. Deploy (don't worry about env vars yet)

### Step 3: Configure Environment Variables in Vercel

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
RAMP_CLIENT_ID = clnt_your_actual_client_id_here
RAMP_CLIENT_SECRET = your_actual_client_secret_here
```

**Important**: Add these to **all environments** (Production, Preview, Development)

4. Redeploy to apply changes:
   - Go to **Deployments** tab
   - Click ⋯ menu on latest deployment
   - Click **Redeploy**

### Step 4: Configure Ramp Redirect URI

1. Go back to https://app.ramp.com/settings/developer
2. Find your OAuth app
3. Add your Vercel deployment URL as a redirect URI:
   ```
   https://your-project-name.vercel.app/
   ```
   (Include the trailing slash!)

### Step 5: Test It!

1. Visit your Vercel URL
2. You should see "✅ Client ID loaded from backend" status
3. Click "Request Access Token from Ramp"
4. Authorize on Ramp
5. You'll be redirected back with a token!
6. Click "Test Token" to verify it works

## 🔧 How It Works

### Architecture

```
Frontend (Browser)
    ↓ (1) User clicks button
    ↓ (2) Redirect to Ramp
Ramp Authorization
    ↓ (3) User authorizes
    ↓ (4) Redirect back with code
Frontend (Browser)
    ↓ (5) Send code to backend
Backend API (/api/auth/token)
    ↓ (6) Exchange code for token (with secret)
Ramp API
    ↓ (7) Return access token
Backend API
    ↓ (8) Return token to frontend
Frontend (Browser)
    ↓ (9) Display & store token
```

### File Structure

```
.
├── index.html              # Frontend React app
├── api/
│   ├── config.js          # Provides client ID to frontend
│   ├── auth/
│   │   ├── token.js       # Handles token exchange
│   │   └── refresh.js     # Handles token refresh
├── vercel.json            # Vercel configuration
├── package.json           # npm configuration
├── README.md              # This file
└── SETUP.md              # Detailed setup guide
```

## 📝 API Endpoints

### Backend API Routes (Serverless)

- **GET /api/config** - Returns client ID
- **POST /api/auth/token** - Exchanges authorization code for access token
- **POST /api/auth/refresh** - Refreshes an expired access token

### Ramp API Endpoints

- **Authorization**: `https://app.ramp.com/v1/authorize`
- **Token Exchange**: `https://api.ramp.com/developer/v1/token`
- **Test Endpoint**: `https://api.ramp.com/developer/v1/business`

## 🔑 OAuth Scopes

The app requests these scopes by default:
- `transactions:read` - Read transaction data
- `cards:read` - Read card information  
- `users:read` - Read user information
- `business:read` - Read business information

## 🧪 Testing Locally

For local development with environment variables:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run locally
vercel dev
```

Visit http://localhost:3000

## 🔐 Environment Variables

All sensitive configuration is stored in Vercel environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `RAMP_CLIENT_ID` | Your Ramp OAuth Client ID | `clnt_abc123...` |
| `RAMP_CLIENT_SECRET` | Your Ramp OAuth Client Secret | `secret_xyz789...` |

**Never commit these values to git!**

## 🗺️ Roadmap

### Next Steps (v0.2)
- [ ] Backend token exchange endpoint
- [ ] Secure token storage
- [ ] Token refresh implementation
- [ ] Dynamic scope selection

### Future Features
- [ ] Transaction listing
- [ ] Card management
- [ ] Real-time data updates
- [ ] Multi-entity support
- [ ] Export functionality

## 📚 Resources

- [Ramp API Documentation](https://docs.ramp.com/developer-api/v1/introduction)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Ramp Developer Portal](https://app.ramp.com/settings/developer)

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and modify for your needs.

## ⚖️ License

MIT License - feel free to use this code as a starting point for your own projects.

## 🐛 Troubleshooting

### "Please configure your RAMP_CLIENT_ID"
- Update line 23 in `index.html` with your actual Client ID

### "Redirect URI mismatch"
- Ensure the redirect URI in Ramp Developer Settings matches exactly where you're running the app
- Include the full URL including protocol (http/https) and trailing slash if present

### "Invalid client"
- Double-check your Client ID is correct
- Ensure your Ramp Developer App is active

### Token exchange fails
- This is expected without a backend implementation
- See Security Considerations section above

### CORS errors
- Ramp API requires proper authentication
- Some endpoints may not work from browser due to CORS
- Consider implementing a backend proxy

## 📧 Support

For Ramp API questions:
- Email: developer-support@ramp.com
- Documentation: https://docs.ramp.com

## 🎓 Learning Objectives

This project demonstrates:
- OAuth 2.0 Authorization Code flow
- React hooks (useState, useEffect)
- Browser APIs (localStorage, URLSearchParams)
- CSRF protection with state parameter
- Error handling and loading states
- REST API integration
- Modern ES6+ JavaScript

---

**Built with ❤️ for learning Ramp API integration**
