// Backend API for EURORACK.GRID
// Using Node.js + Express + Supabase + Stripe (NO PayPal!)

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ============= AUTH ENDPOINTS =============

// Sign up
app.post('/api/auth/signup', async (req, res) => {
    const { email, username, password } = req.body;
    
    try {
        // Create auth user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (authError) throw authError;
        
        // Create user profile in our database
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                username,
                jamnutz_balance: 100 // Welcome bonus!
            })
            .select()
            .single();
        
        if (userError) throw userError;
        
        // Give them a welcome jamnutz bonus
        await supabase.from('jamnutz_transactions').insert({
            user_id: authData.user.id,
            amount: 100,
            balance_after: 100,
            transaction_type: 'welcome_bonus',
            description: 'Welcome to EURORACK.GRID!'
        });
        
        res.json({ 
            success: true, 
            user: userData,
            message: 'Welcome! You got 100 free jamnutz! 🥜'
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Get user data including inventory
        const { data: userData } = await supabase
            .from('users')
            .select('*, user_modules(module_id)')
            .eq('id', data.user.id)
            .single();
        
        res.json({ 
            success: true, 
            session: data.session,
            user: userData 
        });
        
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// ============= MODULE ENDPOINTS =============

// Get all modules
app.get('/api/modules', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('modules')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check module ownership
app.get('/api/modules/owned/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('user_modules')
            .select('module_id, modules(name, webp_url)')
            .eq('user_id', userId);
        
        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Purchase module with jamnutz
app.post('/api/modules/purchase-jamnutz', async (req, res) => {
    const { userId, moduleId } = req.body;
    
    try {
        // Call our stored procedure
        const { data, error } = await supabase
            .rpc('purchase_module_with_jamnutz', {
                p_user_id: userId,
                p_module_id: moduleId
            });
        
        if (error) throw error;
        
        if (data === false) {
            return res.status(400).json({ 
                error: 'Not enough jamnutz! 🥜' 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Module purchased! 🎉' 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= JAMNUTZ ENDPOINTS =============

// Get user balance
app.get('/api/jamnutz/balance/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('jamnutz_balance')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        
        res.json({ balance: data.jamnutz_balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Purchase jamnutz bundle with Stripe
app.post('/api/jamnutz/purchase', async (req, res) => {
    const { userId, bundleType } = req.body;
    
    const bundles = {
        'pack_500': { jamnutz: 500, price: 499 }, // $4.99
        'pack_1100': { jamnutz: 1100, price: 999 }, // $9.99
        'pack_2500': { jamnutz: 2500, price: 1999 }, // $19.99
        'pack_5500': { jamnutz: 5500, price: 3999 }, // $39.99
        'pack_12000': { jamnutz: 12000, price: 7999 } // $79.99
    };
    
    const bundle = bundles[bundleType];
    if (!bundle) {
        return res.status(400).json({ error: 'Invalid bundle type' });
    }
    
    try {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: bundle.price,
            currency: 'usd',
            metadata: {
                userId,
                bundleType,
                jamnutz: bundle.jamnutz
            }
        });
        
        // Record pending purchase
        await supabase.from('purchases').insert({
            user_id: userId,
            stripe_payment_id: paymentIntent.id,
            amount_usd: bundle.price / 100,
            jamnutz_purchased: bundle.jamnutz,
            bundle_type: bundleType,
            status: 'pending'
        });
        
        res.json({ 
            clientSecret: paymentIntent.client_secret,
            jamnutz: bundle.jamnutz
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe webhook to confirm payment
app.post('/api/stripe/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const { userId, jamnutz } = paymentIntent.metadata;
        
        // Update user balance
        const { data: user } = await supabase
            .from('users')
            .select('jamnutz_balance')
            .eq('id', userId)
            .single();
        
        const newBalance = user.jamnutz_balance + parseInt(jamnutz);
        
        await supabase
            .from('users')
            .update({ jamnutz_balance: newBalance })
            .eq('id', userId);
        
        // Record transaction
        await supabase.from('jamnutz_transactions').insert({
            user_id: userId,
            amount: parseInt(jamnutz),
            balance_after: newBalance,
            transaction_type: 'bought_bundle',
            description: `Purchased ${jamnutz} jamnutz`
        });
        
        // Update purchase status
        await supabase
            .from('purchases')
            .update({ status: 'completed' })
            .eq('stripe_payment_id', paymentIntent.id);
    }
    
    res.json({ received: true });
});

// ============= SUBSCRIPTION ENDPOINTS =============

// Create subscription
app.post('/api/subscription/create', async (req, res) => {
    const { userId, tier } = req.body; // 'monthly' or 'yearly'
    
    const prices = {
        'monthly': process.env.STRIPE_MONTHLY_PRICE_ID,
        'yearly': process.env.STRIPE_YEARLY_PRICE_ID
    };
    
    try {
        // Get user email
        const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();
        
        // Create or get Stripe customer
        const customer = await stripe.customers.create({
            email: userData.email,
            metadata: { userId }
        });
        
        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: prices[tier] }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });
        
        res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============= RACK ENDPOINTS =============

// Save rack
app.post('/api/racks/save', async (req, res) => {
    const { userId, name, rackData, isPublic } = req.body;
    
    try {
        // Generate unique share URL if public
        const shareUrl = isPublic ? 
            `rack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : 
            null;
        
        const { data, error } = await supabase
            .from('user_racks')
            .insert({
                user_id: userId,
                name,
                rack_data: rackData,
                is_public: isPublic,
                share_url: shareUrl
            })
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ 
            success: true, 
            rack: data,
            shareUrl: shareUrl ? `https://eurorack.grid/rack/${shareUrl}` : null
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's racks
app.get('/api/racks/user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('user_racks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get public rack by share URL
app.get('/api/racks/public/:shareUrl', async (req, res) => {
    const { shareUrl } = req.params;
    
    try {
        const { data, error } = await supabase
            .from('user_racks')
            .select('*, users(username)')
            .eq('share_url', shareUrl)
            .eq('is_public', true)
            .single();
        
        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Rack not found' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🎛️ EURORACK.GRID API running on port ${PORT}`);
});