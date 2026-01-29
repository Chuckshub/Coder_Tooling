import { format } from 'date-fns';
import { createRampClient } from '../ramp/client';
import { VendorMatcher } from '../utils/vendorMatcher';
import {
  batchCreateTransactions,
  transactionExistsByRampId,
} from '../firebase/transactions';
import { getAllVendors } from '../firebase/vendors';
import { RampTransaction, Transaction } from '@/types';
import { getMonthString } from '../utils/comparisonLogic';

/**
 * Sync transactions from Ramp to Firebase for a specific month
 */
export const syncTransactionsForMonth = async (
  year: number,
  month: number
): Promise<{
  success: boolean;
  transactionsSynced: number;
  error?: string;
}> => {
  try {
    // Get Ramp client
    const rampClient = createRampClient();

    // Fetch transactions from Ramp
    const rampTransactions = await rampClient.getTransactionsByMonth(year, month);

    // Get all vendors for matching
    const vendors = await getAllVendors(true);
    const matcher = new VendorMatcher(vendors);

    // Filter out transactions that already exist
    const newTransactions: RampTransaction[] = [];
    for (const transaction of rampTransactions) {
      const exists = await transactionExistsByRampId(transaction.id);
      if (!exists) {
        newTransactions.push(transaction);
      }
    }

    if (newTransactions.length === 0) {
      return {
        success: true,
        transactionsSynced: 0,
      };
    }

    // Match transactions to vendors
    const matches = matcher.matchTransactions(newTransactions);

    // Convert Ramp transactions to our Transaction format
    const transactions: Omit<Transaction, 'id' | 'createdAt'>[] = newTransactions.map(
      rampTxn => {
        const match = matches.get(rampTxn.id);
        const transactionDate = new Date(
          rampTxn.settled_at || rampTxn.user_transaction_time
        );

        return {
          vendorId: match?.vendor.id,
          merchantName: rampTxn.merchant_name,
          amount: Math.abs(rampTxn.amount), // Ramp amounts are negative for charges
          date: transactionDate,
          month: getMonthString(transactionDate),
          description: rampTxn.memo,
          rampTransactionId: rampTxn.id,
          category: rampTxn.sk_category_name,
          cardLastFour: rampTxn.card_id.slice(-4),
          employeeName: `${rampTxn.card_holder.first_name} ${rampTxn.card_holder.last_name}`,
        };
      }
    );

    // Batch create transactions in Firebase
    await batchCreateTransactions(transactions);

    return {
      success: true,
      transactionsSynced: transactions.length,
    };
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return {
      success: false,
      transactionsSynced: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Sync transactions for date range
 */
export const syncTransactionsForDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<{
  success: boolean;
  transactionsSynced: number;
  error?: string;
}> => {
  try {
    // Get Ramp client
    const rampClient = createRampClient();

    // Fetch transactions from Ramp
    const rampTransactions = await rampClient.getTransactionsByDateRange(
      startDate,
      endDate
    );

    // Get all vendors for matching
    const vendors = await getAllVendors(true);
    const matcher = new VendorMatcher(vendors);

    // Filter out transactions that already exist
    const newTransactions: RampTransaction[] = [];
    for (const transaction of rampTransactions) {
      const exists = await transactionExistsByRampId(transaction.id);
      if (!exists) {
        newTransactions.push(transaction);
      }
    }

    if (newTransactions.length === 0) {
      return {
        success: true,
        transactionsSynced: 0,
      };
    }

    // Match transactions to vendors
    const matches = matcher.matchTransactions(newTransactions);

    // Convert Ramp transactions to our Transaction format
    const transactions: Omit<Transaction, 'id' | 'createdAt'>[] = newTransactions.map(
      rampTxn => {
        const match = matches.get(rampTxn.id);
        const transactionDate = new Date(
          rampTxn.settled_at || rampTxn.user_transaction_time
        );

        return {
          vendorId: match?.vendor.id,
          merchantName: rampTxn.merchant_name,
          amount: Math.abs(rampTxn.amount),
          date: transactionDate,
          month: getMonthString(transactionDate),
          description: rampTxn.memo,
          rampTransactionId: rampTxn.id,
          category: rampTxn.sk_category_name,
          cardLastFour: rampTxn.card_id.slice(-4),
          employeeName: `${rampTxn.card_holder.first_name} ${rampTxn.card_holder.last_name}`,
        };
      }
    );

    // Batch create transactions in Firebase
    await batchCreateTransactions(transactions);

    return {
      success: true,
      transactionsSynced: transactions.length,
    };
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return {
      success: false,
      transactionsSynced: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Test Ramp API connection
 */
export const testRampConnection = async (): Promise<boolean> => {
  try {
    const rampClient = createRampClient();
    return await rampClient.testConnection();
  } catch (error) {
    console.error('Error testing Ramp connection:', error);
    return false;
  }
};
