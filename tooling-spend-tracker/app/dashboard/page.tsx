'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import MonthSelector from '@/components/ui/MonthSelector';
import SpendTable from '@/components/dashboard/SpendTable';
import { DashboardData, VendorSpendSummary } from '@/types';
import { formatCurrency } from '@/lib/utils/comparisonLogic';

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showYTD, setShowYTD] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dashboard?month=${format(selectedMonth, 'yyyy-MM')}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync data from Ramp
  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedMonth.getFullYear(),
          month: selectedMonth.getMonth() + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh dashboard after sync
        await fetchDashboardData();
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
      console.error('Error syncing:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Export to CSV
  const handleExport = () => {
    if (!dashboardData) return;

    const headers = showYTD
      ? ['Vendor', 'Category', 'Prior Month', 'Current Budget', 'Current Actual', 'Variance', 'Variance %', 'Status', 'YTD Budget', 'YTD Actual', 'YTD Variance']
      : ['Vendor', 'Category', 'Prior Month', 'Current Budget', 'Current Actual', 'Variance', 'Variance %', 'Status'];

    const rows = dashboardData.knownTooling.map(row => {
      const base = [
        row.vendor.name,
        row.vendor.category,
        row.priorMonthActual.toFixed(2),
        row.currentMonthBudget.toFixed(2),
        row.currentMonthActual.toFixed(2),
        row.variance.toFixed(2),
        row.variancePercent.toFixed(1),
        row.status,
      ];

      if (showYTD) {
        return [...base, row.ytdBudget.toFixed(2), row.ytdActual.toFixed(2), row.ytdVariance.toFixed(2)];
      }
      return base;
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spend-report-${format(selectedMonth, 'yyyy-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <Home className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Spend Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                showYTD={showYTD}
                onYTDToggle={setShowYTD}
              />
              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync'}
              </button>
              <button
                onClick={handleExport}
                disabled={!dashboardData}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.totalBudget)}
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Actual</h3>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.totalActual)}
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Variance</h3>
                <TrendingDown className="w-5 h-5 text-gray-400" />
              </div>
              <p className={`text-2xl font-bold ${dashboardData.totalVariance > 0 ? 'text-red-600' : dashboardData.totalVariance < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {formatCurrency(dashboardData.totalVariance)}
              </p>
            </div>
          </div>
        )}

        {/* Known Tooling Table */}
        {dashboardData && dashboardData.knownTooling.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Known Tooling
            </h2>
            <SpendTable 
              data={dashboardData.knownTooling} 
              showYTD={showYTD}
            />
          </div>
        )}

        {/* Non-Budgeted Tooling */}
        {dashboardData && dashboardData.nonBudgetedTooling.length > 0 && (
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Non-Budgeted Tooling ({dashboardData.nonBudgetedTooling.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.nonBudgetedTooling.map((vendor, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vendor.merchantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(vendor.currentMonthActual)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {vendor.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unused Subscriptions */}
        {dashboardData && dashboardData.unusedSubscriptions.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Unused Subscriptions ({dashboardData.unusedSubscriptions.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.unusedSubscriptions.map(vendor => (
                <div key={vendor.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{vendor.name}</div>
                  <div className="text-sm text-gray-600">{vendor.category}</div>
                  <div className="text-sm font-medium text-gray-700 mt-1">
                    Budget: {formatCurrency(vendor.monthlyBudget)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {dashboardData && 
         dashboardData.knownTooling.length === 0 && 
         dashboardData.nonBudgetedTooling.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-gray-600 mb-4">No transaction data available for this month.</p>
            <button onClick={handleSync} className="btn btn-primary">
              Sync Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
