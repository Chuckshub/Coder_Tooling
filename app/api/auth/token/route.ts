import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n========== Token Request Started ==========');
  console.log('Timestamp:', new Date().toISOString());

  try {
    const clientId = process.env.RAMP_CLIENT_ID;
    const clientSecret = process.env.RAMP_CLIENT_SECRET;
    const tokenUrl = process.env.RAMP_TOKEN_URL || 'https://api.ramp.com/v1/public/customer/token';

    console.log('Environment Check:', {
      clientId: clientId ? `${clientId.substring(0, 8)}...` : '❌ MISSING',
      clientSecret: clientSecret ? '✓ Present' : '❌ MISSING',
      tokenUrl
    });

    if (!clientId || !clientSecret) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'configuration_error',
          message: 'Server configuration error: Missing Ramp credentials',
          debug: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            timestamp: new Date().toISOString()
          }
        },
        { status: 500 }
      );
    }

    // Prepare token request
    const tokenRequestBody = {
      grant_type: 'client_credentials',
      scope: 'transactions:read'
    };

    console.log('\n--- Token Request ---');
    console.log('URL:', tokenUrl);
    console.log('Method: POST');
    console.log('Body:', tokenRequestBody);
    console.log('Auth: Basic (Base64 encoded)');

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(tokenRequestBody)
    });

    const responseTime = Date.now() - startTime;
    console.log(`\n--- Token Response (${responseTime}ms) ---`);
    console.log('Status:', tokenResponse.status, tokenResponse.statusText);
    console.log('Headers:', Object.fromEntries(tokenResponse.headers.entries()));

    const responseText = await tokenResponse.text();
    console.log('Raw Response:', responseText);

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse token response as JSON');
      console.error('Parse Error:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_response',
          message: 'Ramp API returned invalid JSON',
          debug: {
            status: tokenResponse.status,
            rawResponse: responseText.substring(0, 500),
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
            timestamp: new Date().toISOString()
          }
        },
        { status: 502 }
      );
    }

    if (!tokenResponse.ok) {
      console.error('❌ Token request failed');
      console.error('Error Response:', tokenData);
      return NextResponse.json(
        {
          success: false,
          error: 'token_request_failed',
          message: tokenData.error_description || tokenData.error || 'Failed to obtain access token',
          debug: {
            status: tokenResponse.status,
            response: tokenData,
            timestamp: new Date().toISOString()
          }
        },
        { status: tokenResponse.status }
      );
    }

    console.log('✓ Access token obtained successfully');
    console.log('Token Data:', {
      access_token: tokenData.access_token ? `${tokenData.access_token.substring(0, 20)}...` : null,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope
    });

    // Store token in cookie
    const response = NextResponse.json({
      success: true,
      message: 'Access token obtained successfully',
      data: {
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        obtained_at: new Date().toISOString()
      },
      debug: {
        requestTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });

    response.cookies.set('ramp_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600
    });

    const totalTime = Date.now() - startTime;
    console.log(`\n✓ Token request completed successfully (${totalTime}ms)`);
    console.log('========== Token Request Completed ==========\n');

    return response;

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`\n❌ Token Request Error (${totalTime}ms)`);
    console.error('Error Details:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('========== Token Request Failed ==========\n');

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
