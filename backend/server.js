const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Initialize Stripe with your secret key (skip in demo mode)
const stripeClient = DEMO_MODE ? null : stripe(process.env.STRIPE_SECRET_KEY);

// Printify API configuration
const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_URL = 'https://api.printify.com/v1';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Printify API headers
const printifyHeaders = {
    'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
    'Content-Type': 'application/json'
};

// Demo products for testing - organized by category
const demoProducts = [
    // T-SHIRTS
    {
        id: 'demo_1',
        title: 'Eurorack Modular T-Shirt',
        category: 'shirts',
        description: 'High quality cotton t-shirt with eurorack design',
        images: [{ src: 'https://via.placeholder.com/400x500/4F46E5/ffffff?text=Eurorack+Tee' }],
        variants: [
            { id: 'v1', title: 'Small - Black', price: 24.99, isEnabled: true },
            { id: 'v2', title: 'Medium - Black', price: 24.99, isEnabled: true },
            { id: 'v3', title: 'Large - Black', price: 24.99, isEnabled: true },
            { id: 'v4', title: 'Small - White', price: 24.99, isEnabled: true },
            { id: 'v5', title: 'Medium - White', price: 24.99, isEnabled: true },
            { id: 'v6', title: 'Large - White', price: 24.99, isEnabled: true }
        ]
    },
    {
        id: 'demo_5',
        title: 'Synth Waveform T-Shirt',
        category: 'shirts',
        description: 'Waveform pattern design for synth enthusiasts',
        images: [{ src: 'https://via.placeholder.com/400x500/059669/ffffff?text=Waveform+Tee' }],
        variants: [
            { id: 'v20', title: 'Small - Navy', price: 26.99, isEnabled: true },
            { id: 'v21', title: 'Medium - Navy', price: 26.99, isEnabled: true },
            { id: 'v22', title: 'Large - Navy', price: 26.99, isEnabled: true }
        ]
    },
    
    // HOODIES
    {
        id: 'demo_2',
        title: 'Modular Synth Hoodie',
        category: 'hoodies',
        description: 'Comfortable hoodie with synth graphics',
        images: [{ src: 'https://via.placeholder.com/400x500/764ba2/ffffff?text=Synth+Hoodie' }],
        variants: [
            { id: 'v7', title: 'Small - Gray', price: 44.99, isEnabled: true },
            { id: 'v8', title: 'Medium - Gray', price: 44.99, isEnabled: true },
            { id: 'v9', title: 'Large - Gray', price: 44.99, isEnabled: true },
            { id: 'v10', title: 'XL - Gray', price: 44.99, isEnabled: true }
        ]
    },
    
    // ACCESSORIES
    {
        id: 'demo_3',
        title: 'Synth Coffee Mug',
        category: 'accessories',
        description: 'Start your day with synthesis',
        images: [{ src: 'https://via.placeholder.com/400x500/DC2626/ffffff?text=Synth+Mug' }],
        variants: [
            { id: 'v11', title: '11oz - White', price: 14.99, isEnabled: true },
            { id: 'v12', title: '15oz - White', price: 16.99, isEnabled: true }
        ]
    },
    {
        id: 'demo_7',
        title: 'Modular Tote Bag',
        category: 'accessories',
        description: 'Carry your cables in style',
        images: [{ src: 'https://via.placeholder.com/400x500/F59E0B/ffffff?text=Tote+Bag' }],
        variants: [
            { id: 'v26', title: 'Standard - Natural', price: 22.99, isEnabled: true },
            { id: 'v27', title: 'Standard - Black', price: 22.99, isEnabled: true }
        ]
    },
    
    // ART PRINTS
    {
        id: 'demo_4',
        title: 'Modular Setup Canvas',
        category: 'prints',
        description: 'Beautiful canvas print of modular setup',
        images: [{ src: 'https://via.placeholder.com/400x500/7C3AED/ffffff?text=Canvas+Print' }],
        variants: [
            { id: 'v13', title: '12x12 inch', price: 39.99, isEnabled: true },
            { id: 'v14', title: '16x16 inch', price: 49.99, isEnabled: true },
            { id: 'v15', title: '20x20 inch', price: 59.99, isEnabled: true }
        ]
    },
    
    // STICKERS
    {
        id: 'demo_10',
        title: 'Synth Brand Sticker Pack',
        category: 'stickers',
        description: 'Collection of synth brand stickers',
        images: [{ src: 'https://via.placeholder.com/400x500/EC4899/ffffff?text=Stickers' }],
        variants: [
            { id: 'v33', title: '5 Pack - Mixed', price: 8.99, isEnabled: true },
            { id: 'v34', title: '10 Pack - Mixed', price: 15.99, isEnabled: true }
        ]
    }
];

// Get products from Printify
app.get('/api/products', async (req, res) => {
    try {
        if (DEMO_MODE) {
            // Return demo products in demo mode
            res.json({ success: true, products: demoProducts });
            return;
        }

        const response = await axios.get(
            `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`,
            { headers: printifyHeaders }
        );
        
        // Transform Printify products to match our frontend format
        const products = response.data.data.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            images: product.images,
            variants: product.variants.map(variant => ({
                id: variant.id,
                title: variant.title,
                price: variant.price / 100, // Printify returns price in cents
                isEnabled: variant.is_enabled
            }))
        }));
        
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
});

