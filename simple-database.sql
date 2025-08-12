-- Simple database for your modules
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rarity TEXT DEFAULT 'live',
  file_path TEXT NOT NULL,
  bucket_name TEXT DEFAULT 'eurorackgif',
  hp_cost INTEGER DEFAULT 50
);

-- Insert your 17 modules
INSERT INTO modules (name, file_path) VALUES
('Module 01', '01.gif'),
('Module 02', '02.gif'),
('Module 03', '03.gif'),
('Module 04', '04.gif'),
('Module 05', '05.gif'),
('Module 06', '06.gif'),
('Module 07', '07.gif'),
('Module 08', '08.gif'),
('Module 09', '09.gif'),
('Module 10', '10.gif'),
('Module 11', '11.gif'),
('Module 12', '12.gif'),
('Module 13', '13.gif'),
('Module 14', '14.gif'),
('Module 15', '15.gif'),
('Module 16', '16.gif'),
('Module 17', '17.gif');

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Allow everyone to see modules (they still need to pay to unlock)
CREATE POLICY "Anyone can view modules" ON modules FOR SELECT USING (true);