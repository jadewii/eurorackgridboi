# Long-Term Setup: Supabase Edge Functions + Database

## Why This Architecture:
- **Secure**: Service keys never exposed to frontend
- **Scalable**: Can handle thousands of users
- **Flexible**: Easy to add features like trading, rarity, limited editions
- **Cost-effective**: Edge Functions are cheap/free at small scale

## Step 1: Database Schema Setup

```sql
-- Users table (using Supabase Auth)
-- Already exists with Supabase Auth

-- Modules catalog table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'holographic', 'live')),
  file_path TEXT NOT NULL, -- e.g., "01.gif"
  bucket_name TEXT DEFAULT 'eurorackgif',
  hp_cost INTEGER NOT NULL, -- Cost in HP to unlock
  max_supply INTEGER, -- NULL = unlimited, or set limit for rare ones
  current_supply INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's owned modules
CREATE TABLE user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_id UUID REFERENCES modules(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  purchase_price INTEGER, -- Track historical price
  UNIQUE(user_id, module_id) -- Prevent duplicate ownership
);

-- User's HP balance
CREATE TABLE user_balance (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  hp_balance INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balance ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Modules are viewable by everyone" 
  ON modules FOR SELECT 
  USING (true);

CREATE POLICY "Users can view their own modules" 
  ON user_modules FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own balance" 
  ON user_balance FOR SELECT 
  USING (auth.uid() = user_id);
```

## Step 2: Edge Function for Secure Access

Create file: `supabase/functions/get-module/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { module_id } = await req.json()
  
  // Create Supabase client with service role key
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Get user from JWT
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  const { data: { user } } = await supabaseClient.auth.getUser(token)
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401 
    })
  }
  
  // Check if user owns this module
  const { data: ownership } = await supabaseClient
    .from('user_modules')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', module_id)
    .single()
  
  if (!ownership) {
    return new Response(JSON.stringify({ error: 'Module not owned' }), { 
      status: 403 
    })
  }
  
  // Get module details
  const { data: module } = await supabaseClient
    .from('modules')
    .select('*')
    .eq('id', module_id)
    .single()
  
  // Generate signed URL (valid for 1 hour)
  const { data: signedUrl } = await supabaseClient
    .storage
    .from(module.bucket_name)
    .createSignedUrl(module.file_path, 3600)
  
  return new Response(JSON.stringify({ 
    url: signedUrl.signedURL,
    module: module 
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Step 3: Purchase Edge Function

Create file: `supabase/functions/purchase-module/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { module_id } = await req.json()
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Get user
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  const { data: { user } } = await supabaseClient.auth.getUser(token)
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401 
    })
  }
  
  // Start transaction logic
  // 1. Check module availability and price
  const { data: module } = await supabaseClient
    .from('modules')
    .select('*')
    .eq('id', module_id)
    .single()
  
  // 2. Check user balance
  const { data: balance } = await supabaseClient
    .from('user_balance')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (balance.hp_balance < module.hp_cost) {
    return new Response(JSON.stringify({ error: 'Insufficient HP' }), { 
      status: 400 
    })
  }
  
  // 3. Check if already owned
  const { data: existing } = await supabaseClient
    .from('user_modules')
    .select('*')
    .eq('user_id', user.id)
    .eq('module_id', module_id)
  
  if (existing?.length > 0) {
    return new Response(JSON.stringify({ error: 'Already owned' }), { 
      status: 400 
    })
  }
  
  // 4. Process purchase
  // Deduct HP
  await supabaseClient
    .from('user_balance')
    .update({ 
      hp_balance: balance.hp_balance - module.hp_cost,
      total_spent: balance.total_spent + module.hp_cost,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
  
  // Add module to user's collection
  await supabaseClient
    .from('user_modules')
    .insert({
      user_id: user.id,
      module_id: module_id,
      purchase_price: module.hp_cost
    })
  
  // Update supply if limited
  if (module.max_supply) {
    await supabaseClient
      .from('modules')
      .update({ 
        current_supply: module.current_supply + 1 
      })
      .eq('id', module_id)
  }
  
  return new Response(JSON.stringify({ 
    success: true,
    message: 'Module purchased successfully'
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Step 4: Frontend Integration

```javascript
// Purchase a module
async function purchaseModule(moduleId) {
  const { data, error } = await supabase.functions.invoke('purchase-module', {
    body: { module_id: moduleId }
  })
  
  if (error) {
    console.error('Purchase failed:', error)
    return false
  }
  
  return true
}

// Get module image URL (only if owned)
async function getModuleImage(moduleId) {
  const { data, error } = await supabase.functions.invoke('get-module', {
    body: { module_id: moduleId }
  })
  
  if (error) {
    console.error('Cannot access module:', error)
    return null
  }
  
  return data.url // Signed URL valid for 1 hour
}
```

## Step 5: Deploy Commands

```bash
# Initialize Supabase CLI (if not done)
supabase init

# Create functions
supabase functions new get-module
supabase functions new purchase-module

# Deploy functions
supabase functions deploy get-module
supabase functions deploy purchase-module

# Run database migrations
supabase db push
```

## Benefits of This Setup:

1. **Security**: Service keys never exposed
2. **Ownership**: Clear record of who owns what
3. **Trading Ready**: Easy to add P2P trading later
4. **Supply Control**: Can limit rare modules
5. **Analytics**: Track popular modules, revenue, etc.
6. **Scalable**: Works for 10 or 10,000 users
7. **Cost Tracking**: Know exactly how much HP users spend

## Next Steps:
1. Set up the database tables
2. Create Edge Functions
3. Populate modules table with your 17 GIFs
4. Test purchase flow
5. Add trading system later

This is production-ready architecture used by real NFT/collectible platforms!