#!/bin/bash

echo "Uploading Plant Images to Private R2 Bucket"
echo "==========================================="
echo ""

# Path to local plant images
PLANTS_DIR="/Users/jade/Documents/plants/webp"

if [ ! -d "$PLANTS_DIR" ]; then
    echo "Error: Plants directory not found at $PLANTS_DIR"
    exit 1
fi

echo "Found plants directory at: $PLANTS_DIR"
echo ""

# Upload all plant images
echo "Uploading plant images to private R2 bucket..."
for file in "$PLANTS_DIR"/plant-*.webp; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Uploading $filename..."
        wrangler r2 object put "jamnutz-media/$filename" --file="$file"
    fi
done

echo ""
echo "Upload complete!"
echo ""
echo "Images are now in your PRIVATE R2 bucket and can only be accessed through the Worker API."