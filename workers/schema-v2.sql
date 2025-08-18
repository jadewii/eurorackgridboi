-- JAMNUTZ Database Schema V2 - Pack System with Discovery
-- Currency: NUTZ ($10 = 500 NUTZ)

-- Plants table with discovery tracking
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT CHECK(rarity IN ('common', 'uncommon', 'rare', 'legendary')),
  preview_key TEXT NOT NULL,
  orig_key TEXT NOT NULL,
  discovered_global INTEGER NOT NULL DEFAULT 0, -- 0=mystery, 1=discovered globally
  first_discoverer TEXT, -- user_id of first person to discover
  discovered_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User accounts with NUTZ and shards
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  nutz INTEGER NOT NULL DEFAULT 0,
  shards INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User plant ownership
CREATE TABLE IF NOT EXISTS user_plants (
  user_id TEXT NOT NULL,
  plant_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1, -- for duplicates
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, plant_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Track which plants user has "seen" (for silhouette display)
CREATE TABLE IF NOT EXISTS user_seen_plants (
  user_id TEXT NOT NULL,
  plant_id TEXT NOT NULL,
  seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, plant_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Pack definitions
CREATE TABLE IF NOT EXISTS pack_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_nutz INTEGER NOT NULL,
  card_count INTEGER NOT NULL DEFAULT 3,
  guarantees TEXT -- JSON for guaranteed rarities
);

-- User pack purchase history (for pity tracking)
CREATE TABLE IF NOT EXISTS user_pack_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  pack_type TEXT NOT NULL,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  pulls TEXT NOT NULL, -- JSON array of plant IDs pulled
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pack_type) REFERENCES pack_types(id)
);

-- Pity counter per user per pack type
CREATE TABLE IF NOT EXISTS user_pity (
  user_id TEXT NOT NULL,
  pack_type TEXT NOT NULL,
  rare_pity INTEGER NOT NULL DEFAULT 0,
  legendary_pity INTEGER NOT NULL DEFAULT 0,
  last_rare_at DATETIME,
  last_legendary_at DATETIME,
  PRIMARY KEY (user_id, pack_type),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pack_type) REFERENCES pack_types(id)
);

-- Indexes for performance
CREATE INDEX idx_plants_rarity ON plants(rarity);
CREATE INDEX idx_plants_discovered ON plants(discovered_global);
CREATE INDEX idx_user_plants_user ON user_plants(user_id);
CREATE INDEX idx_user_seen_plants_user ON user_seen_plants(user_id);
CREATE INDEX idx_pack_history_user ON user_pack_history(user_id);

-- Insert pack types
INSERT OR REPLACE INTO pack_types (id, name, price_nutz, card_count, guarantees) VALUES
  ('sprout', 'Sprout Pack', 275, 3, '{"slots": [{"type": "baseline"}, {"type": "baseline"}, {"type": "baseline"}]}'),
  ('garden', 'Garden Pack', 800, 3, '{"slots": [{"type": "baseline"}, {"type": "baseline"}, {"type": "rarity", "odds": {"rare": 0.82, "legendary": 0.18}}]}'),
  ('banner', 'Banner Pack', 1500, 3, '{"slots": [{"type": "baseline"}, {"type": "rarity", "odds": {"rare": 1.0}}, {"type": "rarity", "odds": {"rare": 0.5, "legendary": 0.5}}]}');

-- Shard values for duplicates
-- Common: 10, Uncommon: 30, Rare: 120, Legendary: 400