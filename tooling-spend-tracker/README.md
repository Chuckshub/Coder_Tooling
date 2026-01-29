# Tooling Spend Tracker

A comprehensive web application for tracking and comparing software tooling expenses against budgeted amounts, powered by Ramp API and Firebase.

## Features

- **Real-time Ramp Integration**: Automatic sync of transaction data from Ramp API
- **Intelligent Vendor Matching**: Fuzzy matching algorithm to map transactions to known vendors
- **Roll-Forward Presentation**: Accounting-style comparison showing Prior Month + Budget = Expected, then Actual and Variance
- **Multi-Level Tracking**:
  - Known tooling with budgets
  - Non-budgeted tooling (flagged for review)
  - Unused subscriptions (budgeted but no spend)
- **Year-to-Date Analysis**: Cumulative tracking with YTD variances
- **Export Functionality**: CSV export for further analysis
- **Admin Panel**: Full CRUD operations for vendor management

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **APIs**: Ramp API for transaction data
- **Deployment**: Vercel
- **Key Libraries**:
  - `fuse.js` for fuzzy matching
  - `date-fns` for date manipulation
  - `lucide-react` for icons
  - `recharts` for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Ramp API credentials

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `RAMP_CLIENT_ID` (OAuth 2.0 Client ID)
- `RAMP_CLIENT_SECRET` (OAuth 2.0 Client Secret)

3. Configure Firebase:

See [Firebase Setup Guide](./docs/FIREBASE_SETUP.md) for detailed instructions.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Initial Setup

1. **Configure Firebase**:
   - Create collections: `vendors`, `transactions`
   - Set up Firestore indexes (see Firebase Setup Guide)
   - Configure security rules

2. **Add Vendors**:
   - Navigate to `/admin`
   - Click "Add Vendor" to create your first vendor
   - Add monthly budget, category, and alternative names

3. **Sync Transactions**:
   - Go to `/dashboard`
   - Select a month
   - Click "Sync" to pull transactions from Ramp

## Project Structure

```
tooling-spend-tracker/
├── app/
│   ├── api/              # API routes
│   │   ├── dashboard/    # Dashboard data endpoint
│   │   ├── sync/         # Ramp sync endpoint
│   │   └── vendors/      # Vendor CRUD endpoints
│   ├── dashboard/        # Dashboard page
│   ├── admin/            # Admin panel page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── dashboard/        # Dashboard-specific components
│   ├── admin/            # Admin panel components
│   ├── ui/               # Reusable UI components
│   └── common/           # Shared components
├── lib/
│   ├── firebase/         # Firebase configuration and data access
│   ├── ramp/             # Ramp API client
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── types/
│   └── index.ts          # TypeScript type definitions
└── docs/                 # Documentation
```

## Usage

### Dashboard

1. Select a month using the dropdown
2. Toggle "Show YTD" to display year-to-date columns
3. Click "Sync" to fetch latest transactions from Ramp
4. Click "Export" to download CSV report

The dashboard displays:
- **Summary cards**: Total budget, actual spend, and variance
- **Known Tooling table**: Vendors with budgets, showing roll-forward comparison
- **Non-Budgeted Tooling**: Transactions from vendors not in your master list
- **Unused Subscriptions**: Budgeted vendors with no activity

### Admin Panel

**Adding Vendors**:
1. Click "Add Vendor"
2. Enter vendor name, monthly budget, and category
3. Add alternative names for better matching (e.g., "Github, GitHub Inc")
4. Save

**Editing Vendors**:
1. Click edit icon next to vendor
2. Update fields
3. Toggle active/inactive status
4. Save changes

**Deleting Vendors**:
- Click trash icon to archive (soft delete)
- Archived vendors won't appear in budget calculations

## API Routes

### GET /api/dashboard
Fetch dashboard data for a specific month.

Query params: `month` (YYYY-MM format)

### POST /api/sync
Sync transactions from Ramp for a specific month.

Body: `{ year: number, month: number }`

### GET /api/vendors
Get all vendors.

Query params: `activeOnly` (boolean)

### POST /api/vendors
Create a new vendor.

### GET /api/vendors/[id]
Get a specific vendor.

### PUT /api/vendors/[id]
Update a vendor.

### DELETE /api/vendors/[id]
Archive a vendor (soft delete).

## Data Models

### Vendor
- ID, name, monthly budget, category
- Alternative names for matching
- Active/inactive status
- Notes and timestamps

### Transaction
- Ramp transaction data
- Vendor mapping (if matched)
- Amount, date, merchant name
- Employee and card information

### VendorSpendSummary
- Roll-forward calculation results
- Prior month, budget, actual, variance
- YTD totals and status flags

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Add all variables from `.env.local` to your Vercel project settings.

## Firestore Security Rules

See [docs/FIRESTORE_RULES.md](./docs/FIRESTORE_RULES.md) for recommended security rules.

## Troubleshooting

### Transactions not syncing
- Verify RAMP_CLIENT_ID and RAMP_CLIENT_SECRET are correct
- Check Ramp API rate limits
- Review API error logs
- Ensure `transactions:read` scope is enabled in your Ramp app

### Vendor matching not working
- Add alternative names to vendor
- Check merchant name in Ramp
- Adjust fuzzy matching threshold in `vendorMatcher.ts`

### Firebase connection issues
- Verify all Firebase env variables are set
- Check Firebase project permissions
- Ensure Firestore is enabled

## Future Enhancements

- [ ] Email alerts for budget variances
- [ ] Trend charts and analytics
- [ ] Multi-user authentication
- [ ] Bulk vendor import (CSV)
- [ ] Manual transaction categorization
- [ ] Budget forecasting
- [ ] Slack/Teams notifications
- [ ] Role-based access control

## License

ISC

## Support

For issues or questions, please open a GitHub issue.
