# Printify Store Setup Guide

This guide will help you set up your custom HTML store with automatic Printify fulfillment.

## Prerequisites

1. **Printify Account**: Sign up at [printify.com](https://printify.com)
2. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
3. **Node.js**: Install from [nodejs.org](https://nodejs.org)

## Step 1: Get Your API Keys

### Printify API Setup
1. Log into your Printify account
2. Go to Account Settings > Connections
3. Click "Manage API Access"
4. Generate a new API token
5. Copy your API token and Shop ID

### Stripe Setup
1. Log into your Stripe Dashboard
2. Go to Developers > API keys
3. Copy your publishable key (starts with `pk_`)
4. Copy your secret key (starts with `sk_`)
5. Set up webhooks:
   - Go to Developers > Webhooks
   - Add endpoint: `http://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

## Step 2: Configure the Backend

1. Navigate to the backend directory:
   ```bash
   cd printify-store/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your actual keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   PRINTIFY_API_KEY=your_printify_api_key
   PRINTIFY_SHOP_ID=your_shop_id
   PORT=3000
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Step 3: Configure the Frontend

1. Open `frontend/store.js`
2. Update these lines with your actual values:
   ```javascript
   const API_URL = 'http://localhost:3000/api'; // Change to your backend URL
   const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY'; // Your Stripe publishable key
   ```

## Step 4: Set Up Printify Products

1. In Printify, create your products with designs
2. Publish products to your store
3. Note the product IDs and variant IDs
4. Update the `sampleProducts` array in `store.js` with your actual product data

## Step 5: Configure Webhooks

### Printify Webhooks
1. In Printify, go to Account Settings > Webhooks
2. Add webhook URL: `http://yourdomain.com/api/webhooks/printify`
3. Select events you want to track (order:shipped, order:created, etc.)

## Step 6: Deploy Your Store

### For Testing Locally:
1. Start the backend server: `npm start` (in backend folder)
2. Open `frontend/index.html` in a browser
3. Use Stripe test cards for payment testing

### For Production:

#### Backend Deployment (using services like Heroku, Railway, or Render):
1. Push your code to GitHub
2. Connect your repository to your hosting service
3. Set environment variables in the hosting dashboard
4. Deploy the backend

#### Frontend Deployment:
1. Update `API_URL` in `store.js` to your production backend URL
2. Host on any static hosting service (Netlify, Vercel, GitHub Pages)
3. Or upload to your web hosting provider

## How Automatic Fulfillment Works

1. **Customer places order** on your HTML site
2. **Payment processed** through Stripe
3. **Order automatically sent to Printify** via API
4. **Printify fulfills order** (prints and ships)
5. **Customer receives tracking** information
6. **You get paid** (Stripe payment minus Printify costs)

## Testing the Flow

1. Add a product to cart
2. Proceed to checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete the order
5. Check Printify dashboard for the order
6. Order should appear as "In Production"

## Important Notes

- **SSL Certificate**: Required for production (use Let's Encrypt for free SSL)
- **Domain**: You'll need a domain name for production
- **Testing**: Always test with Stripe test mode first
- **Printify Balance**: Ensure you have funds or payment method in Printify
- **Shipping Costs**: Configure shipping profiles in Printify

## Customization Tips

- Modify `styles.css` to match your brand
- Add more product details and images
- Implement product search and filters
- Add customer reviews functionality
- Create email notifications
- Add order tracking page

## Security Considerations

1. Never expose API keys in frontend code
2. Use HTTPS in production
3. Validate all user inputs
4. Implement rate limiting
5. Add CORS configuration for your domain only
6. Use environment variables for all sensitive data

## Support

- Printify API Docs: [printify.com/api/docs](https://developers.printify.com/)
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)
- For issues with this setup, check the error logs in your server console

## Next Steps

1. Add more products from Printify
2. Customize the design to match your brand
3. Add SEO optimization
4. Implement customer accounts
5. Add product reviews and ratings
6. Create marketing landing pages