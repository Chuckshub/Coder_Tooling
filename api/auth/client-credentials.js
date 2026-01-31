// api/auth/client-credentials.js
// Vercel Serverless Function to get token using Client Credentials flow
// This is for server-to-server authentication (no user login required)

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get secrets from Vercel environment variables
  const CLIENT_ID = process.env.RAMP_CLIENT_ID;
  const CLIENT_SECRET = process.env.RAMP_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Request token using Client Credentials grant
    // Using the customer token endpoint (matches Postman setup)
    const tokenResponse = await fetch('https://api.ramp.com/v1/public/customer/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'transactions:read cards:read users:read business:read', // Add scopes you need
      }),
    });

    const responseText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      console.error('Ramp API error:', tokenResponse.status, responseText);
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText };
      }
      return res.status(tokenResponse.status).json({
        error: errorData.error_description || errorData.error || 'Token request failed',
      });
    }

    const tokenData = JSON.parse(responseText);

    // Return the token data to the client
    return res.status(200).json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
    });

  } catch (error) {
    console.error('Token request error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
