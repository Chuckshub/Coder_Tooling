import { NextRequest, NextResponse } from 'next/server';
import { getAllVendors } from '@/lib/firebase/vendors';
import { getTransactionsByMonth } from '@/lib/firebase/transactions';
import {
  generateDashboardData,
  getMonthString,
  getPriorMonth,
  getYTDDateRange,
} from '@/lib/utils/comparisonLogic';
import { getTransactionsByDateRange } from '@/lib/firebase/transactions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get('month');

    if (!monthParam) {
      return NextResponse.json(
        { error: 'Month parameter is required (format: YYYY-MM)' },
        { status: 400 }
      );
    }

    // Parse month parameter
    const [year, month] = monthParam.split('-').map(Number);
    const currentMonth = new Date(year, month - 1, 1);
    const currentMonthStr = getMonthString(currentMonth);
    const priorMonth = getPriorMonth(currentMonth);
    const priorMonthStr = getMonthString(priorMonth);

    // Fetch vendors
    const vendors = await getAllVendors(true);

    // Fetch transactions for current month, prior month, and YTD
    const currentMonthTransactions = await getTransactionsByMonth(currentMonthStr);
    const priorMonthTransactions = await getTransactionsByMonth(priorMonthStr);
    
    // Get YTD transactions
    const ytdRange = getYTDDateRange(currentMonth);
    const ytdTransactions = await getTransactionsByDateRange(
      ytdRange.start,
      ytdRange.end
    );

    // Generate dashboard data
    const dashboardData = generateDashboardData(
      vendors,
      currentMonthTransactions,
      priorMonthTransactions,
      ytdTransactions,
      currentMonth
    );

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate dashboard data' },
      { status: 500 }
    );
  }
}
