#!/bin/bash

echo "Creating a test seed image and uploading it..."

# Create a simple test image using ImageMagick or sips (macOS)
if command -v sips &> /dev/null; then
    # Create a simple colored square as a test
    echo "Creating test seed image..."
    # Create a 200x200 purple image for testing
    cat > test-seed.html << 'EOF'
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#9C27B0"/>
  <text x="100" y="100" text-anchor="middle" fill="white" font-size="30">SEED</text>
</svg>
EOF
    
    # Convert to PNG first (sips doesn't handle SVG well)
    echo "Note: You'll need to manually convert this to an image"
    echo "For testing, you can use any image file you have"
fi

echo ""
echo "To upload a seed image to R2, use this exact command:"
echo ""
echo "  wrangler r2 object put eurorackgridseeds/seed-001.webp --file ./your-image.webp"
echo ""
echo "Or if you have a folder of seed images:"
echo ""
echo "  for i in {1..11}; do"
echo "    PADDED=\$(printf \"%03d\" \$i)"
echo "    wrangler r2 object put eurorackgridseeds/seed-\${PADDED}.webp --file ./seeds/seed-\${PADDED}.webp"
echo "  done"
echo ""
echo "Make sure the files are named EXACTLY:"
echo "  seed-001.webp (not seed-1.webp or seed_001.webp)"
echo "  seed-002.webp"
echo "  etc."