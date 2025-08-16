-- ADD NEW TABLES FOR EURORACK.GRID (won't affect existing tables)

-- 1. Users table (for your module customers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    jamnutz_balance INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Modules catalog
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    price_usd DECIMAL DEFAULT 5.00,
    price_jamnutz INTEGER DEFAULT 500,
    webp_url TEXT
);

-- 3. Who owns what modules
CREATE TABLE IF NOT EXISTS user_modules (
    user_id UUID REFERENCES users(id),
    module_id UUID REFERENCES modules(id),
    purchased_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, module_id)
);

-- 4. Add your 14 modules
INSERT INTO modules (name, webp_url) VALUES
('00', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/00.webp'),
('Altered Black', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Altered%20Black.webp'),
('Andersons', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Andersons.webp'),
('BAI', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/BAI.webp'),
('Cephalopod Rose', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Cephalopod%20Rose.webp'),
('Cephalopod', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Cephalopod.webp'),
('Complex Oscillator', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Complex%20Oscillator.webp'),
('Function Synthesizer', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Function%20Synthesizer.webp'),
('Honduh', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Honduh.webp'),
('Mangler and Tangler', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Mangler%20and%20Tangler.webp'),
('Physical Modeler', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Physical%20Modeler.webp'),
('textural Synthesizer', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/textural%20Synthesizer.webp'),
('Varigated', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Varigated.webp'),
('Voltaged Gray', 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/Voltaged%20Gray.webp')
ON CONFLICT (name) DO NOTHING;

-- 5. Create a test user
INSERT INTO users (email, username, jamnutz_balance) 
VALUES ('test@example.com', 'testuser', 1000)
ON CONFLICT (email) DO NOTHING;