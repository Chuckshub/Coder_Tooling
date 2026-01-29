# Ramp API Setup Guide

This guide explains how to obtain and configure your Ramp API credentials for the Tooling Spend Tracker.

## 1. Get Ramp API Access

### Prerequisites
- You must be a Ramp customer
- You need admin or developer access to your Ramp account

### Obtaining API Key

1. Log into your [Ramp dashboard](https://app.ramp.com/)
2. Navigate to **Settings** → **Developer**
3. Click **"Generate API Key"** or **"Create Token"**
4. Give your token a descriptive name (e.g., "Tooling Spend Tracker")
5. Select appropriate scopes/permissions:
   - ✅ Read transactions
   - ✅ Read card details
   - ❌ Write permissions (not needed)
6. Copy the API key immediately (you won't be able to see it again)

### Important Security Notes

⚠️ **Never commit your API key to version control**
- Always use environment variables
- Add `.env.local` to your `.gitignore`
- Rotate keys if exposed

## 2. Configure Environment Variable

Add your Ramp API key to `.env.local`:

```bash
RAMP_API_KEY=your_ramp_api_key_here
```

## 3. Verify API Access

Test your API connection by running the application:

```bash
npm run dev
```

Go to the dashboard and click the "Sync" button. If transactions sync successfully, your API is configured correctly.

## 4. Ramp API Details

### API Documentation
- Official Docs: https://docs.ramp.com/reference/rest/
- API Base URL: `https://api.ramp.com/v1`

### Rate Limits
- Ramp enforces rate limits on API requests
- The application handles pagination automatically
- Avoid syncing large date ranges too frequently

### Transaction States
The app filters for `CLEARED` transactions by default:
- `CLEARED`: Settled transactions (included)
- `PENDING`: Not yet settled (excluded)
- `DECLINED`: Declined transactions (excluded)

### Available Data Points

The app extracts:
- `merchant_name`: Vendor/merchant name
- `amount`: Transaction amount (negative for charges)
- `card_holder`: Employee name
- `settled_at`: Settlement date
- `user_transaction_time`: Transaction timestamp
- `sk_category_name`: Ramp's category
- `memo`: Transaction notes
- `card_id`: Last 4 digits of card

## 5. Filtering Transactions

### By Date Range
The sync functionality allows filtering by month or date range:

```typescript
// Sync specific month
await syncTransactionsForMonth(2024, 1); // January 2024

// Sync date range
await syncTransactionsForDateRange(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

### By Merchant
To filter by specific merchants, you can extend the Ramp client:

```typescript
const transactions = await rampClient.getTransactionsByMerchant(
  'GitHub',
  '2024-01-01',
  '2024-12-31'
);
```

## 6. Best Practices

### Sync Frequency
- **Initial Setup**: Sync last 12 months of historical data
- **Ongoing**: Sync monthly after month-end
- **Real-time**: Sync current month as needed for up-to-date data

### Error Handling
The app handles common errors:
- **401**: Invalid API key
- **403**: Insufficient permissions
- **429**: Rate limit exceeded
- **500**: Ramp server error

### Data Retention
- Transactions are cached in Firebase
- Re-syncing the same period won't create duplicates
- Update vendor mappings by re-running sync after vendor changes

## 7. Troubleshooting

### "Authentication failed" error
- Verify API key is correct
- Check key hasn't been revoked in Ramp dashboard
- Ensure no extra spaces in `.env.local`

### "Rate limit exceeded" error
- Wait a few minutes before retrying
- Reduce sync frequency
- Contact Ramp support for higher limits

### Transactions not appearing
- Verify date range includes settled transactions
- Check transaction state is `CLEARED`
- Review Ramp dashboard to confirm transactions exist

### Merchant names not matching
- Add alternative names to vendors in admin panel
- Check exact merchant name in Ramp
- Adjust fuzzy matching threshold if needed

## 8. Advanced Configuration

### Custom Filtering

Modify `lib/ramp/client.ts` to add custom filters:

```typescript
async getTransactions(params: {
  start?: string;
  end?: string;
  merchantName?: string;
  state?: 'CLEARED' | 'PENDING' | 'DECLINED';
  limit?: number;
  // Add custom filters here
  cardId?: string;
  userId?: string;
  minAmount?: number;
}) {
  // Implementation
}
```

### Webhook Integration (Future)

For real-time updates, consider Ramp webhooks:
1. Set up webhook endpoint in your app
2. Configure webhook in Ramp dashboard
3. Process incoming transaction events
4. Auto-sync new transactions

## Next Steps

After Ramp is configured:
1. Add vendors in the Admin panel
2. Run your first sync
3. Review the dashboard
4. Set up regular sync schedule
