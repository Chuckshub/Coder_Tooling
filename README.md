# Ramp API Integration - Vercel App

A Next.js application that integrates with the Ramp API to fetch transaction data with comprehensive debugging and logging.

## Features

- ✅ Client Credentials OAuth flow for Ramp API
- ✅ Secure token storage in HTTP-only cookies
- ✅ Transaction data retrieval with filtering options
- ✅ Comprehensive debugging at every step
- ✅ Real-time debug log in UI
- ✅ Server-side console logging for Vercel logs
- ✅ Error handling with detailed diagnostics
- ✅ TypeScript for type safety

## Prerequisites

1. **Ramp API Credentials**
   - Go to https://app.ramp.com/developer
   - Create a new application
   - Note your Client ID and Client Secret
   - Set the redirect URI (if needed): `https://your-app.vercel.app/api/auth/callback`

2. **Node.js** (v18 or higher)
3. **Vercel account** (for deployment)

## Local Development Setup

### 1. Clone or Create Repository

```bash
# If using GitHub, clone your repo:
git clone https://github.com/your-username/ramp-vercel-app.git
cd ramp-vercel-app

# Or create a new directory:
mkdir ramp-vercel-app
cd ramp-vercel-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Ramp API Credentials
RAMP_CLIENT_ID=your_client_id_here
RAMP_CLIENT_SECRET=your_client_secret_here

# OAuth Configuration
RAMP_TOKEN_URL=https://api.ramp.com/v1/public/customer/token
RAMP_API_BASE=https://api.ramp.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/ramp-vercel-app.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Configure Environment Variables in Vercel:**
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the following variables:
     - `RAMP_CLIENT_ID` → your client ID
     - `RAMP_CLIENT_SECRET` → your client secret
     - `RAMP_TOKEN_URL` → `https://api.ramp.com/v1/public/customer/token`
     - `RAMP_API_BASE` → `https://api.ramp.com`
     - `NEXT_PUBLIC_APP_URL` → your Vercel app URL (e.g., `https://your-app.vercel.app`)

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Usage

### 1. Get Access Token

Click the "Get Access Token" button to authenticate with Ramp API using client credentials flow.

**What happens:**
- App sends POST request to `/api/auth/token`
- Server exchanges client credentials for access token
- Token is stored in HTTP-only cookie
- Token info is displayed in UI

**Debug output:**
- Request/response timing
- HTTP status codes
- Token metadata (type, expiration, scope)
- Full request/response logs in Vercel

### 2. Fetch Transactions

After obtaining a token, click "Fetch Transactions" to retrieve transaction data.

**What happens:**
- App sends GET request to `/api/transactions`
- Server uses stored token to call Ramp API
- Transaction data is displayed in table format
- Debug information shows in log panel

**Debug output:**
- API endpoint and parameters
- Response time and status
- Transaction count
- Sample transaction data
- Full request/response logs

## API Endpoints

### `POST /api/auth/token`

Requests an access token from Ramp API using client credentials.

**Response:**
```json
{
  "success": true,
  "data": {
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "transactions:read",
    "obtained_at": "2026-01-29T..."
  },
  "debug": {
    "requestTime": 234,
    "timestamp": "2026-01-29T..."
  }
}
```

### `GET /api/transactions`

Fetches transactions from Ramp API.

**Query Parameters:**
- `from_date` (optional): ISO date string
- `to_date` (optional): ISO date string
- `limit` (optional): Number of transactions (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_...",
      "amount": 5000,
      "merchant_name": "Coffee Shop",
      "card_holder": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "state": "CLEARED",
      "sk_category_name": "Food & Beverage"
    }
  ],
  "debug": {
    "requestTime": 456,
    "count": 1,
    "timestamp": "2026-01-29T..."
  }
}
```

## Debugging

### Client-Side Debugging

The UI includes a real-time debug log panel that shows:
- Request initiation
- HTTP status codes
- Success/error messages
- Response timing
- Data counts

### Server-Side Debugging

Check Vercel deployment logs for detailed server-side debugging:

1. Go to your Vercel dashboard
2. Select your project
3. Click on a deployment
4. View "Functions" tab for API route logs

**Server logs include:**
- Full request/response details
- HTTP headers
- Request/response bodies
- Token information (truncated for security)
- Error stack traces
- Timing information

### Common Issues

**"No access token found"**
- Token may have expired (default: 1 hour)
- Cookie was cleared
- Solution: Click "Get Access Token" again

**"Token request failed"**
- Check that `RAMP_CLIENT_ID` and `RAMP_CLIENT_SECRET` are correct
- Verify credentials in Ramp developer portal
- Check Vercel logs for detailed error

**"Ramp API request failed"**
- Token may be expired
- Insufficient permissions/scope
- Check Vercel logs for API response details

## Security Notes

1. **Never commit `.env` or `.env.local` files** - they contain secrets
2. **Use environment variables in Vercel** - don't hardcode credentials
3. **HTTP-only cookies** - prevents XSS attacks on tokens
4. **Token expiration** - tokens automatically expire after 1 hour
5. **HTTPS in production** - Vercel provides this automatically

## Project Structure

```
ramp-vercel-app/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── token/
│   │   │   │   └── route.ts        # Token request endpoint
│   │   │   └── callback/
│   │   │       └── route.ts        # OAuth callback (future use)
│   │   └── transactions/
│   │       └── route.ts            # Transactions endpoint
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main UI page
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Ramp API** - Transaction data
- **Vercel** - Deployment platform

## License

MIT

## Support

For Ramp API documentation, visit: https://docs.ramp.com/developer-api/v1/introduction

For Vercel deployment issues, visit: https://vercel.com/docs
