// Simple Netlify Function to restore purchases from Stripe
// This solves the "I cleared my cache" problem without a database!

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { email, session_id } = JSON.parse(event.body || '{}');
    
    let customerEmail = email;
    
    // If we have a session_id from Stripe Checkout success
    if (session_id) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      customerEmail = session.customer_email || session.customer_details?.email;
    }
    
    if (!customerEmail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    // Find all payments from this email
    const payments = await stripe.paymentIntents.list({
      limit: 100,
      expand: ['data.charges.data.metadata']
    });

    // Extract purchased module IDs from successful payments
    const ownedModules = new Set();
    const purchases = [];
    
    for (const payment of payments.data) {
      if (payment.status === 'succeeded' && 
          payment.receipt_email === customerEmail) {
        
        // Get module IDs from metadata or line items
        const metadata = payment.metadata || {};
        
        if (metadata.modules) {
          // Modules stored as comma-separated list
          metadata.modules.split(',').forEach(m => ownedModules.add(m));
        }
        
        purchases.push({
          date: new Date(payment.created * 1000).toISOString(),
          amount: payment.amount,
          modules: metadata.modules || '',
          type: metadata.purchase_type || 'modules'
        });
      }
    }
    
    // Also check for Checkout Sessions (for product-based purchases)
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.line_items']
    });
    
    for (const session of sessions.data) {
      if (session.customer_email === customerEmail && 
          session.payment_status === 'paid') {
        
        // Get product IDs from line items
        if (session.line_items) {
          for (const item of session.line_items.data) {
            const productId = item.price?.product;
            if (productId) {
              // Map Stripe product IDs to module IDs
              const moduleId = mapProductToModule(productId);
              if (moduleId) {
                ownedModules.add(moduleId);
              }
            }
          }
        }
      }
    }

    // Calculate jamnutz balance (optional)
    const jamnutzPurchases = purchases
      .filter(p => p.type === 'jamnutz')
      .reduce((sum, p) => sum + (p.amount * 10), 0); // $1 = 100 jamnutz
    
    const modulesPurchased = purchases
      .filter(p => p.type === 'modules')
      .reduce((sum, p) => sum + (p.modules.split(',').length * 500), 0);
    
    const currentJamnutz = Math.max(0, 1000 + jamnutzPurchases - modulesPurchased);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        email: customerEmail,
        ownedModules: Array.from(ownedModules),
        jamnutz: currentJamnutz,
        purchases: purchases,
        restored: ownedModules.size
      })
    };

  } catch (error) {
    console.error('Restore error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to restore purchases',
        message: error.message 
      })
    };
  }
};

// Map Stripe product IDs to module IDs
function mapProductToModule(productId) {
  const mapping = {
    'prod_ABC123': 'function-synthesizer',
    'prod_DEF456': 'honduh',
    'prod_GHI789': 'andersons',
    // Add your actual product mappings here
    'prod_STARTER': 'starter-pack', // Returns multiple modules
  };
  
  return mapping[productId] || null;
}