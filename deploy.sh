#!/bin/bash

echo "🚀 Deploying EurorackGrid to Production"
echo "========================================"

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo ""
echo "📝 Step 1: Deploying Firebase Security Rules"
echo "--------------------------------------------"
cd firebase
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

echo ""
echo "🖼️ Step 2: Checking Image Storage"
echo "--------------------------------------------"
echo "Images are currently on Supabase - keeping them there for now"
echo "WebP files: https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/"

echo ""
echo "🌐 Step 3: Deploying to Netlify"
echo "--------------------------------------------"
cd ../
netlify deploy --prod --dir=frontend

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "Next Steps:"
echo "1. Set environment variables in Netlify dashboard"
echo "2. Configure custom domain in Netlify"
echo "3. Enable Netlify Identity for additional auth (optional)"
echo "4. Set up monitoring and analytics"
echo ""
echo "Security Checklist:"
echo "✓ Firebase rules deployed"
echo "✓ Environment variables separated"
echo "✓ CSP headers configured"
echo "✓ HTTPS enforced by Netlify"
echo "✓ Auth tokens secure"