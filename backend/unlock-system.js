// Digital Unlock System for Physical Purchases
// This handles the connection between physical purchases and digital unlocks

const express = require('express');
const router = express.Router();

// In production, this would be a database
// For now, using in-memory storage
const purchaseDatabase = {
    orders: {},
    userCollections: {}
};

/**
 * When a physical purchase is completed through Printify/Stripe
 * This webhook gets called to unlock digital versions
 */
router.post('/api/webhook/order-completed', async (req, res) => {
    const { orderId, customerEmail, items, printifyOrderId } = req.body;
    
    console.log('Order completed:', orderId);
    
    // Extract sticker items from the order
    const stickersPurchased = items.filter(item => {
        // Match by product title since that's consistent
        return item.title && item.title.includes('eurorack sticker');
    });
    
    // Create unlock tokens for each sticker
    const unlockTokens = stickersPurchased.map(sticker => {
        // Extract the mod number from title (e.g., "Mod-01 - eurorack sticker")
        const modMatch = sticker.title.match(/Mod-(\d+)/i);
        const stickerCode = modMatch ? `mod-${modMatch[1].padStart(2, '0')}` : sticker.id;
        
        return {
            stickerCode,
            title: sticker.title,
            unlockedAt: new Date().toISOString(),
            orderId: orderId,
            method: 'physical_purchase'
        };
    });
    
    // Store the unlock data
    purchaseDatabase.orders[orderId] = {
        email: customerEmail,
        unlocks: unlockTokens,
        processedAt: new Date().toISOString()
    };
    
    // Send unlock email to customer
    if (customerEmail) {
        await sendUnlockEmail(customerEmail, unlockTokens, orderId);
    }
    
    res.json({ success: true, unlocked: unlockTokens.length });
});

/**
 * Customer claims their digital unlocks using order ID or email
 */
router.post('/api/claim-digital-unlocks', async (req, res) => {
    const { claimCode, email } = req.body;
    
    // Find order by ID or email
    let foundOrder = null;
    
    if (claimCode) {
        foundOrder = purchaseDatabase.orders[claimCode];
    } else if (email) {
        // Find all orders for this email
        const userOrders = Object.entries(purchaseDatabase.orders)
            .filter(([id, order]) => order.email === email)
            .map(([id, order]) => ({ orderId: id, ...order }));
        
        if (userOrders.length > 0) {
            // Return all unlocks for this email
            const allUnlocks = userOrders.flatMap(order => order.unlocks);
            
            return res.json({
                success: true,
                unlocks: allUnlocks,
                message: `Found ${allUnlocks.length} digital stickers from ${userOrders.length} orders`
            });
        }
    }
    
    if (!foundOrder) {
        return res.status(404).json({
            success: false,
            message: 'No order found with that claim code or email'
        });
    }
    
    res.json({
        success: true,
        unlocks: foundOrder.unlocks,
        message: `Unlocked ${foundOrder.unlocks.length} digital stickers!`
    });
});

/**
 * Check if a user owns a specific sticker
 */
router.get('/api/check-ownership/:stickerCode/:userId', async (req, res) => {
    const { stickerCode, userId } = req.params;
    
    // Check if user has this sticker unlocked
    const userCollection = purchaseDatabase.userCollections[userId] || [];
    const owns = userCollection.some(unlock => unlock.stickerCode === stickerCode);
    
    res.json({ owns, stickerCode });
});

/**
 * Send unlock email with claim link
 */
async function sendUnlockEmail(email, unlocks, orderId) {
    // In production, use a service like SendGrid or AWS SES
    console.log(`
        📧 Sending unlock email to: ${email}
        Order ID: ${orderId}
        Unlocked Stickers: ${unlocks.map(u => u.title).join(', ')}
        
        Claim Link: https://eurorack.store/claim?code=${orderId}
    `);
    
    // Email template would include:
    // - Congratulations message
    // - List of unlocked digital stickers
    // - Claim button/link
    // - Instructions for accessing collection
}

/**
 * Manual unlock system for admin
 * Useful for customer service, giveaways, etc.
 */
router.post('/api/admin/manual-unlock', async (req, res) => {
    const { email, stickerCodes, reason } = req.body;
    
    // Verify admin token (implement proper auth in production)
    const adminToken = req.headers['x-admin-token'];
    if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const unlockTokens = stickerCodes.map(code => ({
        stickerCode: code,
        unlockedAt: new Date().toISOString(),
        method: 'manual_admin',
        reason: reason
    }));
    
    const manualOrderId = `MANUAL-${Date.now()}`;
    purchaseDatabase.orders[manualOrderId] = {
        email: email,
        unlocks: unlockTokens,
        processedAt: new Date().toISOString(),
        manual: true
    };
    
    res.json({ 
        success: true, 
        orderId: manualOrderId,
        unlocked: unlockTokens.length 
    });
});

module.exports = router;