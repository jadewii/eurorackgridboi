#!/bin/bash

echo "JAMNUTZ Cloudflare Quick Setup"
echo "==============================="
echo ""

# Check if logged in to Cloudflare
echo "Step 1: Checking Cloudflare login..."
if ! wrangler whoami &>/dev/null; then
    echo "Not logged in. Opening browser for authentication..."
    wrangler login
else
    echo "Already logged in to Cloudflare"
fi

echo ""
echo "Step 2: Creating D1 Database..."
echo "Running: npm run db:create"
npm run db:create

echo ""
echo "Please copy the database_id from above and update wrangler.toml"
echo "Press Enter when done..."
read

echo ""
echo "Step 3: Running database migrations..."
npm run db:migrate

echo ""
echo "Step 4: Creating R2 bucket..."
npm run r2:create

echo ""
echo "Step 5: Deploying Worker..."
npm run deploy:worker

echo ""
echo "Setup complete! Your worker is deployed."
echo ""
echo "Next steps:"
echo "1. Upload plant images to R2 bucket:"
echo "   - Preview images in /plants/preview/"
echo "   - Original images in /plants/orig/"
echo "2. Set up Clerk authentication"
echo "3. Update frontend to use the new API"