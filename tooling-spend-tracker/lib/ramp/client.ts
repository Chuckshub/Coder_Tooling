import axios, { AxiosInstance } from 'axios';
import { RampTransaction, RampApiResponse } from '@/types';

const RAMP_API_BASE_URL = 'https://api.ramp.com/developer/v1';
const RAMP_TOKEN_URL = 'https://api.ramp.com/developer/v1/token';

interface RampTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class RampClient {
  private client: AxiosInstance;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    
    this.client = axios.create({
      baseURL: RAMP_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Request new token using client credentials flow
    try {
      const response = await axios.post<RampTokenResponse>(
        RAMP_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'transactions:read', // Add more scopes as needed
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 1 day before actual expiry for safety (tokens last 10 days)
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 86400) * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error fetching Ramp access token:', error);
      throw new Error('Failed to authenticate with Ramp API');
    }
  }

  /**
   * Make an authenticated request to the Ramp API
   */
  private async authenticatedRequest<T>(config: any): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await this.client.request<T>({
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data;
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
        const response = await this.authenticatedRequest<RampApiResponse<RampTransaction>>({
          method: 'GET',
          url: '/transactions',
          params: {
            from_date: params.start,
            to_date: params.end,
            merchant_name: params.merchantName,
            state: params.state,
            page_cursor: nextCursor,
            page_size: params.limit || 100,
          },
        });

        allTransactions.push(...response.data);
        nextCursor = response.page.next;

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
      await this.authenticatedRequest({
        method: 'GET',
        url: '/transactions',
        params: { page_size: 1 },
      });
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
 * @param clientId - Ramp client ID (optional, defaults to environment variable)
 * @param clientSecret - Ramp client secret (optional, defaults to environment variable)
 * @returns RampClient instance
 */
export const createRampClient = (clientId?: string, clientSecret?: string): RampClient => {
  const id = clientId || process.env.RAMP_CLIENT_ID;
  const secret = clientSecret || process.env.RAMP_CLIENT_SECRET;
  
  if (!id || !secret) {
    throw new Error('Ramp client ID and secret are required. Set RAMP_CLIENT_ID and RAMP_CLIENT_SECRET environment variables.');
  }

  return new RampClient(id, secret);
};
