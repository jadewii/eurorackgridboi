# Cloudflare R2 Setup Guide for EUROGRID Images

## Current Image Hosting
Currently using Supabase Storage with these buckets:
- `eurorackart` - Static PNG module images
- `eurorackgif` - Animated GIF modules
- `euroracklegacywebp` - WebP format images
- `eurorackpowered` - Video files (WebM/MP4) with blur previews

Base URL: `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/`

## Cloudflare R2 Setup Steps

### Step 1: Create R2 Bucket
1. Log into Cloudflare Dashboard
2. Navigate to R2 Storage
3. Create new bucket named `eurogrid-assets`
4. Enable public access

### Step 2: Configure Custom Domain
1. Go to bucket settings
2. Add custom domain: `assets.eurogrid.com` (or similar)
3. Configure CORS settings:
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }]
}
```

### Step 3: Upload Images
Create folder structure in R2:
```
eurogrid-assets/
├── modules/
│   ├── static/    (PNG files: 01.png - 36.png)
│   ├── animated/  (GIF files: 01.gif - 17.gif)
│   └── webp/      (WebP versions)
├── racks/
├── panels/
└── accessories/
```

### Step 4: Image Optimization Strategy

#### For Static Modules (PNG):
- Original: Keep high quality PNG
- Generate WebP versions at 80% quality
- Create thumbnail versions (150x150)

#### For Animated Modules (GIF):
- Keep original GIFs
- Create optimized versions:
  - Small: 100px width, 60% quality
  - Medium: 200px width, 70% quality
  - Large: Original size, 80% quality

### Step 5: Update Code References

Create a config file for easy URL management:

```javascript
// image-config.js
const IMAGE_CONFIG = {
  // For development (current Supabase)
  dev: {
    base: 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/',
    modules: {
      static: 'eurorackart/',
      animated: 'eurorackgif/',
      webp: 'euroracklegacywebp/'
    }
  },
  // For production (Cloudflare R2)
  prod: {
    base: 'https://assets.eurogrid.com/',
    modules: {
      static: 'modules/static/',
      animated: 'modules/animated/',
      webp: 'modules/webp/'
    }
  }
};

// Use environment variable or flag
const ENV = 'dev'; // Change to 'prod' for production
const IMG_BASE = IMAGE_CONFIG[ENV];

// Helper function to get module image URL
function getModuleImageUrl(moduleId, type = 'static', size = 'full') {
  const folder = IMG_BASE.modules[type];
  const extension = type === 'webp' ? '.webp' : (type === 'animated' ? '.gif' : '.png');
  
  let url = `${IMG_BASE.base}${folder}${moduleId}${extension}`;
  
  // Add size parameters for R2 (using Cloudflare Image Resizing)
  if (ENV === 'prod' && size !== 'full') {
    const sizeParams = {
      thumb: 'width=150,quality=80',
      medium: 'width=300,quality=85',
      large: 'width=600,quality=90'
    };
    url += `?${sizeParams[size] || ''}`;
  }
  
  return url;
}
```

### Step 6: Files to Update

Update these files to use the new image config:

1. **collection.html** - Lines 293-295
2. **module-packs.html** - Lines 871-872, 893-894
3. **module-packs-unified.html** - Lines 850-851, 872-873
4. **panels.html** - Lines 465-468
5. **module-controller.js** - Line 54
6. **simple-store.html** - Line 220

### Step 7: Migration Script

```bash
#!/bin/bash
# migrate-to-r2.sh

# Download from Supabase
mkdir -p migration/modules/{static,animated,webp}

# Download static modules
for i in {01..36}; do
  num=$(printf "%02d" $i)
  curl -o "migration/modules/static/${num}.png" \
    "https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/eurorackart/${num}.png"
done

# Download animated modules
for i in {01..17}; do
  num=$(printf "%02d" $i)
  curl -o "migration/modules/animated/${num}.gif" \
    "https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/eurorackgif/${num}.gif"
done

# Upload to R2 using rclone or AWS CLI configured for R2
# rclone copy migration/ r2:eurogrid-assets/
```

### Step 8: Performance Optimizations

1. **Enable Cloudflare CDN caching**:
   - Cache Everything page rule for `/modules/*`
   - Browser Cache TTL: 1 month
   - Edge Cache TTL: 1 month

2. **Use Cloudflare Image Resizing**:
   - Automatic WebP conversion for supported browsers
   - On-the-fly resizing with URL parameters
   - Polish: Lossy compression

3. **Implement lazy loading**:
```javascript
// Add to module display code
const img = new Image();
img.loading = 'lazy';
img.src = getModuleImageUrl(moduleId);
```

### Step 9: Testing Checklist

- [ ] All module images load correctly
- [ ] GIF animations play smoothly
- [ ] WebP fallback works
- [ ] CORS headers allow cross-origin requests
- [ ] Images cached properly in browser
- [ ] Page load time improved

### Step 10: Rollback Plan

Keep the Supabase bucket active during migration. Use feature flag to switch between services:

```javascript
// In each HTML file, add at top
const USE_R2 = false; // Set to true when R2 is ready

// Update image URLs conditionally
const imageBase = USE_R2 
  ? 'https://assets.eurogrid.com/' 
  : 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/';
```

## Benefits of R2

1. **Cost**: R2 has no egress fees (Supabase charges for bandwidth)
2. **Performance**: Cloudflare's global CDN
3. **Features**: Automatic image optimization, resizing, WebP conversion
4. **Reliability**: 99.9% uptime SLA
5. **Integration**: Works seamlessly with Cloudflare Workers for serverless functions

## Estimated Timeline

- Day 1: Set up R2 bucket and domain
- Day 2: Upload and organize images
- Day 3: Update code with new URLs
- Day 4: Testing and optimization
- Day 5: Production deployment

## Monthly Cost Estimate

- R2 Storage: ~$0.015/GB/month (assuming 5GB of images)
- R2 Operations: Free tier covers typical usage
- Total: < $1/month vs Supabase ~$25/month for bandwidth