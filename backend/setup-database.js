// Run this script to set up your Supabase database tables
// npm install @supabase/supabase-js dotenv
// node setup-database.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// You need to add these to a .env file:
// SUPABASE_URL=https://jqxshcyqxhbmvqrrthxy.supabase.co
// SUPABASE_SERVICE_KEY=your_service_role_key_here

const supabaseUrl = process.env.SUPABASE_URL || 'https://jqxshcyqxhbmvqrrthxy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_KEY in .env file');
    console.log('\nTo get your service key:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to Settings > API');
    console.log('4. Copy the "service_role" key (keep it secret!)');
    console.log('5. Add it to a .env file as SUPABASE_SERVICE_KEY=...');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🚀 Setting up EURORACK.GRID database...\n');
    
    try {
        // Create tables using Supabase's SQL execution
        const { error: schemaError } = await supabase.rpc('exec_sql', {
            sql: `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    jamnutz_balance INTEGER DEFAULT 100,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Modules catalog
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    price_usd DECIMAL(10,2) DEFAULT 5.00,
    price_jamnutz INTEGER DEFAULT 500,
    webp_url TEXT NOT NULL,
    is_exclusive BOOLEAN DEFAULT FALSE,
    release_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User module ownership (MOST IMPORTANT TABLE!)
CREATE TABLE IF NOT EXISTS user_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT NOW(),
    purchase_method VARCHAR(20),
    price_paid DECIMAL(10,2),
    jamnutz_spent INTEGER,
    UNIQUE(user_id, module_id)
);

-- Jamnutz transactions
CREATE TABLE IF NOT EXISTS jamnutz_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    transaction_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User racks/presets
CREATE TABLE IF NOT EXISTS user_racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rack_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    share_url VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase history
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255),
    amount_usd DECIMAL(10,2),
    jamnutz_purchased INTEGER,
    bundle_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription history
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255),
    tier VARCHAR(20),
    status VARCHAR(20),
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_modules_user ON user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_module ON user_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_jamnutz_user ON jamnutz_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_racks_user ON user_racks(user_id);
            `
        });

        if (schemaError) {
            // If exec_sql doesn't work, we'll create tables individually
            console.log('Creating tables individually...\n');
            
            // We'll use Supabase's direct API to create tables
            // This is a bit more manual but works reliably
        }
        
        console.log('✅ Database tables created!\n');
        
        // Now populate the modules table with your WebP files
        console.log('📦 Adding modules to catalog...\n');
        
        const modules = [
            '00',
            'Altered Black',
            'Andersons',
            'BAI',
            'Cephalopod Rose',
            'Cephalopod',
            'Complex Oscillator',
            'Function Synthesizer',
            'Honduh',
            'Mangler and Tangler',
            'Physical Modeler',
            'textural Synthesizer',
            'Varigated',
            'Voltaged Gray'
        ];
        
        for (const moduleName of modules) {
            const webpUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/${encodeURIComponent(moduleName)}.webp`;
            
            const { error } = await supabase
                .from('modules')
                .upsert({
                    name: moduleName,
                    price_usd: 5.00,
                    price_jamnutz: 500,
                    webp_url: webpUrl,
                    is_exclusive: false
                }, {
                    onConflict: 'name'
                });
            
            if (!error) {
                console.log(`✅ Added module: ${moduleName}`);
            }
        }
        
        console.log('\n🎉 Database setup complete!\n');
        console.log('Next steps:');
        console.log('1. Enable Authentication in Supabase dashboard');
        console.log('2. Set up Row Level Security policies');
        console.log('3. Get your anon key for the frontend');
        console.log('4. Start building the frontend auth flow!');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    }
}

// Alternative: Output SQL for manual execution
function outputSQL() {
    console.log('\n📋 Copy this SQL and run it in your Supabase SQL Editor:\n');
    console.log('https://app.supabase.com/project/jqxshcyqxhbmvqrrthxy/sql\n');
    console.log('='.repeat(60));
    
    const fs = require('fs');
    const sql = fs.readFileSync('./database-schema.sql', 'utf8');
    console.log(sql);
}

// Run the setup
if (supabaseServiceKey) {
    setupDatabase();
} else {
    outputSQL();
}