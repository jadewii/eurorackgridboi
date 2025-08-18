#!/bin/bash

echo "Deploying updated Cloudflare Worker for plant and seed images..."

# First, create/update wrangler.toml with R2 bindings
cat > wrangler.toml << EOF
name = "eurorack-images"
main = "workers/media-access-secure.js"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "R2"
bucket_name = "eurorackgridplants"

[[r2_buckets]]
binding = "SEEDS_R2"
bucket_name = "seeds"
EOF

echo "Created wrangler.toml with R2 bindings"

# Deploy the worker
wrangler deploy

echo "Worker deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Upload your seed images to the 'seeds' R2 bucket with names like:"
echo "   - seed-001.webp (for s1)"
echo "   - seed-002.webp (for s2)"
echo "   - seed-003.webp (for s3)"
echo "   - etc."
echo ""
echo "2. The pack shop will automatically load seed images from:"
echo "   - Sprout Pack: s1, s2, s3"
echo "   - Garden Pack: s4, s5, s6"
echo "   - Banner Pack: s7, s8 (shown larger)"