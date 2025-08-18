/**
 * Cloudflare Worker for Plant Economy
 * Stack: Clerk (auth) + D1 (database) + R2 (media) + Stripe (payments)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { verifyJWT } from './clerk-verify'; // You'll need to implement Clerk JWT verification
import Stripe from 'stripe';

type Env = {
  DB: D1Database;
  R2: R2Bucket;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  CLERK_JWKS_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use('*', cors({
  origin: ['https://eurorackgrid.com', 'https://*.pages.dev', 'http://localhost:8765'],
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Auth middleware (except for webhook)
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/stripe/webhook') {
    return next();
  }
  
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const token = auth.substring(7);
    const userId = await verifyJWT(token, c.env.CLERK_JWKS_URL);
    c.set('userId', userId);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// GET /api/shop/pack-defs - Get pack definitions and odds
app.get('/api/shop/pack-defs', async (c) => {
  const packs = await c.env.DB.prepare(
    'SELECT * FROM pack_defs'
  ).all();
  
  return c.json({
    packs: packs.results,
    timestamp: Date.now()
  });
});

// POST /api/packs/open - Open a pack (server-side rolls)
app.post('/api/packs/open', async (c) => {
  const userId = c.get('userId');
  const { packType, bannerId = 'default' } = await c.req.json();
  
  // Verify user has enough currency
  const currency = await c.env.DB.prepare(
    'SELECT peanuts FROM user_currency WHERE user_id = ?'
  ).bind(userId).first();
  
  const packDef = await c.env.DB.prepare(
    'SELECT * FROM pack_defs WHERE id = ?'
  ).bind(packType).first();
  
  if (!packDef || !currency || currency.peanuts < packDef.price) {
    return c.json({ error: 'Insufficient funds or invalid pack' }, 400);
  }
  
  // Get pity counters
  let pity = await c.env.DB.prepare(
    'SELECT * FROM pity WHERE user_id = ? AND banner_id = ?'
  ).bind(userId, bannerId).first();
  
  if (!pity) {
    pity = { rare_counter: 0, legendary_counter: 0 };
  }
  
  // Roll pack contents
  const odds = JSON.parse(packDef.odds_json);
  const guarantees = JSON.parse(packDef.guarantees_json);
  const results = [];
  
  // Roll base slots
  for (let i = 0; i < packDef.slots; i++) {
    results.push(rollRarity(odds));
  }
  
  // Apply guarantees
  for (const guarantee of guarantees) {
    for (let i = 0; i < guarantee.count; i++) {
      results.push(rollWithMinRarity(guarantee.min));
    }
  }
  
  // Check and apply pity
  const hasRare = results.some(r => r === 'rare' || r === 'legendary');
  const hasLegendary = results.some(r => r === 'legendary');
  
  let newRareCounter = hasRare ? 0 : pity.rare_counter + 1;
  let newLegendaryCounter = hasLegendary ? 0 : pity.legendary_counter + 1;
  
  // Force pity if needed
  if (newRareCounter >= 10 && !hasRare) {
    const commonIndex = results.findIndex(r => r === 'common');
    if (commonIndex !== -1) {
      results[commonIndex] = 'rare';
      newRareCounter = 0;
    }
  }
  
  if (newLegendaryCounter >= 40 && !hasLegendary) {
    const nonLegIndex = results.findIndex(r => r !== 'legendary');
    if (nonLegIndex !== -1) {
      results[nonLegIndex] = 'legendary';
      newLegendaryCounter = 0;
    }
  }
  
  // Get random plants of each rarity
  const plants = [];
  let totalShards = 0;
  
  for (const rarity of results) {
    const plant = await c.env.DB.prepare(
      'SELECT * FROM plants WHERE rarity = ? ORDER BY RANDOM() LIMIT 1'
    ).bind(rarity).first();
    
    // Check if duplicate
    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM user_plants WHERE user_id = ? AND plant_id = ?'
    ).bind(userId, plant.id).first();
    
    if (existing) {
      // Duplicate - convert to shards
      const shardValues = { common: 10, uncommon: 30, rare: 120, legendary: 400 };
      totalShards += shardValues[rarity];
      plants.push({ ...plant, duplicate: true });
    } else {
      plants.push({ ...plant, duplicate: false });
    }
  }
  
  // Start transaction
  const txId = crypto.randomUUID();
  
  try {
    // Deduct currency
    await c.env.DB.prepare(
      'UPDATE user_currency SET peanuts = peanuts - ? WHERE user_id = ?'
    ).bind(packDef.price, userId).run();
    
    // Add new plants
    for (const plant of plants) {
      if (!plant.duplicate) {
        await c.env.DB.prepare(
          'INSERT INTO user_plants (user_id, plant_id, source) VALUES (?, ?, ?)'
        ).bind(userId, plant.id, 'pack').run();
      }
    }
    
    // Add shards
    if (totalShards > 0) {
      await c.env.DB.prepare(
        'UPDATE user_currency SET shards = shards + ? WHERE user_id = ?'
      ).bind(totalShards, userId).run();
    }
    
    // Update pity
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO pity (user_id, banner_id, rare_counter, legendary_counter) VALUES (?, ?, ?, ?)'
    ).bind(userId, bannerId, newRareCounter, newLegendaryCounter).run();
    
    // Log transaction
    await c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, amount, meta_json) VALUES (?, ?, ?, ?, ?)'
    ).bind(txId, userId, 'open_pack', packDef.price, JSON.stringify({ packType, results: plants })).run();
    
    return c.json({
      success: true,
      plants,
      shards: totalShards,
      pity: {
        rare: newRareCounter,
        legendary: newLegendaryCounter
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to open pack' }, 500);
  }
});

// POST /api/plants/buy - Direct purchase
app.post('/api/plants/buy', async (c) => {
  const userId = c.get('userId');
  const { plantId } = await c.req.json();
  
  const plant = await c.env.DB.prepare(
    'SELECT * FROM plants WHERE id = ?'
  ).bind(plantId).first();
  
  if (!plant) {
    return c.json({ error: 'Plant not found' }, 404);
  }
  
  // Check if already owned
  const existing = await c.env.DB.prepare(
    'SELECT 1 FROM user_plants WHERE user_id = ? AND plant_id = ?'
  ).bind(userId, plantId).first();
  
  if (existing) {
    return c.json({ error: 'Already owned' }, 400);
  }
  
  // Direct prices
  const prices = { common: 80, uncommon: 220, rare: 650, legendary: 1500 };
  const price = prices[plant.rarity];
  
  // Check currency
  const currency = await c.env.DB.prepare(
    'SELECT peanuts FROM user_currency WHERE user_id = ?'
  ).bind(userId).first();
  
  if (!currency || currency.peanuts < price) {
    return c.json({ error: 'Insufficient funds' }, 400);
  }
  
  // Purchase
  const txId = crypto.randomUUID();
  
  try {
    await c.env.DB.prepare(
      'UPDATE user_currency SET peanuts = peanuts - ? WHERE user_id = ?'
    ).bind(price, userId).run();
    
    await c.env.DB.prepare(
      'INSERT INTO user_plants (user_id, plant_id, source) VALUES (?, ?, ?)'
    ).bind(userId, plantId, 'direct').run();
    
    await c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, amount, meta_json) VALUES (?, ?, ?, ?, ?)'
    ).bind(txId, userId, 'direct_buy', price, JSON.stringify({ plantId })).run();
    
    return c.json({ success: true, plant });
  } catch {
    return c.json({ error: 'Purchase failed' }, 500);
  }
});

// POST /api/login/daily-seed - Daily login reward
app.post('/api/login/daily-seed', async (c) => {
  const userId = c.get('userId');
  const today = new Date().toISOString().split('T')[0];
  
  // Check if already claimed today
  const existing = await c.env.DB.prepare(
    `SELECT 1 FROM transactions 
     WHERE user_id = ? AND type = 'daily' 
     AND DATE(created_at) = ?`
  ).bind(userId, today).first();
  
  if (existing) {
    return c.json({ error: 'Already claimed today' }, 400);
  }
  
  // Roll daily seed (80% common, 18% uncommon, 2% rare)
  const roll = Math.random();
  const rarity = roll < 0.8 ? 'common' : roll < 0.98 ? 'uncommon' : 'rare';
  
  const plant = await c.env.DB.prepare(
    'SELECT * FROM plants WHERE rarity = ? ORDER BY RANDOM() LIMIT 1'
  ).bind(rarity).first();
  
  // Check if duplicate
  const owned = await c.env.DB.prepare(
    'SELECT 1 FROM user_plants WHERE user_id = ? AND plant_id = ?'
  ).bind(userId, plant.id).first();
  
  const txId = crypto.randomUUID();
  
  if (owned) {
    // Give shards instead
    const shardValues = { common: 10, uncommon: 30, rare: 120 };
    const shards = shardValues[rarity];
    
    await c.env.DB.prepare(
      'UPDATE user_currency SET shards = shards + ? WHERE user_id = ?'
    ).bind(shards, userId).run();
    
    await c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, amount, meta_json) VALUES (?, ?, ?, ?, ?)'
    ).bind(txId, userId, 'daily', 0, JSON.stringify({ duplicate: true, shards })).run();
    
    return c.json({ success: true, duplicate: true, shards });
  } else {
    await c.env.DB.prepare(
      'INSERT INTO user_plants (user_id, plant_id, source) VALUES (?, ?, ?)'
    ).bind(userId, plant.id, 'seed').run();
    
    await c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, amount, meta_json) VALUES (?, ?, ?, ?, ?)'
    ).bind(txId, userId, 'daily', 0, JSON.stringify({ plantId: plant.id })).run();
    
    return c.json({ success: true, plant });
  }
});

// GET /api/ownership - Get user's plants and stats
app.get('/api/ownership', async (c) => {
  const userId = c.get('userId');
  
  const plants = await c.env.DB.prepare(
    `SELECT p.*, up.growth_stage, up.seed_ready_at 
     FROM user_plants up 
     JOIN plants p ON up.plant_id = p.id 
     WHERE up.user_id = ?`
  ).bind(userId).all();
  
  const currency = await c.env.DB.prepare(
    'SELECT * FROM user_currency WHERE user_id = ?'
  ).bind(userId).first();
  
  const pity = await c.env.DB.prepare(
    'SELECT * FROM pity WHERE user_id = ? AND banner_id = ?'
  ).bind(userId, 'default').first();
  
  return c.json({
    plants: plants.results,
    currency: currency || { peanuts: 0, shards: 0 },
    pity: pity || { rare_counter: 0, legendary_counter: 0 }
  });
});

// GET /api/media-url - Get R2 URL for owned plants
app.get('/api/media-url', async (c) => {
  const userId = c.get('userId');
  const plantId = c.req.query('plant_id');
  
  if (!plantId) {
    return c.json({ error: 'Missing plant_id' }, 400);
  }
  
  // Check ownership or shop visibility
  const plant = await c.env.DB.prepare(
    'SELECT p.* FROM plants p WHERE p.id = ?'
  ).bind(plantId).first();
  
  if (!plant) {
    return c.json({ error: 'Plant not found' }, 404);
  }
  
  const owned = await c.env.DB.prepare(
    'SELECT 1 FROM user_plants WHERE user_id = ? AND plant_id = ?'
  ).bind(userId, plantId).first();
  
  // Always show in shop, but watermark if not owned
  const key = owned ? plant.r2_key : `watermarked/${plant.r2_key}`;
  
  // Option 1: Return signed URL (expires in 1 hour)
  // const url = await c.env.R2.createSignedUrl(key, { expiresIn: 3600 });
  
  // Option 2: Stream through worker with caching
  const object = await c.env.R2.get(key);
  if (!object) {
    return c.json({ error: 'Media not found' }, 404);
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Owned': owned ? 'true' : 'false'
    }
  });
});

// POST /api/stripe/webhook - Handle Stripe webhooks
app.post('/api/stripe/webhook', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  const sig = c.req.header('stripe-signature');
  
  if (!sig) {
    return c.json({ error: 'No signature' }, 400);
  }
  
  const body = await c.req.text();
  
  try {
    const event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const amount = session.metadata?.peanuts;
      
      if (userId && amount) {
        // Idempotent insert
        await c.env.DB.prepare(
          'INSERT OR IGNORE INTO transactions (id, user_id, type, amount, meta_json) VALUES (?, ?, ?, ?, ?)'
        ).bind(session.id, userId, 'purchase_currency', parseInt(amount), JSON.stringify(session)).run();
        
        // Credit currency
        await c.env.DB.prepare(
          'INSERT INTO user_currency (user_id, peanuts, shards) VALUES (?, ?, 0) ON CONFLICT(user_id) DO UPDATE SET peanuts = peanuts + ?'
        ).bind(userId, parseInt(amount), parseInt(amount)).run();
      }
    }
    
    return c.json({ received: true });
  } catch (err) {
    return c.json({ error: 'Invalid signature' }, 400);
  }
});

// Helper functions
function rollRarity(odds: Record<string, number>): string {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [rarity, chance] of Object.entries(odds)) {
    cumulative += chance;
    if (roll < cumulative) {
      return rarity;
    }
  }
  
  return 'common';
}

function rollWithMinRarity(minRarity: string): string {
  const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];
  const minIndex = rarityOrder.indexOf(minRarity);
  const available = rarityOrder.slice(minIndex);
  
  // Weight distribution for guaranteed rolls
  const weights = [0.5, 0.3, 0.15, 0.05].slice(-available.length);
  const roll = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (roll < cumulative) {
      return available[i];
    }
  }
  
  return minRarity;
}

export default app;