import Fuse from 'fuse.js';
import { Vendor, Transaction, RampTransaction } from '@/types';

/**
 * Fuzzy match a merchant name to a list of vendors
 * Uses Fuse.js for fuzzy string matching
 */
export class VendorMatcher {
  private fuse: Fuse<Vendor>;
  private vendors: Vendor[];

  constructor(vendors: Vendor[]) {
    this.vendors = vendors;
    
    // Create searchable list including alternative names
    const searchableVendors = vendors.flatMap(vendor => [
      { ...vendor, searchName: vendor.name },
      ...vendor.alternativeNames.map(altName => ({
        ...vendor,
        searchName: altName,
      })),
    ]);

    this.fuse = new Fuse(searchableVendors, {
      keys: ['searchName'],
      threshold: 0.3, // 0 = exact match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 3,
    });
  }

  /**
   * Find the best matching vendor for a merchant name
   * @param merchantName - The merchant name from Ramp
   * @returns Matched vendor and confidence score, or null if no match
   */
  match(merchantName: string): { vendor: Vendor; confidence: number } | null {
    const results = this.fuse.search(merchantName);

    if (results.length === 0) {
      return null;
    }

    const bestMatch = results[0];
    const confidence = 1 - (bestMatch.score || 0); // Convert score to confidence (higher is better)

    // Only return matches with confidence above 60%
    if (confidence < 0.6) {
      return null;
    }

    return {
      vendor: bestMatch.item,
      confidence,
    };
  }

  /**
   * Match multiple transactions to vendors
   * @param transactions - Array of Ramp transactions
   * @returns Map of transaction ID to vendor match
   */
  matchTransactions(
    transactions: RampTransaction[]
  ): Map<string, { vendor: Vendor; confidence: number } | null> {
    const matches = new Map<string, { vendor: Vendor; confidence: number } | null>();

    transactions.forEach(transaction => {
      const match = this.match(transaction.merchant_name);
      matches.set(transaction.id, match);
    });

    return matches;
  }

  /**
   * Get suggested matches for a merchant name (top 3)
   * @param merchantName - The merchant name from Ramp
   * @returns Array of potential matches with confidence scores
   */
  getSuggestions(merchantName: string): Array<{ vendor: Vendor; confidence: number }> {
    const results = this.fuse.search(merchantName, { limit: 3 });

    return results.map(result => ({
      vendor: result.item,
      confidence: 1 - (result.score || 0),
    })).filter(match => match.confidence >= 0.3); // Lower threshold for suggestions
  }

  /**
   * Update the vendor list (useful when vendors are added/updated)
   * @param vendors - New vendor list
   */
  updateVendors(vendors: Vendor[]): void {
    this.vendors = vendors;
    
    const searchableVendors = vendors.flatMap(vendor => [
      { ...vendor, searchName: vendor.name },
      ...vendor.alternativeNames.map(altName => ({
        ...vendor,
        searchName: altName,
      })),
    ]);

    this.fuse.setCollection(searchableVendors);
  }
}

/**
 * Simple normalization for merchant names
 * Removes common suffixes, extra spaces, special characters
 */
export const normalizeMerchantName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+(inc|llc|corp|corporation|ltd|limited|co)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Check if two merchant names are likely the same
 * Simple string similarity check
 */
export const areSimilarMerchants = (name1: string, name2: string): boolean => {
  const normalized1 = normalizeMerchantName(name1);
  const normalized2 = normalizeMerchantName(name2);

  // Exact match after normalization
  if (normalized1 === normalized2) {
    return true;
  }

  // One contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  return false;
};

/**
 * Group transactions by merchant name
 * Groups similar merchant names together
 */
export const groupTransactionsByMerchant = (
  transactions: Transaction[]
): Map<string, Transaction[]> => {
  const groups = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    const normalizedName = normalizeMerchantName(transaction.merchantName);
    
    // Check if we already have a similar merchant name
    let foundGroup = false;
    for (const [groupName, groupTransactions] of groups.entries()) {
      if (areSimilarMerchants(normalizedName, groupName)) {
        groupTransactions.push(transaction);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      groups.set(normalizedName, [transaction]);
    }
  });

  return groups;
};
