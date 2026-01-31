// api/auth/token.js
// Vercel Serverless Function to handle OAuth token exchange

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the authorization code from the request
  const { code, redirect_uri } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  // Get secrets from Vercel environment variables
  const CLIENT_ID = process.env.RAMP_CLIENT_ID;
  const CLIENT_SECRET = process.env.RAMP_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Exchange code for token with Ramp
    const tokenResponse = await fetch('https://api.ramp.com/developer/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
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
        error: errorData.error_description || errorData.error || 'Token exchange failed',
      });
    }

    const tokenData = JSON.parse(responseText);

    // Return the token data to the client
    return res.status(200).json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
