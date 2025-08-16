#!/bin/bash

# PNG Sequence to Animated WebP Converter
# Usage: ./convert_pngs_to_animated_webp.sh [input_pattern] [output_name]
# Example: ./convert_pngs_to_animated_webp.sh "IMG_9279" "dpo"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
INPUT_PATTERN="${1:-IMG_9279}"
OUTPUT_NAME="${2:-output}"
FRAMERATE=15
QUALITY=95

echo -e "${GREEN}🎬 PNG Sequence to Animated WebP Converter${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}❌ Error: ffmpeg is not installed${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Find PNG files matching pattern
PNG_FILES=(~/Downloads/${INPUT_PATTERN}-*.png)
if [ ! -f "${PNG_FILES[0]}" ]; then
    echo -e "${RED}❌ No PNG files found matching pattern: ${INPUT_PATTERN}-*.png${NC}"
    echo "Expected format: ${INPUT_PATTERN}-1.png, ${INPUT_PATTERN}-2.png, etc."
    exit 1
fi

FRAME_COUNT=${#PNG_FILES[@]}
echo -e "${GREEN}✓${NC} Found ${FRAME_COUNT} PNG files"

# Get dimensions of first image
DIMENSIONS=$(identify -format "%wx%h" "${PNG_FILES[0]}" 2>/dev/null)
echo -e "${GREEN}✓${NC} Image dimensions: ${DIMENSIONS}"

# Ask user for animation type
echo ""
echo "Choose animation type:"
echo "1) Loop (plays forward, repeats)"
echo "2) Pingpong (plays forward then backward, smooth)"
echo -n "Enter choice [1-2] (default: 2): "
read -r ANIMATION_TYPE
ANIMATION_TYPE=${ANIMATION_TYPE:-2}

# Create temporary directory for frames
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}✓${NC} Created temp directory: ${TEMP_DIR}"

# Copy and prepare frames based on animation type
if [ "$ANIMATION_TYPE" = "1" ]; then
    echo -e "${YELLOW}→${NC} Creating loop animation..."
    # Simple loop - just copy files with sequential numbering
    i=1
    for file in "${PNG_FILES[@]}"; do
        cp "$file" "${TEMP_DIR}/frame_$(printf "%03d" $i).png"
        ((i++))
    done
    TOTAL_FRAMES=$FRAME_COUNT
else
    echo -e "${YELLOW}→${NC} Creating pingpong animation..."
    # Pingpong - forward + reverse (minus last frame to avoid duplicate)
    i=1
    # Forward
    for file in "${PNG_FILES[@]}"; do
        cp "$file" "${TEMP_DIR}/frame_$(printf "%03d" $i).png"
        ((i++))
    done
    # Reverse (skip last frame to avoid duplicate at turn point)
    for ((j=${#PNG_FILES[@]}-2; j>=0; j--)); do
        cp "${PNG_FILES[$j]}" "${TEMP_DIR}/frame_$(printf "%03d" $i).png"
        ((i++))
    done
    TOTAL_FRAMES=$((FRAME_COUNT * 2 - 2))
fi

echo -e "${GREEN}✓${NC} Prepared ${TOTAL_FRAMES} frames for animation"

# Ask about quality/size preference
echo ""
echo "Choose quality preset:"
echo "1) Hero/Featured (q:95, full res) ~400-500KB"
echo "2) Standard (q:90, full res) ~200-300KB"
echo "3) Optimized (q:85, 1024px) ~100-150KB"
echo "4) Thumbnail (q:80, 512px) ~50-80KB"
echo -n "Enter choice [1-4] (default: 1): "
read -r QUALITY_PRESET
QUALITY_PRESET=${QUALITY_PRESET:-1}

case $QUALITY_PRESET in
    1)
        QUALITY=95
        SCALE_CMD=""
        PRESET_NAME="Hero Quality"
        ;;
    2)
        QUALITY=90
        SCALE_CMD=""
        PRESET_NAME="Standard Quality"
        ;;
    3)
        QUALITY=85
        SCALE_CMD="-vf scale=1024:-1"
        PRESET_NAME="Optimized"
        ;;
    4)
        QUALITY=80
        SCALE_CMD="-vf scale=512:-1"
        PRESET_NAME="Thumbnail"
        ;;
    *)
        QUALITY=95
        SCALE_CMD=""
        PRESET_NAME="Hero Quality"
        ;;
esac

echo -e "${YELLOW}→${NC} Using preset: ${PRESET_NAME} (q:${QUALITY})"

# Create the animated WebP
OUTPUT_FILE=~/Downloads/${OUTPUT_NAME}_animated.webp
echo -e "${YELLOW}→${NC} Creating animated WebP..."

if ffmpeg -y -framerate $FRAMERATE -i "${TEMP_DIR}/frame_%03d.png" \
    $SCALE_CMD -lossless 0 -q:v $QUALITY -loop 0 \
    "$OUTPUT_FILE" 2>/dev/null; then
    
    # Get file size
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓${NC} Successfully created: ${OUTPUT_FILE}"
    echo -e "${GREEN}✓${NC} File size: ${FILE_SIZE}"
    
    # Create a static version too (first frame only)
    STATIC_FILE=~/Downloads/${OUTPUT_NAME}_static.webp
    ffmpeg -y -i "${PNG_FILES[0]}" $SCALE_CMD -lossless 0 -q:v $QUALITY \
        "$STATIC_FILE" 2>/dev/null
    STATIC_SIZE=$(ls -lh "$STATIC_FILE" | awk '{print $5}')
    echo -e "${GREEN}✓${NC} Also created static version: ${STATIC_FILE} (${STATIC_SIZE})"
    
else
    echo -e "${RED}❌ Error creating WebP file${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✓${NC} Cleaned up temporary files"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Conversion complete!${NC}"
echo ""
echo "Files created:"
echo "  • Animated: ${OUTPUT_FILE} (${FILE_SIZE})"
echo "  • Static:   ${STATIC_FILE} (${STATIC_SIZE})"
echo ""
echo "Next steps:"
echo "1. Upload to Cloudflare R2 via dashboard"
echo "2. Use URL: https://your-bucket.r2.dev/${OUTPUT_NAME}_animated.webp"
echo ""
echo "Animation details:"
echo "  • Frames: ${TOTAL_FRAMES}"
echo "  • FPS: ${FRAMERATE}"
echo "  • Quality: ${QUALITY}"
echo "  • Loop: Infinite"