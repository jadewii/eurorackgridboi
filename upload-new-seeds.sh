#!/bin/bash

echo "Uploading new seed images from Downloads folder..."
echo ""

# Define the source files and their target names
DOWNLOADS_DIR="$HOME/Downloads"

# Check if files exist
if [ ! -f "$DOWNLOADS_DIR/earth1.webp" ] && [ ! -f "$DOWNLOADS_DIR/earth1.png" ] && [ ! -f "$DOWNLOADS_DIR/earth1.jpg" ]; then
    echo "Warning: earth1 file not found in Downloads"
    echo "Looking for: earth1.webp, earth1.png, or earth1.jpg"
fi

if [ ! -f "$DOWNLOADS_DIR/space1.webp" ] && [ ! -f "$DOWNLOADS_DIR/space1.png" ] && [ ! -f "$DOWNLOADS_DIR/space1.jpg" ]; then
    echo "Warning: space1 file not found in Downloads"
    echo "Looking for: space1.webp, space1.png, or space1.jpg"
fi

if [ ! -f "$DOWNLOADS_DIR/multi1.webp" ] && [ ! -f "$DOWNLOADS_DIR/multi1.png" ] && [ ! -f "$DOWNLOADS_DIR/multi1.jpg" ]; then
    echo "Warning: multi1 file not found in Downloads"
    echo "Looking for: multi1.webp, multi1.png, or multi1.jpg"
fi

# Upload earth1 as seed-001.webp (Earth Seed)
for ext in webp png jpg jpeg; do
    if [ -f "$DOWNLOADS_DIR/earth1.$ext" ]; then
        echo "Uploading earth1.$ext as seed-001.webp..."
        wrangler r2 object put eurorackgridseeds/seed-001.webp --file "$DOWNLOADS_DIR/earth1.$ext"
        echo "✓ Earth Seed uploaded"
        break
    fi
done

# Upload space1 as seed-002.webp (Space Seed)
for ext in webp png jpg jpeg; do
    if [ -f "$DOWNLOADS_DIR/space1.$ext" ]; then
        echo "Uploading space1.$ext as seed-002.webp..."
        wrangler r2 object put eurorackgridseeds/seed-002.webp --file "$DOWNLOADS_DIR/space1.$ext"
        echo "✓ Space Seed uploaded"
        break
    fi
done

# Upload multi1 as seed-003.webp (Multiverse Seed)
for ext in webp png jpg jpeg; do
    if [ -f "$DOWNLOADS_DIR/multi1.$ext" ]; then
        echo "Uploading multi1.$ext as seed-003.webp..."
        wrangler r2 object put eurorackgridseeds/seed-003.webp --file "$DOWNLOADS_DIR/multi1.$ext"
        echo "✓ Multiverse Seed uploaded"
        break
    fi
done

echo ""
echo "Upload complete! The seeds should now show in your pack shop:"
echo "- Earth Seed: uses seed-001.webp"
echo "- Space Seed: uses seed-002.webp"
echo "- Multiverse Seed: uses seed-003.webp"
echo ""
echo "Refresh your browser to see the new images!"