'use client';

import { useState } from 'react';

interface Transaction {
  id: string;
  amount: number;
  merchant_name: string;
  card_holder?: {
    first_name: string;
    last_name: string;
  };
  state: string;
  sk_category_name?: string;
  receipts?: any[];
}

interface DebugInfo {
  timestamp: string;
  requestTime?: number;
  count?: number;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  data?: Transaction[];
  message?: string;
  error?: string;
  debug?: DebugInfo;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleGetToken = async () => {
    setLoading(true);
    setError(null);
    addDebugLog('Requesting access token...');

    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
      });

      const result: ApiResponse = await response.json();
      
      addDebugLog(`Token Response: ${response.status} ${response.statusText}`);
      addDebugLog(`Success: ${result.success}`);

      if (result.success) {
        setTokenInfo(result.data);
        addDebugLog(`✓ Token obtained - Expires in: ${result.data?.expires_in}s`);
        if (result.debug) {
          addDebugLog(`Request time: ${result.debug.requestTime}ms`);
        }
      } else {
        setError(result.message || 'Failed to obtain token');
        addDebugLog(`❌ Error: ${result.error} - ${result.message}`);
        if (result.debug) {
          addDebugLog(`Debug: ${JSON.stringify(result.debug, null, 2)}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addDebugLog(`❌ Exception: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetTransactions = async () => {
    setLoading(true);
    setError(null);
    addDebugLog('Fetching transactions...');

    try {
      const response = await fetch('/api/transactions?limit=10');
      const result: ApiResponse = await response.json();

      addDebugLog(`Transactions Response: ${response.status} ${response.statusText}`);
      addDebugLog(`Success: ${result.success}`);

      if (result.success && result.data) {
        setTransactions(result.data);
        addDebugLog(`✓ Retrieved ${result.data.length} transactions`);
        if (result.debug) {
          addDebugLog(`Request time: ${result.debug.requestTime}ms`);
        }
      } else {
        setError(result.message || 'Failed to fetch transactions');
        addDebugLog(`❌ Error: ${result.error} - ${result.message}`);
        if (result.debug) {
          addDebugLog(`Debug: ${JSON.stringify(result.debug, null, 2)}`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addDebugLog(`❌ Exception: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDebugLog = () => {
    setDebugLog([]);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Ramp API Integration Test</h1>

      {/* Control Panel */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Controls</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetToken}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Loading...' : '1. Get Access Token'}
          </button>

          <button
            onClick={handleGetTransactions}
            disabled={loading || !tokenInfo}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading || !tokenInfo ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !tokenInfo ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Loading...' : '2. Fetch Transactions'}
          </button>

          <button
            onClick={clearDebugLog}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Clear Debug Log
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          marginBottom: '1rem',
          color: '#c00'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Token Info */}
      {tokenInfo && (
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#166534' }}>Token Information</h2>
          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
            <div><strong>Token Type:</strong> {tokenInfo.token_type}</div>
            <div><strong>Expires In:</strong> {tokenInfo.expires_in} seconds</div>
            <div><strong>Scope:</strong> {tokenInfo.scope}</div>
            <div><strong>Obtained At:</strong> {tokenInfo.obtained_at}</div>
          </div>
        </div>
      )}

      {/* Transactions Display */}
      {transactions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>Transactions ({transactions.length})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
              backgroundColor: 'white',
              border: '1px solid #ddd'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Merchant</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Card Holder</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>State</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Category</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {txn.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '12px' }}>{txn.merchant_name}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                      ${(txn.amount / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {txn.card_holder ? `${txn.card_holder.first_name} ${txn.card_holder.last_name}` : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: txn.state === 'CLEARED' ? '#dcfce7' : '#fef3c7',
                        color: txn.state === 'CLEARED' ? '#166534' : '#854d0e'
                      }}>
                        {txn.state}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>
                      {txn.sk_category_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Debug Log */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '13px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#fff' }}>Debug Log</h2>
        {debugLog.length === 0 ? (
          <div style={{ color: '#888' }}>No debug messages yet. Click "Get Access Token" to start.</div>
        ) : (
          <div>
            {debugLog.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px', lineHeight: '1.5' }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0, color: '#1e40af' }}>Instructions</h3>
        <ol style={{ marginBottom: 0, lineHeight: '1.8' }}>
          <li>Click "Get Access Token" to authenticate with Ramp API using client credentials</li>
          <li>Once token is obtained, click "Fetch Transactions" to retrieve transaction data</li>
          <li>Monitor the Debug Log for detailed request/response information</li>
          <li>Check your terminal/Vercel logs for server-side debugging output</li>
        </ol>
      </div>
    </main>
  );
}
