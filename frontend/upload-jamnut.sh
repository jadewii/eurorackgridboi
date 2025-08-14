#!/bin/bash

echo "🥜 Uploading jamnut.webp to Cloudflare R2..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Upload jamnut.webp to R2
echo "Uploading jamnut.webp..."
wrangler r2 object put eurogrid-assets/jamnut.webp --file=jamnut.webp

echo ""
echo "✅ Upload complete!"
echo "🔗 Access at: https://pub-52e1e6cdc34a48efaf40dffb5e812617.r2.dev/jamnut.webp"
echo ""
echo "Test it:"
echo "curl -I https://pub-52e1e6cdc34a48efaf40dffb5e812617.r2.dev/jamnut.webp"