<<<<<<< HEAD
# Supabase Integration Setup Guide

## Quick Start

1. **Configure Supabase credentials** in `supabase-client.js`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

2. **Create storage bucket** in Supabase Dashboard:
   - Name: `eurorackgif`
   - Type: Private (recommended) or Public

3. **Upload your module images** to the bucket:
   - Supported formats: GIF, PNG, JPG, WEBP
   - Animated GIFs will automatically be marked as "LIVE" rarity
   - Name files descriptively (they become module names)

## Features Implemented

### 1. Dynamic Image Loading
- Loads all images from `eurorackgif` bucket
- Auto-detects private vs public bucket configuration
- 60-second signed URLs for private buckets
- Automatic URL refresh before expiry

### 2. Rarity Detection
- **COMMON**: Standard modules (default)
- **RARE**: Files with "rare" in name
- **HOLOGRAPHIC**: Files with "holo" in name  
- **LIVE**: Animated GIFs or files with "live" in name

### 3. Lock/Unlock System
- Maintains existing locked/unlocked UI
- Grayed out appearance for locked modules
- No watermarks or blur effects
- Pure CSS implementation

### 4. Refresh Capability
- "🔄 Refresh Catalog" button on all pages
- Updates without code changes when new files uploaded
- Clears URL cache for fresh signed URLs

## Testing

1. Open `debug-stickers.html` in browser
2. Enter your Supabase URL and Anon Key
3. Click "Save & Connect"
4. Test features:
   - Load stickers from bucket
   - Toggle lock states
   - Test signed URLs
   - Clear cache

## File Structure

```
frontend/
├── supabase-client.js       # Core Supabase client
├── supabase-integration.js  # Integration helpers
├── debug-stickers.html      # Test page
├── collection.html          # Updated with Supabase
├── sticker-shop.html        # Updated with Supabase
├── hp-purchase.html         # Updated with LIVE rarity
└── .env.local              # Credentials (git-ignored)
```

## Bucket Configuration

### Private Bucket (Recommended)
- More secure
- Uses signed URLs (60 second expiry)
- Automatic refresh handling

### Public Bucket
- Simpler setup
- Direct URLs
- No expiry management needed

## CSP Configuration

Add to your HTML pages:
```html
<meta http-equiv="Content-Security-Policy" content="
    img-src 'self' https: data: blob: *.supabase.co;
    connect-src 'self' https: *.supabase.co;
">
```

## Module Management

### Adding New Modules
1. Upload image to `eurorackgif` bucket
2. Click "Refresh Catalog" button
3. Module appears instantly

### Naming Convention
- `module-name.gif` → "module-name" 
- `rare-oscillator.png` → "rare-oscillator" (RARE)
- `holo-filter.jpg` → "holo-filter" (HOLOGRAPHIC)
- `live-sequencer.gif` → "live-sequencer" (LIVE)

## Troubleshooting

### Images Not Loading
1. Check Supabase credentials in `supabase-client.js`
2. Verify bucket name is `eurorackgif`
3. Test with `debug-stickers.html`
4. Check browser console for errors

### Signed URLs Failing
- Bucket might be public
- Check RLS policies in Supabase
- Verify anon key has storage permissions

### Refresh Not Working  
- Clear browser cache
- Check console for JavaScript errors
- Verify Supabase connection

## Next Steps

1. Configure your Supabase credentials
2. Upload module images to bucket
3. Test with debug page
4. Deploy to production

## Support

For issues or questions:
- Check browser console for errors
- Use debug-stickers.html for testing
- Verify Supabase dashboard settings
=======
# Supabase Storage Setup Instructions

## Steps to fix the broken images:

### Option 1: Create folder structure in eurogrid bucket
1. Click on the `eurogrid` bucket
2. Click "Upload files" or similar button
3. Create these folders:
   - `modules` folder
   - Inside `modules`, create `art` folder
   - Inside `modules`, create `live` folder  
   - Back at root, create `icons` folder

4. Upload your files:
   - Upload 01.png through 36.png to `eurogrid/modules/art/`
   - Upload 01.gif through 17.gif to `eurogrid/modules/live/`
   - Upload jacknut.png to `eurogrid/icons/`

### Option 2: Keep using existing buckets (simpler for now)
If you want to keep using your existing buckets (eurorackgif, eurorackart, icons), I can revert the code back to use those paths instead.

## Current Issue:
The code is looking for:
- `/storage/v1/object/public/eurogrid/modules/art/01.png` (etc.)
- `/storage/v1/object/public/eurogrid/modules/live/01.gif` (etc.)
- `/storage/v1/object/public/eurogrid/icons/jacknut.png`

But your files are currently in:
- `/storage/v1/object/public/eurorackart/01.png`
- `/storage/v1/object/public/eurorackgif/01.gif`
- `/storage/v1/object/public/icons/jacknut.png` (if uploaded)

Let me know which option you prefer:
1. Create the folder structure in eurogrid bucket (better long-term)
2. Revert code to use existing buckets (quicker fix)
>>>>>>> cb45dfab69c0fffff51323284bc6c5bc82291fb1
