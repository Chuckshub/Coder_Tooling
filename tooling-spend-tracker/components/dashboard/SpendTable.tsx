'use client';

import React, { useState } from 'react';
import { VendorSpendSummary, SortField, SortDirection } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils/comparisonLogic';
import StatusBadge from '@/components/ui/StatusBadge';
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';

interface SpendTableProps {
  data: VendorSpendSummary[];
  onVendorClick?: (vendorId: string) => void;
  showYTD?: boolean;
}

const SpendTable: React.FC<SpendTableProps> = ({ 
  data, 
  onVendorClick,
  showYTD = false 
}) => {
  const [sortField, setSortField] = useState<SortField>('vendor');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'vendor':
        aValue = a.vendor.name;
        bValue = b.vendor.name;
        break;
      case 'budget':
        aValue = a.currentMonthBudget;
        bValue = b.currentMonthBudget;
        break;
      case 'actual':
        aValue = a.currentMonthActual;
        bValue = b.currentMonthActual;
        break;
      case 'variance':
        aValue = a.variance;
        bValue = b.variance;
        break;
      case 'variancePercent':
        aValue = a.variancePercent;
        bValue = b.variancePercent;
        break;
      default:
        aValue = a.vendor.name;
        bValue = b.vendor.name;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' 
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('vendor')}
            >
              <div className="flex items-center gap-2">
                Vendor Name
                <SortIcon field="vendor" />
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prior Month
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('budget')}
            >
              <div className="flex items-center justify-end gap-2">
                Current Budget
                <SortIcon field="budget" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('actual')}
            >
              <div className="flex items-center justify-end gap-2">
                Current Actual
                <SortIcon field="actual" />
              </div>
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('variance')}
            >
              <div className="flex items-center justify-end gap-2">
                Variance
                <SortIcon field="variance" />
              </div>
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {showYTD && (
              <>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YTD Budget
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YTD Actual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  YTD Variance
                </th>
              </>
            )}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row) => (
            <tr key={row.vendor.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {row.vendor.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {row.vendor.category}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                {formatCurrency(row.priorMonthActual)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                {formatCurrency(row.currentMonthBudget)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                {formatCurrency(row.currentMonthActual)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div className={row.variance > 0 ? 'text-red-600' : row.variance < 0 ? 'text-green-600' : 'text-gray-900'}>
                  <div className="font-medium">{formatCurrency(row.variance)}</div>
                  <div className="text-xs">{formatPercentage(row.variancePercent)}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <StatusBadge status={row.status} />
              </td>
              {showYTD && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(row.ytdBudget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {formatCurrency(row.ytdActual)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className={row.ytdVariance > 0 ? 'text-red-600' : row.ytdVariance < 0 ? 'text-green-600' : 'text-gray-900'}>
                      {formatCurrency(row.ytdVariance)}
                    </div>
                  </td>
                </>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {onVendorClick && (
                  <button
                    onClick={() => onVendorClick(row.vendor.id)}
                    className="text-primary-600 hover:text-primary-800 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold">
          <tr>
            <td className="px-6 py-4 text-sm text-gray-900">Total</td>
            <td className="px-6 py-4 text-right text-sm text-gray-900">
              {formatCurrency(sortedData.reduce((sum, row) => sum + row.priorMonthActual, 0))}
            </td>
            <td className="px-6 py-4 text-right text-sm text-gray-900">
              {formatCurrency(sortedData.reduce((sum, row) => sum + row.currentMonthBudget, 0))}
            </td>
            <td className="px-6 py-4 text-right text-sm text-gray-900">
              {formatCurrency(sortedData.reduce((sum, row) => sum + row.currentMonthActual, 0))}
            </td>
            <td className="px-6 py-4 text-right text-sm text-gray-900">
              {formatCurrency(sortedData.reduce((sum, row) => sum + row.variance, 0))}
            </td>
            <td className="px-6 py-4"></td>
            {showYTD && (
              <>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {formatCurrency(sortedData.reduce((sum, row) => sum + row.ytdBudget, 0))}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {formatCurrency(sortedData.reduce((sum, row) => sum + row.ytdActual, 0))}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {formatCurrency(sortedData.reduce((sum, row) => sum + row.ytdVariance, 0))}
                </td>
              </>
            )}
            <td className="px-6 py-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default SpendTable;
