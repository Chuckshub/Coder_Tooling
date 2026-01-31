// api/auth/refresh.js
// Vercel Serverless Function to refresh access tokens

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the refresh token from the request
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  // Get secrets from Vercel environment variables
  const CLIENT_ID = process.env.RAMP_CLIENT_ID;
  const CLIENT_SECRET = process.env.RAMP_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Refresh the access token with Ramp
    const tokenResponse = await fetch('https://api.ramp.com/developer/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
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
        error: errorData.error_description || errorData.error || 'Token refresh failed',
      });
    }

    const tokenData = JSON.parse(responseText);

    // Return the new token data to the client
    return res.status(200).json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
