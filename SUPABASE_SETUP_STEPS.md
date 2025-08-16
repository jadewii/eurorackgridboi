# Supabase Setup Steps - Single Bucket First

## Step 1: Create the Storage Bucket

1. **Log in to your Supabase Dashboard**
   - Go to https://app.supabase.com

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar

3. **Create New Bucket**
   - Click "New bucket" button
   - Name: `eurorackgif`
   - Public bucket: Toggle OFF (keep it private for now)
   - Click "Create bucket"

## Step 2: Configure Bucket Policies (for Private Bucket)

If you made it private, you need to allow anonymous access:

1. **Click on the `eurorackgif` bucket**

2. **Go to Policies tab**

3. **Create a new policy for SELECT (viewing)**:
   ```sql
   -- Allow anyone to view files
   CREATE POLICY "Allow public viewing" ON storage.objects
   FOR SELECT USING (bucket_id = 'eurorackgif');
   ```

4. **Create a policy for downloading**:
   ```sql
   -- Allow anyone to download
   CREATE POLICY "Allow public downloads" ON storage.objects
   FOR SELECT USING (bucket_id = 'eurorackgif' AND auth.role() = 'anon');
   ```

## Step 3: Upload Test Files

1. **Click "Upload files"** in your eurorackgif bucket
2. **Upload a few animated GIF files** (these will be your LIVE modules)
3. Name them something like:
   - `oscillator-live.gif`
   - `sequencer-animated.gif`
   - `filter-moving.gif`

## Step 4: Get Your API Credentials

1. **Go to Settings → API** in Supabase Dashboard

2. **Copy these values**:
   - Project URL: `https://[your-project].supabase.co`
   - Anon/Public Key: `eyJhbGc...` (long string)

## Step 5: Configure the App

1. **Edit `supabase-client.js`**:
```javascript
// Replace these with your actual values
const SUPABASE_URL = 'https://[your-project].supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGc...your-anon-key-here...';
```

## Step 6: Test the Connection

1. **Open `debug-stickers.html` in your browser**

2. **Enter your credentials**:
   - Supabase URL: (paste your project URL)
   - Anon Key: (paste your anon key)

3. **Click "Save & Connect"**

4. **Click "Load Stickers"**
   - You should see your GIF files appear
   - They should all show as "LIVE" rarity

## Step 7: Test in Main App

1. **Open `collection.html`**
   - Click the "LIVE" filter button
   - Your GIF modules should appear (grayed out if locked)

2. **Click "🔄 Refresh Catalog"** button to reload

## Troubleshooting

### If files don't load:

1. **Check browser console** (F12) for errors

2. **Verify bucket exists**:
   - Go to Supabase Dashboard → Storage
   - Confirm `eurorackgif` bucket is there

3. **Check credentials**:
   - Make sure URL includes `https://`
   - Anon key should be a long string starting with `eyJ`

4. **Test bucket access**:
   - Try making bucket public temporarily
   - Go to bucket settings → Toggle "Public bucket" ON
   - Test again

### If images show as broken:

1. **Check CORS settings**:
   - Supabase Dashboard → Settings → API
   - Add your domain to allowed origins
   - Or use `*` for all origins (development only)

2. **Verify file upload**:
   - Files should be at bucket root (not in folders)
   - File names should not have spaces

## What You Should See

When working correctly:
- Debug page shows your GIF files with "LIVE" badge
- Collection page shows modules (grayed if locked)
- Console shows: "Found X files in eurorackgif"
- Clicking modules toggles locked/unlocked state

## Next Steps

Once this is working with the single `eurorackgif` bucket:
1. Create `common` bucket for common modules
2. Create `rare` bucket for rare modules
3. Uncomment the other buckets in `supabase-client.js`
4. Upload appropriate files to each bucket

## Quick Test Checklist

- [ ] Created `eurorackgif` bucket in Supabase
- [ ] Uploaded at least 1 GIF file
- [ ] Copied Supabase URL and Anon Key
- [ ] Updated `supabase-client.js` with credentials
- [ ] Opened `debug-stickers.html` and saw files
- [ ] Files show as "LIVE" rarity
- [ ] Can toggle locked/unlocked state