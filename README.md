# Printify Store - Custom HTML E-commerce with Automatic Fulfillment

A complete e-commerce solution that connects your custom HTML store to Printify for automatic print-on-demand fulfillment.

## Features

✅ **Custom HTML/CSS/JS Store** - Full control over design and functionality  
✅ **Shopping Cart** - Add to cart, update quantities, persistent storage  
✅ **Stripe Payments** - Secure payment processing  
✅ **Automatic Fulfillment** - Orders sent to Printify automatically  
✅ **Webhook Integration** - Real-time order status updates  
✅ **Responsive Design** - Works on all devices  
✅ **Product Variants** - Size, color, and style options  

## Project Structure

```
printify-store/
├── frontend/           # HTML store frontend
│   ├── index.html     # Main store page
│   ├── styles.css     # Store styling
│   └── store.js       # Store functionality
├── backend/           # Node.js backend server
│   ├── server.js      # Express server with API endpoints
│   ├── sync-products.js  # Product sync utility
│   ├── package.json   # Dependencies
│   └── .env.example   # Environment variables template
└── SETUP_GUIDE.md     # Detailed setup instructions
```

## Quick Start

### 1. Clone and Install

```bash
# Navigate to backend
cd printify-store/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 2. Configure API Keys

Edit `.env` file with your actual keys:
- Printify API key (from Printify dashboard)
- Printify Shop ID
- Stripe secret key
- Stripe webhook secret

### 3. Update Frontend Config

Edit `frontend/store.js`:
- Set your Stripe publishable key
- Update API_URL if needed

### 4. Run the Store

```bash
# Start backend server
cd backend
npm start

# Open frontend in browser
open ../frontend/index.html
```

## How It Works

1. **Customer browses products** - Products displayed from your catalog
2. **Adds items to cart** - Cart persists in browser storage
3. **Proceeds to checkout** - Enters shipping and payment info
4. **Payment processed** - Stripe handles secure payment
5. **Order sent to Printify** - Automatic API call to create order
6. **Printify fulfills** - Prints and ships the product
7. **Customer notified** - Receives order confirmation and tracking

## Key Files Explained

- **frontend/store.js** - Main store logic, cart management, Stripe integration
- **backend/server.js** - API endpoints, Printify integration, order processing
- **backend/sync-products.js** - Utility to fetch your Printify products

## Deployment

### Backend
Deploy to any Node.js hosting service (Heroku, Railway, Render, etc.)

### Frontend
Host on any static hosting (Netlify, Vercel, GitHub Pages, etc.)

## Customization

- **Design**: Modify `styles.css` for your brand
- **Products**: Update product data in `store.js`
- **Features**: Add search, filters, reviews, etc.
- **Emails**: Add email notifications in `server.js`

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Support

See `SETUP_GUIDE.md` for detailed setup instructions and troubleshooting.

## License

MIT - Use this code for your own store!