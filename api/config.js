// api/config.js
// Vercel Serverless Function to provide public configuration

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client ID from environment variables
  const CLIENT_ID = process.env.RAMP_CLIENT_ID;

  if (!CLIENT_ID) {
    console.error('RAMP_CLIENT_ID not configured in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Return only public configuration (Client ID is public, not secret)
  return res.status(200).json({
    client_id: CLIENT_ID,
  });
}
