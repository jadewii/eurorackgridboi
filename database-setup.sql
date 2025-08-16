-- Eurogrid Database Schema
-- Run this in Supabase SQL Editor

-- Modules catalog table
CREATE TABLE IF NOT EXISTS modules (
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
CREATE TABLE IF NOT EXISTS user_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_id UUID REFERENCES modules(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  purchase_price INTEGER, -- Track historical price
  UNIQUE(user_id, module_id) -- Prevent duplicate ownership
);

-- User's HP balance
CREATE TABLE IF NOT EXISTS user_balance (
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

-- Policies for modules table (everyone can see available modules)
CREATE POLICY "Modules are viewable by everyone" 
  ON modules FOR SELECT 
  USING (true);

-- Policies for user_modules (users can only see their own)
CREATE POLICY "Users can view their own modules" 
  ON user_modules FOR SELECT 
  USING (auth.uid() = user_id);

-- Policies for user_balance (users can only see their own balance)
CREATE POLICY "Users can view their own balance" 
  ON user_balance FOR SELECT 
  USING (auth.uid() = user_id);

-- Insert the 17 LIVE modules (animated GIFs)
INSERT INTO modules (name, description, rarity, file_path, hp_cost) VALUES
  ('Module 01', 'Animated oscilloscope module', 'live', '01.gif', 50),
  ('Module 02', 'Animated VCA module', 'live', '02.gif', 50),
  ('Module 03', 'Animated filter module', 'live', '03.gif', 50),
  ('Module 04', 'Animated sequencer module', 'live', '04.gif', 50),
  ('Module 05', 'Animated LFO module', 'live', '05.gif', 50),
  ('Module 06', 'Animated envelope module', 'live', '06.gif', 50),
  ('Module 07', 'Animated clock module', 'live', '07.gif', 50),
  ('Module 08', 'Animated mixer module', 'live', '08.gif', 50),
  ('Module 09', 'Animated effects module', 'live', '09.gif', 50),
  ('Module 10', 'Animated sampler module', 'live', '10.gif', 50),
  ('Module 11', 'Animated quantizer module', 'live', '11.gif', 50),
  ('Module 12', 'Animated waveshaper module', 'live', '12.gif', 50),
  ('Module 13', 'Animated delay module', 'live', '13.gif', 50),
  ('Module 14', 'Animated reverb module', 'live', '14.gif', 50),
  ('Module 15', 'Animated distortion module', 'live', '15.gif', 50),
  ('Module 16', 'Animated compressor module', 'live', '16.gif', 50),
  ('Module 17', 'Animated master module', 'live', '17.gif', 50);