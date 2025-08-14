-- EURORACK.GRID Database Schema
-- Using PostgreSQL (works great with Supabase!)

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    jamnutz_balance INTEGER DEFAULT 0,
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'monthly', 'yearly'
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Modules catalog
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    price_usd DECIMAL(10,2) DEFAULT 5.00,
    price_jamnutz INTEGER DEFAULT 500,
    webp_url TEXT NOT NULL,
    is_exclusive BOOLEAN DEFAULT FALSE, -- subscriber-only modules
    release_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User module ownership
CREATE TABLE user_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT NOW(),
    purchase_method VARCHAR(20), -- 'cash', 'jamnutz', 'subscription_bonus'
    price_paid DECIMAL(10,2),
    jamnutz_spent INTEGER,
    UNIQUE(user_id, module_id) -- prevent duplicate ownership
);

-- Jamnutz transactions
CREATE TABLE jamnutz_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for credit, negative for debit
    balance_after INTEGER NOT NULL,
    transaction_type VARCHAR(50), -- 'purchase', 'subscription_bonus', 'bought_bundle', 'spent_on_module'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User racks/presets
CREATE TABLE user_racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rack_data JSONB NOT NULL, -- stores module positions, case size, etc
    is_public BOOLEAN DEFAULT FALSE,
    share_url VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase history
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255),
    amount_usd DECIMAL(10,2),
    jamnutz_purchased INTEGER,
    bundle_type VARCHAR(50), -- '500_pack', '1100_pack', etc
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription history
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255),
    tier VARCHAR(20), -- 'monthly', 'yearly'
    status VARCHAR(20), -- 'active', 'cancelled', 'expired'
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_modules_user ON user_modules(user_id);
CREATE INDEX idx_user_modules_module ON user_modules(module_id);
CREATE INDEX idx_jamnutz_user ON jamnutz_transactions(user_id);
CREATE INDEX idx_racks_user ON user_racks(user_id);
CREATE INDEX idx_racks_public ON user_racks(is_public);

-- Views for common queries
CREATE VIEW user_inventory AS
SELECT 
    u.id as user_id,
    u.username,
    u.jamnutz_balance,
    u.subscription_tier,
    COUNT(um.module_id) as modules_owned,
    COALESCE(SUM(m.price_usd), 0) as collection_value
FROM users u
LEFT JOIN user_modules um ON u.id = um.user_id
LEFT JOIN modules m ON um.module_id = m.id
GROUP BY u.id, u.username, u.jamnutz_balance, u.subscription_tier;

-- Function to check if user owns module
CREATE OR REPLACE FUNCTION user_owns_module(
    p_user_id UUID,
    p_module_name VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_modules um
        JOIN modules m ON um.module_id = m.id
        WHERE um.user_id = p_user_id
        AND m.name = p_module_name
    );
END;
$$ LANGUAGE plpgsql;

-- Function to purchase module with jamnutz
CREATE OR REPLACE FUNCTION purchase_module_with_jamnutz(
    p_user_id UUID,
    p_module_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_price_jamnutz INTEGER;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get module price
    SELECT price_jamnutz INTO v_price_jamnutz
    FROM modules WHERE id = p_module_id;
    
    -- Get user balance
    SELECT jamnutz_balance INTO v_current_balance
    FROM users WHERE id = p_user_id;
    
    -- Check if user has enough jamnutz
    IF v_current_balance < v_price_jamnutz THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance - v_price_jamnutz;
    
    -- Start transaction
    -- Update user balance
    UPDATE users 
    SET jamnutz_balance = v_new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Record module ownership
    INSERT INTO user_modules (user_id, module_id, purchase_method, jamnutz_spent)
    VALUES (p_user_id, p_module_id, 'jamnutz', v_price_jamnutz);
    
    -- Record transaction
    INSERT INTO jamnutz_transactions (
        user_id, 
        amount, 
        balance_after, 
        transaction_type, 
        description
    )
    VALUES (
        p_user_id,
        -v_price_jamnutz,
        v_new_balance,
        'spent_on_module',
        'Purchased module'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to give monthly jamnutz to subscribers
CREATE OR REPLACE FUNCTION grant_subscription_jamnutz() RETURNS void AS $$
BEGIN
    -- Monthly subscribers get 1500 jamnutz
    UPDATE users 
    SET jamnutz_balance = jamnutz_balance + 1500
    WHERE subscription_tier = 'monthly' 
    AND subscription_expires_at > NOW();
    
    -- Record transactions
    INSERT INTO jamnutz_transactions (user_id, amount, balance_after, transaction_type, description)
    SELECT 
        id,
        1500,
        jamnutz_balance,
        'subscription_bonus',
        'Monthly subscription bonus'
    FROM users
    WHERE subscription_tier = 'monthly' 
    AND subscription_expires_at > NOW();
END;
$$ LANGUAGE plpgsql;