# DO THESE 2 THINGS - TAKES 1 MINUTE

## STEP 1: MAKE BUCKET PUBLIC (30 seconds)
1. Go to: https://supabase.com/dashboard/project/jqxshcyqxhbmvqrrthxy/storage/buckets
2. Click "eurorackgif" 
3. Click "Edit bucket"
4. Toggle "Public bucket" to ON
5. Click "Save"

## STEP 2: RUN SQL (30 seconds)
1. Go to: https://supabase.com/dashboard/project/jqxshcyqxhbmvqrrthxy/sql/new
2. Copy and paste this EXACT SQL:

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rarity TEXT,
  file_path TEXT NOT NULL,
  bucket_name TEXT DEFAULT 'eurorackgif',
  hp_cost INTEGER DEFAULT 50
);

INSERT INTO modules (name, rarity, file_path) VALUES
('Module 01', 'live', '01.gif'),
('Module 02', 'live', '02.gif'),
('Module 03', 'live', '03.gif'),
('Module 04', 'live', '04.gif'),
('Module 05', 'live', '05.gif'),
('Module 06', 'live', '06.gif'),
('Module 07', 'live', '07.gif'),
('Module 08', 'live', '08.gif'),
('Module 09', 'live', '09.gif'),
('Module 10', 'live', '10.gif'),
('Module 11', 'live', '11.gif'),
('Module 12', 'live', '12.gif'),
('Module 13', 'live', '13.gif'),
('Module 14', 'live', '14.gif'),
('Module 15', 'live', '15.gif'),
('Module 16', 'live', '16.gif'),
('Module 17', 'live', '17.gif');

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read modules" ON modules FOR SELECT USING (true);
```

3. Click "RUN"

## DONE! 
Then go to: http://localhost:8080/final-test.html