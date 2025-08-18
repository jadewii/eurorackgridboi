-- D1 Database Schema for JAMNUTZ Plants

-- Plants table with preview and original keys
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT CHECK(rarity IN ('common', 'rare', 'legendary')),
  price INTEGER NOT NULL,
  preview_key TEXT NOT NULL,
  orig_key TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User plants ownership table
CREATE TABLE IF NOT EXISTS user_plants (
  user_id TEXT NOT NULL,
  plant_id TEXT NOT NULL,
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, plant_id),
  FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Create indexes for performance
CREATE INDEX idx_user_plants_user ON user_plants(user_id);
CREATE INDEX idx_user_plants_plant ON user_plants(plant_id);
CREATE INDEX idx_plants_rarity ON plants(rarity);

-- Seed data for plants (update with actual R2 paths)
INSERT OR IGNORE INTO plants (id, name, description, rarity, price, preview_key, orig_key) VALUES
  ('p1', 'Monstera', 'Swiss cheese plant with iconic split leaves', 'common', 25, 'plants/preview/monstera.webp', 'plants/orig/monstera.webp'),
  ('p2', 'Pothos', 'Easy-care trailing vine', 'common', 15, 'plants/preview/pothos.webp', 'plants/orig/pothos.webp'),
  ('p3', 'Snake Plant', 'Architectural upright leaves', 'common', 30, 'plants/preview/snake-plant.webp', 'plants/orig/snake-plant.webp'),
  ('p4', 'Fern', 'Classic fronds for that jungle vibe', 'common', 20, 'plants/preview/fern.webp', 'plants/orig/fern.webp'),
  ('p5', 'Bamboo', 'Lucky bamboo stalks', 'common', 35, 'plants/preview/bamboo.webp', 'plants/orig/bamboo.webp'),
  ('p6', 'Cactus', 'Desert vibes, minimal care', 'common', 18, 'plants/preview/cactus.webp', 'plants/orig/cactus.webp'),
  ('p7', 'Succulent', 'Rosette-shaped drought lover', 'common', 22, 'plants/preview/succulent.webp', 'plants/orig/succulent.webp'),
  ('p8', 'Ivy', 'Classic climbing vine', 'common', 28, 'plants/preview/ivy.webp', 'plants/orig/ivy.webp'),
  ('p9', 'Rubber Plant', 'Glossy burgundy leaves', 'common', 32, 'plants/preview/rubber-plant.webp', 'plants/orig/rubber-plant.webp'),
  ('p10', 'Peace Lily', 'Elegant white blooms', 'common', 26, 'plants/preview/peace-lily.webp', 'plants/orig/peace-lily.webp'),
  ('p11', 'Spider Plant', 'Striped leaves with babies', 'common', 24, 'plants/preview/spider-plant.webp', 'plants/orig/spider-plant.webp'),
  ('p12', 'Aloe Vera', 'Healing succulent', 'rare', 45, 'plants/preview/aloe-vera.webp', 'plants/orig/aloe-vera.webp'),
  ('p13', 'Philodendron', 'Heart-shaped leaves', 'common', 38, 'plants/preview/philodendron.webp', 'plants/orig/philodendron.webp'),
  ('p14', 'ZZ Plant', 'Glossy architectural beauty', 'common', 28, 'plants/preview/zz-plant.webp', 'plants/orig/zz-plant.webp'),
  ('p15', 'Fiddle Leaf', 'Instagram-famous fig tree', 'rare', 85, 'plants/preview/fiddle-leaf.webp', 'plants/orig/fiddle-leaf.webp'),
  ('p16', 'Bird of Paradise', 'Tropical statement piece', 'legendary', 150, 'plants/preview/bird-of-paradise.webp', 'plants/orig/bird-of-paradise.webp'),
  ('p17', 'Variegated Monstera', 'Rare white-splashed leaves', 'rare', 120, 'plants/preview/variegated-monstera.webp', 'plants/orig/variegated-monstera.webp'),
  ('p18', 'Pink Princess', 'Pink variegated philodendron', 'legendary', 200, 'plants/preview/pink-princess.webp', 'plants/orig/pink-princess.webp'),
  ('p19', 'Thai Constellation', 'Creamy speckled monstera', 'legendary', 180, 'plants/preview/thai-constellation.webp', 'plants/orig/thai-constellation.webp'),
  ('p20', 'Golden Pothos', 'Golden variegated trailing vine', 'rare', 65, 'plants/preview/golden-pothos.webp', 'plants/orig/golden-pothos.webp');

-- Sample ownership data (for testing)
INSERT OR IGNORE INTO user_plants (user_id, plant_id) VALUES
  ('user_123', 'p1'),
  ('user_123', 'p2'),
  ('user_123', 'p5'),
  ('user_123', 'p6'),
  ('user_123', 'p9'),
  ('user_123', 'p11'),
  ('user_123', 'p14');