#!/bin/bash

# EUROGRID Quick Deploy Script
# Deploys to Netlify for instant testing

echo "🚀 EUROGRID Quick Deploy"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Preparing for deployment...${NC}"

# Check if we're in the right directory
if [ ! -f "landing.html" ]; then
    echo "❌ Error: Not in the frontend directory"
    echo "Please run this script from the frontend folder"
    exit 1
fi

# Create a simple index.html that redirects to landing.html
echo "Creating index.html redirect..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>EUROGRID - Loading...</title>
    <meta http-equiv="refresh" content="0; url=landing.html">
    <script>
        window.location.href = "landing.html";
    </script>
</head>
<body>
    <p>Redirecting to EUROGRID...</p>
</body>
</html>
EOF

echo -e "${GREEN}✓ Index redirect created${NC}"

# Check for Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}Installing Netlify CLI...${NC}"
    npm install -g netlify-cli
fi

# Generate site name with timestamp
SITE_NAME="eurogrid-test-$(date +%Y%m%d-%H%M%S)"

echo ""
echo -e "${YELLOW}Deploying to Netlify...${NC}"
echo "Site name: $SITE_NAME"
echo ""

# Deploy to Netlify
netlify deploy --prod --dir . --site "$SITE_NAME"

# Get the deployment URL (Netlify will output it)
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Your test site is now live!"
echo ""
echo "Test these features:"
echo "  1. Create an account (gets 1000 jamnutz)"
echo "  2. Purchase modules (500 jamnutz each)"
echo "  3. Check My Studio page"
echo "  4. Test navigation between pages"
echo ""
echo "Test Pages:"
echo "  - Purchase Flow Test: /test-purchase.html"
echo "  - Data Persistence Test: /test-persistence.html"
echo ""
echo -e "${YELLOW}Note: Images may not load (Supabase bucket required)${NC}"