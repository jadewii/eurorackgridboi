#!/bin/bash

echo "Listing objects in eurorackgridseeds bucket..."
echo ""

# Use curl to list bucket contents via the Cloudflare API
ACCOUNT_ID="48bee1bbf6e86bd043eb41f038d43f5d"
BUCKET_NAME="eurorackgridseeds"

echo "Please run this command to see what's in your bucket:"
echo ""
echo "wrangler r2 object get eurorackgridseeds/<TAB><TAB>"
echo ""
echo "Or check in the Cloudflare dashboard:"
echo "https://dash.cloudflare.com/${ACCOUNT_ID}/r2/default/buckets/${BUCKET_NAME}"
echo ""
echo "The files should be named exactly:"
echo "  seed-001.webp"
echo "  seed-002.webp"
echo "  seed-003.webp"
echo "  etc."
echo ""
echo "To upload a seed image correctly:"
echo "  wrangler r2 object put eurorackgridseeds/seed-001.webp --file ./path/to/your/seed-001.webp"