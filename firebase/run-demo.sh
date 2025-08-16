#!/bin/bash

echo "🎛️ EURORACK.GRID Demo Launcher"
echo "=============================="
echo ""
echo "Opening the demo in your browser..."
echo ""

# Open the test demo file
open test-demo.html

echo "✅ Demo opened!"
echo ""
echo "This demo shows:"
echo "- Module purchasing with jamnutz"
echo "- Static modules in inventory"
echo "- Animated modules when placed in rack"
echo ""
echo "No Firebase setup required - it uses localStorage!"
echo ""
echo "To test the full version with Firebase:"
echo "1. Run: ./quick-setup.sh"
echo "2. Follow the Firebase setup steps"
echo "3. Open index.html"