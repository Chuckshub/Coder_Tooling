import { NextRequest, NextResponse } from 'next/server';
import { getAllVendors, createVendor } from '@/lib/firebase/vendors';
import { Vendor } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const vendors = await getAllVendors(activeOnly);
    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Vendors API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, monthlyBudget, category, alternativeNames, notes } = body;

    // Validate required fields
    if (!name || monthlyBudget === undefined || !category) {
      return NextResponse.json(
        { error: 'Name, monthlyBudget, and category are required' },
        { status: 400 }
      );
    }

    // Create vendor
    const vendorId = await createVendor({
      name,
      monthlyBudget: Number(monthlyBudget),
      category,
      active: true,
      alternativeNames: alternativeNames || [],
      notes,
    });

    return NextResponse.json({ 
      success: true, 
      id: vendorId,
      message: 'Vendor created successfully' 
    });
  } catch (error) {
    console.error('Create vendor API error:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
