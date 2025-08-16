#!/bin/bash

echo "🚀 eurorack.store Setup Script"
echo "================================"
echo ""

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo ""
fi

echo "📋 Next Steps:"
echo ""
echo "1. GET YOUR API KEYS:"
echo "   ------------------"
echo "   🔵 Stripe: https://dashboard.stripe.com/apikeys"
echo "      - Sign up/login at stripe.com"
echo "      - Copy your test Secret Key (starts with sk_test_)"
echo "      - Copy your test Publishable Key (starts with pk_test_)"
echo ""
echo "   🟣 Printify: https://printify.com/app/account/api"
echo "      - Sign up/login at printify.com"
echo "      - Generate a Personal Access Token"
echo "      - Get your Shop ID from the shop settings"
echo ""
echo "2. UPDATE YOUR KEYS:"
echo "   -----------------"
echo "   Edit backend/.env and add:"
echo "   - STRIPE_SECRET_KEY=sk_test_YOUR_KEY"
echo "   - PRINTIFY_API_TOKEN=YOUR_TOKEN"
echo "   - PRINTIFY_SHOP_ID=YOUR_SHOP_ID"
echo ""
echo "   Edit frontend/checkout.html line 243:"
echo "   - Replace pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE"
echo ""
echo "3. START THE SERVERS:"
echo "   ------------------"
echo "   Terminal 1 (Backend):"
echo "   cd backend && npm start"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   cd frontend && python3 -m http.server 8000"
echo ""
echo "4. TEST YOUR STORE:"
echo "   ----------------"
echo "   Open: http://localhost:8000/stickers.html"
echo "   Test card: 4242 4242 4242 4242"
echo "   Any future date, any CVC"
echo ""
echo "5. OPTIONAL - DEMO MODE:"
echo "   ---------------------"
echo "   To test without API keys, add to backend/.env:"
echo "   DEMO_MODE=true"
echo ""

# Ask if user wants to start servers now
read -p "Start the servers now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    
    echo "Starting frontend server..."
    cd ../frontend
    python3 -m http.server 8000 &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ Servers started!"
    echo "   Backend: http://localhost:3000 (PID: $BACKEND_PID)"
    echo "   Frontend: http://localhost:8000 (PID: $FRONTEND_PID)"
    echo ""
    echo "   Open: http://localhost:8000/stickers.html"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    
    # Wait for Ctrl+C
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi