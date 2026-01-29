import axios, { AxiosInstance } from 'axios';
import { RampTransaction, RampApiResponse } from '@/types';

const RAMP_API_BASE_URL = 'https://api.ramp.com/v1';

export class RampClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: RAMP_API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch transactions with optional filters
   * @param params - Query parameters for filtering transactions
   * @returns Promise with transaction data
   */
  async getTransactions(params: {
    start?: string; // ISO 8601 date
    end?: string; // ISO 8601 date
    merchantName?: string;
    state?: 'CLEARED' | 'PENDING' | 'DECLINED';
    limit?: number;
  } = {}): Promise<RampTransaction[]> {
    try {
      const allTransactions: RampTransaction[] = [];
      let nextCursor: string | undefined;

      do {
        const response = await this.client.get<RampApiResponse<RampTransaction>>('/transactions', {
          params: {
            ...params,
            page_cursor: nextCursor,
            page_size: params.limit || 100,
          },
        });

        allTransactions.push(...response.data.data);
        nextCursor = response.data.page.next;

        // If a specific limit was requested and we've reached it, break
        if (params.limit && allTransactions.length >= params.limit) {
          break;
        }
      } while (nextCursor);

      return allTransactions;
    } catch (error) {
      console.error('Error fetching Ramp transactions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Fetch transactions for a specific month
   * @param year - Year (e.g., 2024)
   * @param month - Month (1-12)
   * @returns Promise with transaction data
   */
  async getTransactionsByMonth(year: number, month: number): Promise<RampTransaction[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.getTransactions({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      state: 'CLEARED',
    });
  }

  /**
   * Fetch transactions for a specific merchant
   * @param merchantName - Name of the merchant
   * @param start - Start date (ISO 8601)
   * @param end - End date (ISO 8601)
   * @returns Promise with transaction data
   */
  async getTransactionsByMerchant(
    merchantName: string,
    start?: string,
    end?: string
  ): Promise<RampTransaction[]> {
    return this.getTransactions({
      merchantName,
      start,
      end,
      state: 'CLEARED',
    });
  }

  /**
   * Fetch transactions for date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise with transaction data
   */
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<RampTransaction[]> {
    return this.getTransactions({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      state: 'CLEARED',
    });
  }

  /**
   * Test API connection
   * @returns Promise<boolean> - true if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/transactions', { params: { page_size: 1 } });
      return true;
    } catch (error) {
      console.error('Ramp API connection test failed:', error);
      return false;
    }
  }

  /**
   * Handle and format API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      switch (status) {
        case 401:
          return new Error('Ramp API authentication failed. Check your API key.');
        case 403:
          return new Error('Ramp API access forbidden. Verify your permissions.');
        case 429:
          return new Error('Ramp API rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Ramp API server error. Please try again later.');
        default:
          return new Error(`Ramp API error: ${message}`);
      }
    }

    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

/**
 * Create a Ramp client instance
 * @param apiKey - Ramp API key (optional, defaults to environment variable)
 * @returns RampClient instance
 */
export const createRampClient = (apiKey?: string): RampClient => {
  const key = apiKey || process.env.RAMP_API_KEY;
  
  if (!key) {
    throw new Error('Ramp API key is required. Set RAMP_API_KEY environment variable.');
  }

  return new RampClient(key);
};
