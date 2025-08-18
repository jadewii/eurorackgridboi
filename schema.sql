-- Cloudflare D1 Schema for Plant Economy
-- Auth: Clerk | DB: D1 | Media: R2 | Payments: Stripe

-- Plant catalog
CREATE TABLE IF NOT EXISTS plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rarity TEXT CHECK (rarity IN ('common','uncommon','rare','legendary')) NOT NULL,
  r2_key TEXT NOT NULL,
  banner_id TEXT,                 -- optional featured banner
  seasonal_start DATETIME,        -- optional season window
  seasonal_end   DATETIME
);

-- Player inventory
CREATE TABLE IF NOT EXISTS user_plants (
  user_id TEXT NOT NULL,
  plant_id TEXT NOT NULL,
  source TEXT CHECK (source IN ('pack','direct','gift','seed')) NOT NULL,
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  growth_stage INTEGER DEFAULT 0, -- 0 seed,1 sprout,2 growing,3 mature
  seed_ready_at DATETIME,         -- next seed timestamp when mature
  UNIQUE(user_id, plant_id, source, acquired_at)
);

-- Currency & shards
CREATE TABLE IF NOT EXISTS user_currency (
  user_id TEXT PRIMARY KEY,
  peanuts INTEGER NOT NULL DEFAULT 0,
  shards  INTEGER NOT NULL DEFAULT 0
);

-- Pity counters per banner
CREATE TABLE IF NOT EXISTS pity (
  user_id TEXT NOT NULL,
  banner_id TEXT NOT NULL,
  rare_counter INTEGER NOT NULL DEFAULT 0,
  legendary_counter INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, banner_id)
);

-- Pack definitions
CREATE TABLE IF NOT EXISTS pack_defs (
  id TEXT PRIMARY KEY,           -- 'seed','garden','greenhouse','botanical'
  price INTEGER NOT NULL,        -- peanuts
  slots INTEGER NOT NULL,
  guarantees_json TEXT NOT NULL, -- e.g. [{"min":"uncommon","count":1}]
  odds_json TEXT NOT NULL        -- rarity weights per slot
);

-- Audit / idempotency
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,           -- ulid/uuid
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,            -- 'purchase_currency','open_pack','direct_buy','daily'
  amount INTEGER NOT NULL,
  meta_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inv_user ON user_plants(user_id);
CREATE INDEX IF NOT EXISTS idx_pity_user ON pity(user_id, banner_id);

-- Seed the pack definitions
INSERT OR REPLACE INTO pack_defs (id, price, slots, guarantees_json, odds_json) VALUES
  ('seed', 200, 3, '[]', '{"common":0.7,"uncommon":0.25,"rare":0.04,"legendary":0.01}'),
  ('garden', 600, 8, '[{"min":"uncommon","count":1}]', '{"common":0.5,"uncommon":0.35,"rare":0.12,"legendary":0.03}'),
  ('greenhouse', 1200, 12, '[{"min":"rare","count":2}]', '{"common":0.32,"uncommon":0.38,"rare":0.25,"legendary":0.05}'),
  ('botanical', 2500, 20, '[{"min":"legendary","count":1}]', '{"common":0.28,"uncommon":0.37,"rare":0.27,"legendary":0.08}');

