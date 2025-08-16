#!/bin/bash
<<<<<<< HEAD

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
=======
# Cloudflare R2 Upload Script
# Run this after logging in with: wrangler login

echo "Uploading to Cloudflare R2..."

wrangler r2 object put eurorackgrid/modules/118b2523_function-synthesizer.webp --file=./r2-ready/118b2523_function-synthesizer.svg
wrangler r2 object put eurorackgrid/previews/118b2523_function-synthesizer.jpg --file=./r2-ready/118b2523_function-synthesizer.svg
wrangler r2 object put eurorackgrid/modules/8cb68a78_honduh.webp --file=./r2-ready/8cb68a78_honduh.svg
wrangler r2 object put eurorackgrid/previews/8cb68a78_honduh.jpg --file=./r2-ready/8cb68a78_honduh.svg
wrangler r2 object put eurorackgrid/modules/4230b967_andersons.webp --file=./r2-ready/4230b967_andersons.svg
wrangler r2 object put eurorackgrid/previews/4230b967_andersons.jpg --file=./r2-ready/4230b967_andersons.svg
wrangler r2 object put eurorackgrid/modules/6fd2dbf2_varigated.webp --file=./r2-ready/6fd2dbf2_varigated.svg
wrangler r2 object put eurorackgrid/previews/6fd2dbf2_varigated.jpg --file=./r2-ready/6fd2dbf2_varigated.svg
wrangler r2 object put eurorackgrid/modules/cfbd3e0a_bai.webp --file=./r2-ready/cfbd3e0a_bai.svg
wrangler r2 object put eurorackgrid/previews/cfbd3e0a_bai.jpg --file=./r2-ready/cfbd3e0a_bai.svg
wrangler r2 object put eurorackgrid/modules/3562316d_cephalopod-rose.webp --file=./r2-ready/3562316d_cephalopod-rose.svg
wrangler r2 object put eurorackgrid/previews/3562316d_cephalopod-rose.jpg --file=./r2-ready/3562316d_cephalopod-rose.svg
wrangler r2 object put eurorackgrid/modules/4c7034c8_physical-modeler.webp --file=./r2-ready/4c7034c8_physical-modeler.svg
wrangler r2 object put eurorackgrid/previews/4c7034c8_physical-modeler.jpg --file=./r2-ready/4c7034c8_physical-modeler.svg
wrangler r2 object put eurorackgrid/modules/e5753518_voltaged-gray.webp --file=./r2-ready/e5753518_voltaged-gray.svg
wrangler r2 object put eurorackgrid/previews/e5753518_voltaged-gray.jpg --file=./r2-ready/e5753518_voltaged-gray.svg
wrangler r2 object put eurorackgrid/modules/f53cfbed_complex-oscillator.webp --file=./r2-ready/f53cfbed_complex-oscillator.svg
wrangler r2 object put eurorackgrid/previews/f53cfbed_complex-oscillator.jpg --file=./r2-ready/f53cfbed_complex-oscillator.svg
wrangler r2 object put eurorackgrid/modules/1a29478a_textural-synthesizer.webp --file=./r2-ready/1a29478a_textural-synthesizer.svg
wrangler r2 object put eurorackgrid/previews/1a29478a_textural-synthesizer.jpg --file=./r2-ready/1a29478a_textural-synthesizer.svg
wrangler r2 object put eurorackgrid/modules/336a5867_mangler-tangler.webp --file=./r2-ready/336a5867_mangler-tangler.svg
wrangler r2 object put eurorackgrid/previews/336a5867_mangler-tangler.jpg --file=./r2-ready/336a5867_mangler-tangler.svg
wrangler r2 object put eurorackgrid/modules/79adcc1a_altered-black.webp --file=./r2-ready/79adcc1a_altered-black.svg
wrangler r2 object put eurorackgrid/previews/79adcc1a_altered-black.jpg --file=./r2-ready/79adcc1a_altered-black.svg

echo "✅ Upload complete!"
>>>>>>> cb45dfab69c0fffff51323284bc6c5bc82291fb1
