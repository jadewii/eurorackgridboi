#!/bin/bash

# Upload script for Cloudflare R2
# Run this after creating your R2 bucket

echo "🚀 EUROGRID R2 Upload Script"
echo "============================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Variables - UPDATE THESE WITH YOUR VALUES
BUCKET_NAME="eurogrid-assets"
LOCAL_PATH="modules/static"

echo "📦 Bucket: $BUCKET_NAME"
echo "📁 Uploading from: $LOCAL_PATH"
echo ""

# Login to Cloudflare (only needed first time)
echo "🔐 Logging into Cloudflare..."
wrangler login

# Upload all SVG files
echo "📤 Uploading module images..."
for file in $LOCAL_PATH/*.svg; do
    filename=$(basename "$file")
    echo "  Uploading: $filename"
    wrangler r2 object put "$BUCKET_NAME/modules/static/$filename" --file="$file"
done

echo ""
echo "✅ Upload complete!"
echo ""
echo "Next steps:"
echo "1. Update image-config.js with your R2 domain"
echo "2. Set IMAGE_ENV = 'prod'"
echo "3. Test your site!"