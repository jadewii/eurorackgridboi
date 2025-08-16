#!/bin/bash

echo "Fixing all absolute paths to relative paths..."

# Fix all HTML files that use /assets/
for file in *.html; do
    if [ -f "$file" ]; then
        # Fix asset paths
        sed -i '' 's|href="/assets/|href="assets/|g' "$file"
        sed -i '' 's|src="/assets/|src="assets/|g' "$file"
        
        # Fix root-relative links in onclick handlers
        sed -i '' "s|window.location.href='/|window.location.href='|g" "$file"
        
        echo "Fixed: $file"
    fi
done

echo "All paths fixed!"