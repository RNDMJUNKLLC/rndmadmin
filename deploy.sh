#!/bin/bash

# RNDM Admin Dashboard - Cloudflare Workers Deployment Script

echo "🚀 RNDM Admin Dashboard - Cloudflare Workers Deployment"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login check
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please login to Cloudflare:"
    wrangler login
fi

# Deploy to Workers
echo "📦 Deploying RNDM Admin Dashboard to Cloudflare Workers..."

# Development deployment
echo "🧪 Deploying to development environment..."
wrangler deploy --env development

# Production deployment
read -p "🚀 Deploy to production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌍 Deploying to production environment..."
    wrangler deploy
    echo "✅ Production deployment complete!"
    echo "🔗 Your dashboard should be available at: https://admin.rndmjunk.com"
else
    echo "⚠️  Production deployment skipped"
fi

echo ""
echo "✅ Deployment process complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Cloudflare dashboard:"
echo "   - FIREBASE_API_KEY"
echo "   - FIREBASE_AUTH_DOMAIN"
echo "   - FIREBASE_DATABASE_URL"
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_STORAGE_BUCKET"
echo "   - FIREBASE_MESSAGING_SENDER_ID"
echo "   - FIREBASE_APP_ID"
echo ""
echo "2. Custom domain configuration:"
echo "   Domain: admin.rndmjunk.com (configured in wrangler.toml)"
echo "   Verify route: wrangler route list"
echo "   DNS: Point admin.rndmjunk.com to your worker"
echo ""
echo "3. Monitor your deployment:"
echo "   wrangler tail"
echo ""
echo "🎉 Your RNDM Admin Dashboard is now live!"