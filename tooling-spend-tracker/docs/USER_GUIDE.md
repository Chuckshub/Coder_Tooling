# User Guide

Complete guide for using the Tooling Spend Tracker application.

## Table of Contents

1. [Overview](#overview)
2. [Dashboard](#dashboard)
3. [Admin Panel](#admin-panel)
4. [Understanding the Data](#understanding-the-data)
5. [Best Practices](#best-practices)

## Overview

The Tooling Spend Tracker helps you manage software tooling budgets by:
- Syncing transaction data from Ramp
- Comparing actual spend against budgeted amounts
- Flagging unusual spending patterns
- Identifying unused subscriptions

### Key Concepts

**Roll-Forward Presentation**: Shows how you got from last month to this month
- Prior Month Actual: What you spent last month
- Current Month Budget: What you planned to spend this month
- Current Month Actual: What you actually spent this month
- Variance: Difference between budget and actual (negative = under budget, positive = over budget)

**Known Tooling**: Vendors you've budgeted for
**Non-Budgeted Tooling**: Transactions from vendors not in your budget
**Unused Subscriptions**: Budgeted vendors with no activity this month

## Dashboard

### Accessing the Dashboard

1. From the home page, click **"Dashboard"**
2. Or navigate directly to `/dashboard`

### Dashboard Components

#### 1. Month Selector
- Choose which month to view
- Dropdown shows last 12 months
- Toggle "Show YTD" to display year-to-date columns

#### 2. Action Buttons

**Sync Button**:
- Fetches latest transactions from Ramp
- Only pulls new transactions (no duplicates)
- Shows count of transactions synced

**Export Button**:
- Downloads current view as CSV
- Includes all visible columns
- Opens in Excel/Google Sheets

#### 3. Summary Cards

**Total Budget**: Sum of all active vendor budgets
**Total Actual**: Sum of all actual spend (known + non-budgeted)
**Total Variance**: Difference between actual and budget

#### 4. Known Tooling Table

Main table showing all budgeted vendors:

| Column | Description |
|--------|-------------|
| Vendor Name | Vendor name and category |
| Prior Month | Actual spend from previous month |
| Current Budget | Budgeted amount for current month |
| Current Actual | Actual spend for current month |
| Variance | Difference ($ and %) between budget and actual |
| Status | Visual indicator of budget status |
| YTD Budget | Year-to-date budgeted amount (if YTD enabled) |
| YTD Actual | Year-to-date actual spend (if YTD enabled) |
| YTD Variance | Year-to-date variance (if YTD enabled) |

**Status Indicators**:
- 🟢 **On Target**: Within 5% of budget
- 🔴 **Over Budget**: Spending exceeds budget by >5%
- 🟡 **Under Budget**: Spending below budget by >5%
- ⚪ **No Spend**: Zero transactions this month

#### 5. Non-Budgeted Tooling

Table showing transactions from vendors not in your budget list:
- Merchant name as it appears in Ramp
- Total amount spent
- Number of transactions

**What to do**:
- Review these vendors monthly
- If legitimate: Add to your vendor list in Admin
- If one-time: No action needed
- If unauthorized: Investigate with team

#### 6. Unused Subscriptions

Cards showing budgeted vendors with no activity:
- Vendor name
- Category
- Monthly budget amount

**What to do**:
- Verify subscription is still needed
- Consider canceling if unused for multiple months
- May be seasonal (check historical data)

### Using the Dashboard

#### Monthly Review Workflow

1. **Select current month**
2. **Click Sync** to get latest data
3. **Review Summary Cards** for overall picture
4. **Check Known Tooling**:
   - Red flags (over budget) → Investigate
   - Gray flags (no spend) → Move to Unused Subscriptions section
5. **Review Non-Budgeted Tooling**:
   - Decide if vendors should be added to budget
6. **Review Unused Subscriptions**:
   - Mark for cancellation or keep
7. **Export data** for records/reports

#### Year-to-Date Analysis

1. Toggle **"Show YTD"**
2. Review cumulative variances
3. Identify trends (consistently over/under)
4. Adjust budgets for remainder of year

### Sorting and Filtering

- **Click column headers** to sort
- Click again to reverse sort direction
- Sort by variance to find biggest discrepancies

## Admin Panel

### Accessing Admin

1. From home page, click **"Admin"**
2. Or navigate to `/admin`

### Managing Vendors

#### Adding a New Vendor

1. Click **"Add Vendor"** button
2. Fill in the form:
   - **Vendor Name**: Official vendor name (e.g., "GitHub")
   - **Monthly Budget**: Expected monthly cost in dollars
   - **Category**: Type of tool (e.g., "Development", "Analytics")
   - **Alternative Names**: Comma-separated list of name variations (e.g., "Github, GitHub Inc, GitHub.com")
   - **Notes**: Optional notes about this vendor
3. Click **"Create"**

**Tips for Alternative Names**:
- Include common misspellings
- Add abbreviations (e.g., "AWS, Amazon Web Services")
- Include company suffixes (Inc, LLC, Corp)
- Check actual merchant name in Ramp first

#### Editing a Vendor

1. Find vendor in the table
2. Click the **edit icon** (pencil)
3. Update any fields
4. Toggle **Active/Inactive** status
5. Click **"Update"**

**When to mark inactive**:
- Subscription canceled
- Tool no longer in use
- Consolidating vendors

Inactive vendors:
- Don't appear in budget calculations
- Historical data is preserved
- Can be reactivated anytime

#### Deleting a Vendor

1. Find vendor in the table
2. Click the **trash icon**
3. Confirm deletion

This is a **soft delete** (vendor marked inactive, not removed from database).

#### Searching Vendors

Use the search box to filter by:
- Vendor name
- Category
- Alternative names

### Bulk Operations

#### CSV Import (Future Feature)

Planned functionality to import multiple vendors at once from CSV file.

## Understanding the Data

### How Matching Works

The application uses fuzzy matching to map Ramp transactions to vendors:

1. **Exact match**: "GitHub" matches "GitHub"
2. **Alternative names**: "Github, Inc" matches vendor with alt name "Github"
3. **Fuzzy match**: "Github Marketplace" matches "GitHub" (70%+ confidence)
4. **No match**: Transaction appears in Non-Budgeted Tooling

### Variance Calculation

```
Variance = Actual Spend - Budgeted Amount

Positive variance = Over budget (bad)
Negative variance = Under budget (good)
```

**Variance Percentage**:
```
Variance % = (Variance / Budget) × 100
```

### YTD Calculations

**YTD Budget** = Monthly Budget × Months Elapsed This Year

Example: $100/month budget in March (month 3)
- YTD Budget = $100 × 3 = $300

**YTD Actual** = Sum of all actual spend from Jan 1 to current month

**YTD Variance** = YTD Actual - YTD Budget

### Roll-Forward Logic

The dashboard shows a roll-forward view:

```
Prior Month Actual → What you spent last month
+ Current Month Budget → What you planned to spend
= Expected Current Month → What you expect to see
---
Current Month Actual → What you actually spent
= Variance → Difference from expectation
```

This format helps you see:
- How spending is trending month-over-month
- Whether current month is on track
- Where to focus attention

## Best Practices

### Setting Up Budgets

1. **Start conservative**: Better to be under budget than over
2. **Use historical data**: Review last 3-6 months of Ramp data
3. **Round up**: Build in a small buffer (5-10%)
4. **Review quarterly**: Adjust based on actual usage

### Managing Vendors

1. **Keep alternative names current**: Update as you see new merchant names
2. **Use consistent categories**: Standardize category names
3. **Add notes**: Document pricing changes, contract dates
4. **Archive unused vendors**: Keep list clean

### Monthly Workflow

**Week 1** (after month end):
1. Sync previous month's transactions
2. Review dashboard
3. Map any new non-budgeted vendors

**Week 2**:
1. Investigate variances > 20%
2. Update notes on vendors with changes
3. Review unused subscriptions

**Week 3**:
1. Plan budget adjustments for next quarter
2. Export data for financial reporting
3. Document any anomalies

**Week 4**:
1. Update budgets if needed
2. Archive any canceled vendors

### Interpreting Flags

**🔴 Over Budget**:
- Check if one-time charge or recurring increase
- Verify with vendor contact/billing
- Update budget if permanently higher
- Investigate if unexpected

**🟡 Under Budget**:
- May indicate partial usage
- Could be annual billing in different month
- Might be ramping down usage
- Generally good, but verify tool is still in use

**⚪ No Spend**:
- Check if subscription is needed
- Verify billing cycle (some charge quarterly/annually)
- May indicate tool not being used
- Candidate for cancellation

### Data Quality

**Ensuring Accurate Matching**:
1. Review Non-Budgeted Tooling regularly
2. Add vendors as you discover them
3. Update alternative names when merchants change
4. Manually verify fuzzy matches occasionally

**Handling Edge Cases**:
- **Refunds**: Appear as negative transactions
- **Annual bills**: Spike one month, zero others
- **Name changes**: Update alternative names
- **Multiple merchants**: One vendor, many merchant names

## Troubleshooting

### Dashboard showing $0 for all vendors
- Sync hasn't been run for this month
- No transactions in Ramp for this period
- Check if transactions are settled (not pending)

### Vendor not matching transactions
- Add alternative names that match Ramp merchant name
- Check spelling/capitalization
- Review merchant name in Ramp dashboard

### YTD numbers seem wrong
- Verify transactions synced for all months YTD
- Check if vendor was added mid-year
- Review transaction date ranges

### Export not working
- Disable popup blocker
- Try different browser
- Check browser console for errors

## Tips and Tricks

1. **Use YTD view for quarterly reviews**: Better long-term picture
2. **Export monthly for records**: Keep CSV archives
3. **Set calendar reminders**: Sync first week of each month
4. **Review top 10 vendors first**: Focus on biggest budget items
5. **Track non-budgeted vendors**: May reveal shadow IT
6. **Compare YoY**: Use exports to compare year-over-year

## FAQs

**Q: How often should I sync?**
A: Monthly after month-end, or weekly for current month if you need real-time data.

**Q: What if a vendor changes their name?**
A: Add the new name to alternative names. Historical data will remain intact.

**Q: Can I change budget mid-month?**
A: Yes, but variance will calculate against new budget immediately.

**Q: What about annual subscriptions?**
A: Budget the monthly amount (annual / 12), expect large variance in billing month.

**Q: How do I handle refunds?**
A: They appear as negative amounts and reduce the month's actual spend.

**Q: Can I delete transactions?**
A: Currently no, but you can update vendor mapping or mark vendor inactive.

## Getting Help

- Check [README.md](../README.md) for technical details
- Review [Firebase Setup](./FIREBASE_SETUP.md) for configuration
- See [Ramp Setup](./RAMP_SETUP.md) for API issues
- Open GitHub issue for bugs or feature requests