// Create order and process payment
app.post('/api/create-order', async (req, res) => {
    try {
        const { items, customer, paymentMethodId, total } = req.body;
        
        if (DEMO_MODE) {
            // Demo mode: simulate successful order
            console.log('DEMO MODE: Order received');
            console.log('Customer:', customer?.email || 'No email');
            console.log('Items:', items?.length || 0);
            console.log('Total:', `$${total || 0}`);
            
            // Simulate order ID
            const demoOrderId = `DEMO_${Date.now()}`;
            
            res.json({
                success: true,
                orderId: demoOrderId,
                paymentIntentId: `demo_payment_${Date.now()}`,
                message: 'Demo order placed successfully (no real payment processed)',
                demoMode: true
            });
            return;
        }
        
        // Step 1: Create payment intent with Stripe
        const paymentIntent = await stripeClient.paymentIntents.create({
            amount: Math.round(total * 100), // Stripe expects amount in cents
            currency: 'usd',
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            metadata: {
                customer_email: customer.email,
                customer_name: customer.name
            }
        });
        
        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Payment failed');
        }
        
        // Step 2: Create order in Printify
        const printifyOrder = await createPrintifyOrder(items, customer, paymentIntent.id);
        
        // Step 3: Submit order to production
        await submitOrderToProduction(printifyOrder.id);
        
        // Step 4: Send confirmation email (optional)
        // await sendConfirmationEmail(customer.email, printifyOrder);
        
        res.json({
            success: true,
            orderId: printifyOrder.id,
            paymentIntentId: paymentIntent.id,
            message: 'Order placed successfully'
        });
        
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
});

// Create order in Printify
async function createPrintifyOrder(items, customer, paymentId) {
    try {
        // Format line items for Printify
        const lineItems = items.map(item => ({
            product_id: item.printifyId,
            variant_id: item.variantId,
            quantity: item.quantity
        }));
        
        // Create order payload
        const orderData = {
            external_id: paymentId, // Use Stripe payment ID as external reference
            label: `Order-${Date.now()}`,
            line_items: lineItems,
            shipping_method: 1, // Standard shipping (you can make this configurable)
            is_printify_express: false,
            send_shipping_notification: true,
            address_to: {
                first_name: customer.name.split(' ')[0],
                last_name: customer.name.split(' ').slice(1).join(' ') || '',
                email: customer.email,
                phone: customer.phone || '',
                country: customer.address.country,
                region: customer.address.state,
                address1: customer.address.line1,
                address2: customer.address.line2 || '',
                city: customer.address.city,
                zip: customer.address.postal_code
            }
        };
        
        // Send order to Printify
        const response = await axios.post(
            `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/orders.json`,
            orderData,
            { headers: printifyHeaders }
        );
        
        return response.data;
    } catch (error) {
        console.error('Printify order creation error:', error.response?.data || error);
        throw new Error('Failed to create Printify order');
    }
}

// Submit order to production (automatic fulfillment)
async function submitOrderToProduction(orderId) {
    try {
        const response = await axios.post(
            `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/orders/${orderId}/send_to_production.json`,
            {},
            { headers: printifyHeaders }
        );
        
        console.log(`Order ${orderId} submitted to production`);
        return response.data;
    } catch (error) {
        console.error('Error submitting to production:', error.response?.data || error);
        // Don't throw error here - order is created, just not auto-submitted
        // You can handle this manually in Printify dashboard if needed
    }
}

// Webhook endpoint for Printify updates
app.post('/api/webhooks/printify', async (req, res) => {
    try {
        const { type, resource } = req.body;
        
        console.log('Printify webhook received:', type);
        
        switch (type) {
            case 'order:shipped':
                // Handle order shipped event
                console.log('Order shipped:', resource.id);
                // You can send shipping notification to customer here
                break;
                
            case 'order:created':
                // Handle order created confirmation
                console.log('Order created:', resource.id);
                break;
                
            case 'order:updated':
                // Handle order updates
                console.log('Order updated:', resource.id);
                break;
                
            default:
                console.log('Unhandled webhook type:', type);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Webhook endpoint for Stripe
app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            break;
            
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            // Handle failed payment (cancel Printify order if created)
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
});

// Get order status
app.get('/api/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const response = await axios.get(
            `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/orders/${orderId}.json`,
            { headers: printifyHeaders }
        );
        
        res.json({
            success: true,
            order: response.data
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order status'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            stripe: !!process.env.STRIPE_SECRET_KEY,
            printify: !!process.env.PRINTIFY_API_KEY
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment check:');
    console.log('- Stripe:', process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured');
    console.log('- Printify:', PRINTIFY_API_TOKEN ? 'Configured' : 'Not configured');
    console.log('- Demo Mode:', DEMO_MODE ? 'ENABLED' : 'Disabled');
    console.log('');
    console.log('API Endpoints:');
    console.log(`- http://localhost:${PORT}/api/health`);
    console.log(`- http://localhost:${PORT}/api/products`);
    console.log(`- http://localhost:${PORT}/api/create-order`);
    console.log('');
    if (!process.env.STRIPE_SECRET_KEY || !PRINTIFY_API_TOKEN) {
        console.log('⚠️  To enable real payments:');
        console.log('1. Copy .env.example to .env');
        console.log('2. Add your Stripe and Printify API keys');
        console.log('3. Restart the server');
    }
});