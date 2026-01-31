#!/bin/bash
# deploy-simple.sh
# Switches to the simple one-click token version and deploys

echo "🔄 Switching to simple one-click version..."

# Backup the complex version
if [ -f "index.html" ]; then
  echo "📦 Backing up complex version to index-oauth-flow.html..."
  mv index.html index-oauth-flow.html
fi

# Make simple version the main file
if [ -f "index-simple.html" ]; then
  echo "✅ Making simple version the main index.html..."
  cp index-simple.html index.html
else
  echo "❌ Error: index-simple.html not found!"
  exit 1
fi

echo ""
echo "📁 Files ready:"
echo "  ✅ index.html (simple one-click version)"
echo "  ✅ api/auth/client-credentials.js (backend)"
echo "  📦 index-oauth-flow.html (backup of complex version)"
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test your deployment:"
echo "  1. Visit your Vercel URL"
echo "  2. Click 'Get Access Token'"
echo "  3. Click 'Test Token with API Call'"
echo ""
