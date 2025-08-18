#!/bin/bash

echo "Uploading Plant Images to Cloudflare R2"
echo "========================================"
echo ""

# Path to local plant images
PLANTS_DIR="/Users/jade/Documents/plants/webp"

if [ ! -d "$PLANTS_DIR" ]; then
    echo "Error: Plants directory not found at $PLANTS_DIR"
    exit 1
fi

echo "Found plants directory at: $PLANTS_DIR"
echo ""

# Upload preview images (these will be public)
echo "Uploading preview images..."
for i in {1..20}; do
    file="$PLANTS_DIR/p$i.webp"
    if [ -f "$file" ]; then
        echo "Uploading p$i.webp as preview..."
        wrangler r2 object put jamnutz-media/plants/preview/p$i.webp --file="$file"
    else
        echo "Warning: p$i.webp not found"
    fi
done

echo ""
echo "Uploading original images (these will be private)..."
for i in {1..20}; do
    file="$PLANTS_DIR/p$i.webp"
    if [ -f "$file" ]; then
        echo "Uploading p$i.webp as original..."
        wrangler r2 object put jamnutz-media/plants/orig/p$i.webp --file="$file"
    else
        echo "Warning: p$i.webp not found"
    fi
done

echo ""
echo "Upload complete!"
echo ""
echo "Next steps:"
echo "1. Set up public access for /plants/preview/* in R2 settings"
echo "2. Keep /plants/orig/* private"
echo "3. Deploy the worker with: npm run deploy:worker"