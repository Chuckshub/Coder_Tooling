import { NextRequest, NextResponse } from 'next/server';
import { syncTransactionsForMonth } from '@/lib/services/syncService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month } = body;

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    // Validate year and month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Month must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Sync transactions
    const result = await syncTransactionsForMonth(year, month);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sync failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionsSynced: result.transactionsSynced,
      message: `Successfully synced ${result.transactionsSynced} transactions`,
    });
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync transactions' 
      },
      { status: 500 }
    );
  }
}