-- Seed some plants
INSERT OR REPLACE INTO plants (id, name, rarity, r2_key) VALUES
  ('cactus1', 'Desert Cactus', 'common', 'plants/cactus1.webp'),
  ('succulent1', 'Jade Plant', 'common', 'plants/succulent1.webp'),
  ('fern1', 'Boston Fern', 'common', 'plants/fern1.webp'),
  ('flower1', 'Orchid', 'rare', 'plants/orchid.webp'),
  ('flower2', 'Rose', 'common', 'plants/rose.webp'),
  ('tree1', 'Bonsai', 'rare', 'plants/bonsai.webp'),
  ('palm1', 'Palm Tree', 'uncommon', 'plants/palm.webp'),
  ('flower3', 'Sunflower', 'common', 'plants/sunflower.webp'),
  ('flower4', 'Tulip', 'common', 'plants/tulip.webp'),
  ('herb1', 'Basil', 'common', 'plants/basil.webp'),
  ('cactus2', 'Prickly Pear', 'uncommon', 'plants/prickly_pear.webp'),
  ('succulent2', 'Aloe Vera', 'common', 'plants/aloe.webp'),
  ('flower5', 'Hibiscus', 'uncommon', 'plants/hibiscus.webp'),
  ('tree2', 'Japanese Maple', 'rare', 'plants/maple.webp'),
  ('herb2', 'Mint', 'common', 'plants/mint.webp'),
  ('flower6', 'Daisy', 'common', 'plants/daisy.webp'),
  ('succulent3', 'String of Pearls', 'rare', 'plants/string_pearls.webp'),
  ('cactus3', 'Barrel Cactus', 'uncommon', 'plants/barrel_cactus.webp'),
  ('flower7', 'Lily', 'uncommon', 'plants/lily.webp'),
  ('tree3', 'Pine Bonsai', 'rare', 'plants/pine_bonsai.webp'),
  ('herb3', 'Rosemary', 'common', 'plants/rosemary.webp'),
  ('flower8', 'Violet', 'uncommon', 'plants/violet.webp'),
  ('succulent4', 'Echeveria', 'uncommon', 'plants/echeveria.webp'),
  ('palm2', 'Bamboo', 'common', 'plants/bamboo.webp'),
  ('flower9', 'Jasmine', 'uncommon', 'plants/jasmine.webp'),
  ('mushroom1', 'Mushroom', 'rare', 'plants/mushroom.webp'),
  ('herb4', 'Thyme', 'common', 'plants/thyme.webp'),
  ('cactus4', 'Golden Barrel', 'rare', 'plants/golden_barrel.webp'),
  ('flower10', 'Peony', 'rare', 'plants/peony.webp'),
  ('tree4', 'Olive Tree', 'uncommon', 'plants/olive.webp'),
  ('succulent5', 'Lithops', 'legendary', 'plants/lithops.webp'),
  ('flower11', 'Bird of Paradise', 'legendary', 'plants/bird_paradise.webp'),
  ('herb5', 'Lavender', 'uncommon', 'plants/lavender.webp'),
  ('cactus5', 'Moon Cactus', 'rare', 'plants/moon_cactus.webp'),
  ('tree5', 'Cherry Blossom', 'legendary', 'plants/cherry_blossom.webp'),
  ('mushroom2', 'Glowing Mushroom', 'legendary', 'plants/glowing_mushroom.webp'),
  ('flower12', 'Lotus', 'legendary', 'plants/lotus.webp'),
  ('herb6', 'Sage', 'uncommon', 'plants/sage.webp'),
  ('palm3', 'Coconut Palm', 'rare', 'plants/coconut_palm.webp'),
  ('succulent6', 'Blue Agave', 'rare', 'plants/blue_agave.webp'),
  ('flower13', 'Poppy', 'common', 'plants/poppy.webp'),
  ('tree6', 'Redwood Sapling', 'legendary', 'plants/redwood.webp'),
  ('cactus6', 'Saguaro', 'legendary', 'plants/saguaro.webp'),
  ('herb7', 'Oregano', 'common', 'plants/oregano.webp'),
  ('flower14', 'Carnation', 'common', 'plants/carnation.webp'),
  ('succulent7', 'Haworthia', 'uncommon', 'plants/haworthia.webp'),
  ('mushroom3', 'Fairy Ring', 'legendary', 'plants/fairy_ring.webp'),
  ('palm4', 'Fan Palm', 'uncommon', 'plants/fan_palm.webp'),
  ('flower15', 'Chrysanthemum', 'uncommon', 'plants/chrysanthemum.webp'),
  ('herb8', 'Cilantro', 'common', 'plants/cilantro.webp');