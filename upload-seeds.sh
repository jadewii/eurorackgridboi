#!/bin/bash

echo "Uploading seed images to R2 bucket..."
echo "Make sure your seed images are in the current directory"
echo ""

# Upload seed images
# Adjust these paths to where your seed images are located
SEEDS_DIR="./seeds"  # Change this to your seeds folder path

if [ -d "$SEEDS_DIR" ]; then
    for i in {1..8}; do
        PADDED=$(printf "%03d" $i)
        SOURCE_FILE="$SEEDS_DIR/seed-$PADDED.webp"
        
        if [ -f "$SOURCE_FILE" ]; then
            echo "Uploading seed-$PADDED.webp..."
            wrangler r2 object put eurorackgridseeds/seed-$PADDED.webp --file="$SOURCE_FILE"
        else
            echo "Warning: $SOURCE_FILE not found"
        fi
    done
else
    echo "Seeds directory not found at $SEEDS_DIR"
    echo "Please update the SEEDS_DIR variable in this script"
fi

echo ""
echo "Upload complete!"
echo "The pack shop will now display:"
echo "- Sprout Pack: seeds 1, 2, 3"
echo "- Garden Pack: seeds 4, 5, 6"
echo "- Banner Pack: seeds 7, 8 (larger)"