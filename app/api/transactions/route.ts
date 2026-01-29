import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n========== Transactions Request Started ==========');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Get access token from cookie
    const cookieStore = cookies();
    const accessToken = cookieStore.get('ramp_access_token')?.value;

    console.log('Access Token Check:', {
      present: !!accessToken,
      preview: accessToken ? `${accessToken.substring(0, 20)}...` : null
    });

    if (!accessToken) {
      console.error('❌ No access token found in cookies');
      return NextResponse.json(
        {
          success: false,
          error: 'unauthorized',
          message: 'No access token found. Please authenticate first.',
          debug: {
            cookiesPresent: cookieStore.getAll().map(c => c.name),
            timestamp: new Date().toISOString()
          }
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const limit = searchParams.get('limit') || '50';

    console.log('Query Parameters:', {
      from_date: fromDate,
      to_date: toDate,
      limit
    });

    // Build API URL with query parameters
    const apiBase = process.env.RAMP_API_BASE || 'https://api.ramp.com';
    const apiUrl = new URL(`${apiBase}/developer/v1/transactions`);
    
    if (fromDate) apiUrl.searchParams.append('from_date', fromDate);
    if (toDate) apiUrl.searchParams.append('to_date', toDate);
    apiUrl.searchParams.append('page_size', limit);

    console.log('\n--- Ramp API Request ---');
    console.log('URL:', apiUrl.toString());
    console.log('Method: GET');
    console.log('Headers:', {
      Authorization: `Bearer ${accessToken.substring(0, 20)}...`
    });

    // Make request to Ramp API
    const rampResponse = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const responseTime = Date.now() - startTime;
    console.log(`\n--- Ramp API Response (${responseTime}ms) ---`);
    console.log('Status:', rampResponse.status, rampResponse.statusText);
    console.log('Headers:', Object.fromEntries(rampResponse.headers.entries()));

    const responseText = await rampResponse.text();
    console.log('Raw Response Length:', responseText.length, 'bytes');
    console.log('Raw Response Preview:', responseText.substring(0, 500));

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON');
      console.error('Parse Error:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_response',
          message: 'Ramp API returned invalid JSON',
          debug: {
            status: rampResponse.status,
            rawResponse: responseText.substring(0, 1000),
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            timestamp: new Date().toISOString()
          }
        },
        { status: 502 }
      );
    }

    if (!rampResponse.ok) {
      console.error('❌ Ramp API request failed');
      console.error('Error Response:', responseData);

      // Check if token is expired/invalid
      if (rampResponse.status === 401) {
        console.error('Access token may be expired or invalid');
        
        // Clear the invalid token
        const response = NextResponse.json(
          {
            success: false,
            error: 'token_expired',
            message: 'Access token expired or invalid. Please authenticate again.',
            debug: {
              status: rampResponse.status,
              response: responseData,
              timestamp: new Date().toISOString()
            }
          },
          { status: 401 }
        );
        response.cookies.delete('ramp_access_token');
        return response;
      }

      return NextResponse.json(
        {
          success: false,
          error: 'api_error',
          message: responseData.error?.message || 'Ramp API request failed',
          debug: {
            status: rampResponse.status,
            response: responseData,
            timestamp: new Date().toISOString()
          }
        },
        { status: rampResponse.status }
      );
    }

    console.log('✓ Transactions retrieved successfully');
    console.log('Transaction Count:', responseData.data?.length || 0);
    
    if (responseData.data && responseData.data.length > 0) {
      console.log('First Transaction:', {
        id: responseData.data[0].id,
        amount: responseData.data[0].amount,
        merchant_name: responseData.data[0].merchant_name,
        card_holder: responseData.data[0].card_holder?.first_name
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✓ Transactions request completed successfully (${totalTime}ms)`);
    console.log('========== Transactions Request Completed ==========\n');

    return NextResponse.json({
      success: true,
      data: responseData.data || [],
      page: responseData.page || {},
      debug: {
        requestTime: totalTime,
        count: responseData.data?.length || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`\n❌ Transactions Request Error (${totalTime}ms)`);
    console.error('Error Details:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('========== Transactions Request Failed ==========\n');

    return NextResponse.json(
      {
        success: false,
        error: 'internal_error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        debug: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
