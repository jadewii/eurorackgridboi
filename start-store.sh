#!/bin/bash

echo "🛍️  Starting Printify Store..."
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the backend server
echo "🚀 Starting backend server on http://localhost:3000"
echo ""
echo "✨ Demo Mode is ACTIVE - No real API keys needed!"
echo ""
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open the frontend in default browser
echo "🌐 Opening store in browser..."
echo ""

# Check the operating system and open accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open ../frontend/index.html
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open ../frontend/index.html
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows
    start ../frontend/index.html
fi

echo "✅ Store is running!"
echo ""
echo "📝 Next steps to connect to Printify:"
echo "1. Get your Printify API key from printify.com"
echo "2. Get your Stripe keys from stripe.com"
echo "3. Edit backend/.env with your actual keys"
echo "4. Set DEMO_MODE=false in backend/.env"
echo "5. Update STRIPE_PUBLIC_KEY in frontend/store.js"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Wait for the server process
wait $SERVER_PID