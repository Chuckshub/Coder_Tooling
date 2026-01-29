import { format, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import {
  Vendor,
  Transaction,
  VendorSpendSummary,
  NonBudgetedVendor,
  DashboardData,
} from '@/types';
import { groupTransactionsByMerchant } from './vendorMatcher';

/**
 * Calculate variance status based on actual vs budget
 */
export const calculateStatus = (
  actual: number,
  budget: number
): VendorSpendSummary['status'] => {
  if (actual === 0) return 'no-spend';
  
  const variance = actual - budget;
  const variancePercent = (variance / budget) * 100;

  if (Math.abs(variancePercent) <= 5) return 'on-target'; // Within 5%
  if (variance > 0) return 'over-budget';
  return 'under-budget';
};

/**
 * Calculate spend summary for a single vendor
 */
export const calculateVendorSpendSummary = (
  vendor: Vendor,
  currentMonthTransactions: Transaction[],
  priorMonthTransactions: Transaction[],
  ytdTransactions: Transaction[],
  currentMonth: Date
): VendorSpendSummary => {
  // Calculate current month actual
  const currentMonthActual = currentMonthTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Calculate prior month actual
  const priorMonthActual = priorMonthTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Calculate YTD actuals
  const ytdActual = ytdTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate YTD budget (months from start of year to current month)
  const monthsSinceYearStart =
    currentMonth.getMonth() - startOfYear(currentMonth).getMonth() + 1;
  const ytdBudget = vendor.monthlyBudget * monthsSinceYearStart;

  // Current month budget is just the monthly budget
  const currentMonthBudget = vendor.monthlyBudget;

  // Calculate variances
  const variance = currentMonthActual - currentMonthBudget;
  const variancePercent =
    currentMonthBudget > 0 ? (variance / currentMonthBudget) * 100 : 0;
  const ytdVariance = ytdActual - ytdBudget;

  // Determine status
  const status = calculateStatus(currentMonthActual, currentMonthBudget);

  return {
    vendor,
    priorMonthActual,
    currentMonthBudget,
    currentMonthActual,
    variance,
    variancePercent,
    ytdActual,
    ytdBudget,
    ytdVariance,
    status,
    transactionCount: currentMonthTransactions.length,
  };
};

/**
 * Group non-budgeted transactions by merchant
 */
export const calculateNonBudgetedVendors = (
  unmatchedTransactions: Transaction[]
): NonBudgetedVendor[] => {
  const grouped = groupTransactionsByMerchant(unmatchedTransactions);
  const nonBudgetedVendors: NonBudgetedVendor[] = [];

  grouped.forEach((transactions, merchantName) => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    nonBudgetedVendors.push({
      merchantName: transactions[0].merchantName, // Use original name from first transaction
      currentMonthActual: total,
      transactionCount: transactions.length,
      transactions,
    });
  });

  // Sort by amount descending
  return nonBudgetedVendors.sort(
    (a, b) => b.currentMonthActual - a.currentMonthActual
  );
};

/**
 * Find unused subscriptions (vendors with no spend in current month)
 */
export const findUnusedSubscriptions = (
  vendors: Vendor[],
  currentMonthTransactions: Transaction[]
): Vendor[] => {
  const vendorsWithSpend = new Set(
    currentMonthTransactions
      .filter(t => t.vendorId)
      .map(t => t.vendorId)
  );

  return vendors.filter(
    vendor => vendor.active && !vendorsWithSpend.has(vendor.id)
  );
};

/**
 * Generate complete dashboard data for a given month
 */
export const generateDashboardData = (
  vendors: Vendor[],
  currentMonthTransactions: Transaction[],
  priorMonthTransactions: Transaction[],
  ytdTransactions: Transaction[],
  currentMonth: Date
): DashboardData => {
  // Separate matched and unmatched transactions
  const matchedTransactions = currentMonthTransactions.filter(t => t.vendorId);
  const unmatchedTransactions = currentMonthTransactions.filter(t => !t.vendorId);

  // Calculate summaries for each vendor
  const knownTooling: VendorSpendSummary[] = vendors
    .filter(v => v.active)
    .map(vendor => {
      const vendorCurrentTransactions = matchedTransactions.filter(
        t => t.vendorId === vendor.id
      );
      const vendorPriorTransactions = priorMonthTransactions.filter(
        t => t.vendorId === vendor.id
      );
      const vendorYtdTransactions = ytdTransactions.filter(
        t => t.vendorId === vendor.id
      );

      return calculateVendorSpendSummary(
        vendor,
        vendorCurrentTransactions,
        vendorPriorTransactions,
        vendorYtdTransactions,
        currentMonth
      );
    });

  // Calculate non-budgeted vendors
  const nonBudgetedTooling = calculateNonBudgetedVendors(unmatchedTransactions);

  // Find unused subscriptions
  const unusedSubscriptions = findUnusedSubscriptions(
    vendors,
    matchedTransactions
  );

  // Calculate totals
  const totalBudget = vendors
    .filter(v => v.active)
    .reduce((sum, v) => sum + v.monthlyBudget, 0);

  const totalActual =
    matchedTransactions.reduce((sum, t) => sum + t.amount, 0) +
    unmatchedTransactions.reduce((sum, t) => sum + t.amount, 0);

  const totalVariance = totalActual - totalBudget;

  return {
    month: format(currentMonth, 'yyyy-MM'),
    knownTooling,
    nonBudgetedTooling,
    unusedSubscriptions,
    totalBudget,
    totalActual,
    totalVariance,
  };
};

/**
 * Get month string for queries (YYYY-MM format)
 */
export const getMonthString = (date: Date): string => {
  return format(date, 'yyyy-MM');
};

/**
 * Get date range for YTD calculations
 */
export const getYTDDateRange = (
  currentMonth: Date
): { start: Date; end: Date } => {
  const start = startOfYear(currentMonth);
  const end = endOfMonth(currentMonth);
  return { start, end };
};

/**
 * Get prior month date
 */
export const getPriorMonth = (currentMonth: Date): Date => {
  return subMonths(currentMonth, 1);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number): string => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/**
 * Get status color for UI
 */
export const getStatusColor = (status: VendorSpendSummary['status']): string => {
  switch (status) {
    case 'over-budget':
      return 'text-red-600 bg-red-50';
    case 'under-budget':
      return 'text-yellow-600 bg-yellow-50';
    case 'on-target':
      return 'text-green-600 bg-green-50';
    case 'no-spend':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

/**
 * Get status label for UI
 */
export const getStatusLabel = (status: VendorSpendSummary['status']): string => {
  switch (status) {
    case 'over-budget':
      return 'Over Budget';
    case 'under-budget':
      return 'Under Budget';
    case 'on-target':
      return 'On Target';
    case 'no-spend':
      return 'No Spend';
    default:
      return 'Unknown';
  }
};
