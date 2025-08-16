#!/bin/bash

# EUROGRID Image Compression Script
# This script optimizes PNG and GIF files for web performance

echo "🎛️ EUROGRID Image Optimizer"
echo "=========================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    brew install imagemagick
fi

# Check if gifski is installed for better GIF compression
if ! command -v gifski &> /dev/null; then
    echo "📦 Installing gifski for better GIF compression..."
    brew install gifski
fi

# Create optimized directory
mkdir -p optimized

echo ""
echo "🔧 Optimization Settings:"
echo "  - Max width: 400px"
echo "  - PNG compression: Level 9"
echo "  - JPEG quality: 85%"
echo "  - GIF frame reduction: 50%"
echo ""

# Function to optimize PNG files
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")
    echo "  🖼️ Optimizing PNG: $filename"
    
    # Resize and compress
    convert "$file" \
        -resize '400x400>' \
        -strip \
        -quality 85 \
        -define png:compression-level=9 \
        -define png:compression-filter=5 \
        -define png:compression-strategy=1 \
        "optimized/$filename"
    
    # Additional PNG optimization with pngquant if available
    if command -v pngquant &> /dev/null; then
        pngquant --force --quality=65-90 "optimized/$filename" --output "optimized/$filename"
    fi
}

# Function to optimize GIF files
optimize_gif() {
    local file="$1"
    local filename=$(basename "$file")
    echo "  🎬 Optimizing GIF: $filename"
    
    # Reduce frames and resize
    convert "$file" \
        -coalesce \
        -resize '400x400>' \
        -deconstruct \
        -layers Optimize \
        -fuzz 2% \
        +dither \
        -colors 128 \
        "optimized/$filename"
}

# Function to convert to WebP
convert_to_webp() {
    local file="$1"
    local filename="${1%.*}.webp"
    local basename=$(basename "$filename")
    echo "  🔄 Converting to WebP: $basename"
    
    convert "$file" \
        -resize '400x400>' \
        -quality 85 \
        -define webp:method=6 \
        "optimized/$basename"
}

# Process all PNG files
echo "📁 Processing PNG files..."
for file in *.png; do
    if [ -f "$file" ]; then
        optimize_png "$file"
        convert_to_webp "$file"
    fi
done

# Process all GIF files
echo "📁 Processing GIF files..."
for file in *.gif; do
    if [ -f "$file" ]; then
        optimize_gif "$file"
    fi
done

# Show size comparison
echo ""
echo "📊 Size Comparison:"
echo "-------------------"
original_size=$(du -sh *.png *.gif 2>/dev/null | awk '{sum+=$1} END {print sum}')
optimized_size=$(du -sh optimized/* 2>/dev/null | awk '{sum+=$1} END {print sum}')

echo "Original total: ${original_size:-0} KB"
echo "Optimized total: ${optimized_size:-0} KB"

echo ""
echo "✅ Optimization complete!"
echo "📁 Optimized files saved in: ./optimized/"
echo ""
echo "💡 Tips for better performance:"
echo "  1. Use lazy loading (already added to your HTML)"
echo "  2. Serve WebP with PNG fallback"
echo "  3. Use CDN with image optimization (Supabase supports this)"
echo "  4. Consider replacing GIFs with CSS animations where possible"