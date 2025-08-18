-- Sample plant data for JAMNUTZ
-- This populates the database with initial plant records

-- Insert plant records with their R2 storage paths
INSERT INTO plants (id, preview_key, orig_key, rarity, price, collected_count) VALUES
('p1', 'plants/preview/p1.webp', 'plants/orig/p1.webp', 'common', 25, 890),
('p2', 'plants/preview/p2.webp', 'plants/orig/p2.webp', 'common', 15, 1200),
('p3', 'plants/preview/p3.webp', 'plants/orig/p3.webp', 'common', 30, 650),
('p4', 'plants/preview/p4.webp', 'plants/orig/p4.webp', 'common', 20, 420),
('p5', 'plants/preview/p5.webp', 'plants/orig/p5.webp', 'common', 35, 380),
('p6', 'plants/preview/p6.webp', 'plants/orig/p6.webp', 'common', 18, 950),
('p7', 'plants/preview/p7.webp', 'plants/orig/p7.webp', 'common', 22, 780),
('p8', 'plants/preview/p8.webp', 'plants/orig/p8.webp', 'common', 28, 320),
('p9', 'plants/preview/p9.webp', 'plants/orig/p9.webp', 'common', 32, 540),
('p10', 'plants/preview/p10.webp', 'plants/orig/p10.webp', 'common', 26, 670),
('p11', 'plants/preview/p11.webp', 'plants/orig/p11.webp', 'common', 24, 880),
('p12', 'plants/preview/p12.webp', 'plants/orig/p12.webp', 'rare', 45, 490),
('p13', 'plants/preview/p13.webp', 'plants/orig/p13.webp', 'common', 38, 340),
('p14', 'plants/preview/p14.webp', 'plants/orig/p14.webp', 'common', 28, 820),
('p15', 'plants/preview/p15.webp', 'plants/orig/p15.webp', 'rare', 85, 125),
('p16', 'plants/preview/p16.webp', 'plants/orig/p16.webp', 'legendary', 150, 48),
('p17', 'plants/preview/p17.webp', 'plants/orig/p17.webp', 'rare', 120, 89),
('p18', 'plants/preview/p18.webp', 'plants/orig/p18.webp', 'legendary', 200, 23),
('p19', 'plants/preview/p19.webp', 'plants/orig/p19.webp', 'legendary', 180, 67),
('p20', 'plants/preview/p20.webp', 'plants/orig/p20.webp', 'rare', 65, 156);

-- Sample user ownership data (for testing)
-- Replace these user IDs with actual Clerk user IDs
INSERT INTO user_plants (user_id, plant_id, acquired_date) VALUES
('user_test_001', 'p1', datetime('now')),
('user_test_001', 'p2', datetime('now')),
('user_test_001', 'p5', datetime('now')),
('user_test_001', 'p6', datetime('now')),
('user_test_001', 'p9', datetime('now')),
('user_test_001', 'p11', datetime('now')),
('user_test_001', 'p14', datetime('now'));