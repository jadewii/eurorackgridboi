#!/bin/bash

echo "Uploading pack wrapper/package images from Downloads folder..."
echo ""

DOWNLOADS_DIR="$HOME/Downloads"

# Upload earth1.png as pack-earth.webp (for pack displays)
if [ -f "$DOWNLOADS_DIR/earth1.png" ]; then
    echo "Uploading earth1.png as pack-earth.webp..."
    wrangler r2 object put eurorackgridseeds/pack-earth.webp --file "$DOWNLOADS_DIR/earth1.png"
    echo "✓ Earth pack image uploaded"
fi

# Upload space1.png as pack-space.webp (for pack displays)
if [ -f "$DOWNLOADS_DIR/space1.png" ]; then
    echo "Uploading space1.png as pack-space.webp..."
    wrangler r2 object put eurorackgridseeds/pack-space.webp --file "$DOWNLOADS_DIR/space1.png"
    echo "✓ Space pack image uploaded"
fi

# Upload multi1.png as pack-multi.webp (for pack displays)
if [ -f "$DOWNLOADS_DIR/multi1.png" ]; then
    echo "Uploading multi1.png as pack-multi.webp..."
    wrangler r2 object put eurorackgridseeds/pack-multi.webp --file "$DOWNLOADS_DIR/multi1.png"
    echo "✓ Multiverse pack image uploaded"
fi

echo ""
echo "Pack images uploaded! These will be displayed on the Mystery Pack cards."