import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n========== OAuth Callback Started ==========');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // Extract authorization code from URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log('Query Parameters:', {
      code: code ? `${code.substring(0, 10)}...` : null,
      state,
      error,
      errorDescription
    });

    // Check for OAuth errors
    if (error) {
      console.error('❌ OAuth Error:', error);
      console.error('Error Description:', errorDescription);
      return NextResponse.json(
        { 
          success: false, 
          error: 'oauth_error',
          message: errorDescription || error,
          debug: {
            error,
            errorDescription,
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Validate authorization code
    if (!code) {
      console.error('❌ No authorization code received');
      return NextResponse.json(
        { 
          success: false, 
          error: 'missing_code',
          message: 'No authorization code received from Ramp',
          debug: {
            receivedParams: Object.fromEntries(searchParams.entries()),
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    console.log('✓ Authorization code received');

    // Prepare token exchange request
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

    // Exchange authorization code for access token
    const tokenRequestBody = {
      grant_type: 'client_credentials',
      scope: 'transactions:read'
    };

    console.log('\n--- Token Exchange Request ---');
    console.log('URL:', tokenUrl);
    console.log('Method: POST');
    console.log('Body:', tokenRequestBody);
    console.log('Auth: Basic (Base64 encoded client credentials)');

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

    // Store token in session/cookie (in production, use secure session storage)
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('ramp_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600
    });

    const totalTime = Date.now() - startTime;
    console.log(`\n✓ OAuth flow completed successfully (${totalTime}ms)`);
    console.log('========== OAuth Callback Completed ==========\n');

    return response;

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`\n❌ OAuth Callback Error (${totalTime}ms)`);
    console.error('Error Details:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('========== OAuth Callback Failed ==========\n');

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
