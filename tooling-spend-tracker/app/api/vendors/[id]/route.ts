import { NextRequest, NextResponse } from 'next/server';
import { 
  getVendorById, 
  updateVendor, 
  deleteVendor 
} from '@/lib/firebase/vendors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await getVendorById(params.id);

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Get vendor API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Update vendor
    await updateVendor(params.id, body);

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully',
    });
  } catch (error) {
    console.error('Update vendor API error:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete by marking inactive
    await deleteVendor(params.id);

    return NextResponse.json({
      success: true,
      message: 'Vendor archived successfully',
    });
  } catch (error) {
    console.error('Delete vendor API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}
