// Core data models for the application

export interface Vendor {
  id: string;
  name: string;
  monthlyBudget: number;
  category: string;
  active: boolean;
  alternativeNames: string[]; // For fuzzy matching
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  vendorId?: string; // Reference to Vendor, null if non-budgeted
  merchantName: string;
  amount: number;
  date: Date;
  month: string; // Format: YYYY-MM
  description?: string;
  rampTransactionId: string;
  category?: string;
  cardLastFour?: string;
  employeeName?: string;
  createdAt: Date;
}

export interface MonthlyActual {
  id: string;
  vendorId: string;
  month: string; // Format: YYYY-MM
  actualAmount: number;
  transactionCount: number;
  lastSyncTimestamp: Date;
  transactions: string[]; // Array of transaction IDs
}

export interface VendorSpendSummary {
  vendor: Vendor;
  priorMonthActual: number;
  currentMonthBudget: number;
  currentMonthActual: number;
  variance: number;
  variancePercent: number;
  ytdActual: number;
  ytdBudget: number;
  ytdVariance: number;
  status: 'over-budget' | 'under-budget' | 'on-target' | 'no-spend';
  transactionCount: number;
}

export interface NonBudgetedVendor {
  merchantName: string;
  currentMonthActual: number;
  transactionCount: number;
  transactions: Transaction[];
  suggestedVendorMatch?: Vendor;
  matchConfidence?: number;
}

export interface DashboardData {
  month: string;
  knownTooling: VendorSpendSummary[];
  nonBudgetedTooling: NonBudgetedVendor[];
  unusedSubscriptions: Vendor[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
}

export interface SyncStatus {
  lastSyncTime: Date;
  status: 'idle' | 'syncing' | 'error';
  message?: string;
  transactionsSynced?: number;
}

// Ramp API Types
export interface RampTransaction {
  id: string;
  merchant_name: string;
  amount: number;
  card_holder: {
    first_name: string;
    last_name: string;
  };
  state: string;
  sk_category_name?: string;
  receipts?: any[];
  memo?: string;
  card_id: string;
  settled_at?: string;
  user_transaction_time: string;
}

export interface RampApiResponse<T> {
  data: T[];
  page: {
    next?: string;
  };
}

// Filter and sort options
export type SortField = 'vendor' | 'budget' | 'actual' | 'variance' | 'variancePercent';
export type SortDirection = 'asc' | 'desc';

export interface DashboardFilters {
  category?: string;
  status?: VendorSpendSummary['status'][];
  searchTerm?: string;
  sortField: SortField;
  sortDirection: SortDirection;
}

// Admin types
export interface VendorMapping {
  id: string;
  rampMerchantName: string;
  vendorId: string;
  confidence: number;
  createdAt: Date;
  createdBy: string;
}

export interface BulkImportRow {
  vendorName: string;
  monthlyBudget: number;
  category: string;
  alternativeNames?: string;
}
