# Digital Sticker Image Storage Strategy

## Problem
- Printify could change URLs or remove products
- Need reliable storage for digital collection
- Must serve high-quality images quickly

## Recommended Solution

### 1. Primary Storage Options

#### Option A: Cloudflare R2 (Recommended)
- **Cost**: $0.015/GB/month + free egress
- **Benefits**: 
  - No bandwidth charges (huge savings)
  - S3-compatible API
  - Global CDN built-in
  - Very reliable
- **Setup**: Simple with their dashboard or S3 tools

#### Option B: AWS S3 + CloudFront
- **Cost**: ~$0.023/GB/month + bandwidth
- **Benefits**: Industry standard, very reliable
- **Downside**: Bandwidth costs can add up

#### Option C: Bunny CDN Storage
- **Cost**: $0.01/GB/month + $0.01/GB bandwidth
- **Benefits**: Cheap, simple, good CDN
- **Perfect for**: Starting out

### 2. Implementation Plan

```javascript
// Create a backup system
const imageBackup = {
  // 1. Download all Printify images
  async backupImages() {
    for (const product of printifyProducts) {
      // Download original image
      const response = await fetch(product.image);
      const blob = await response.blob();
      
      // Upload to your storage
      await uploadToStorage(blob, `stickers/${product.id}.jpg`);
    }
  },
  
  // 2. Serve from your CDN with Printify fallback
  getImageUrl(stickerId) {
    // Try your CDN first
    const cdnUrl = `https://cdn.yourdomain.com/stickers/${stickerId}.jpg`;
    
    // Fallback to Printify if needed
    const printifyUrl = printifyProducts.find(p => p.id === stickerId)?.image;
    
    return cdnUrl || printifyUrl;
  }
};
```

### 3. Directory Structure
```
/stickers
  /full (1024x1024 high quality)
    - mod-01.jpg
    - mod-02.jpg
  /thumb (256x256 for grid view)
    - mod-01.jpg
    - mod-02.jpg
  /watermarked (for sharing)
    - mod-01.jpg
    - mod-02.jpg
```

### 4. Quick Start with GitHub Pages (Free)
For immediate testing:
1. Create a GitHub repo: `eurorack-stickers`
2. Upload images to `/images` folder
3. Enable GitHub Pages
4. Access at: `https://[username].github.io/eurorack-stickers/images/mod-01.jpg`

### 5. Database for Metadata
Store product info in a simple JSON or database:
```json
{
  "mod-01": {
    "title": "Mod-01 - eurorack sticker",
    "price_digital": 2,
    "image_cdn": "https://cdn.eurorack.store/stickers/mod-01.jpg",
    "image_printify": "https://printify.com/...",
    "unlocked_by": ["user123", "user456"],
    "created": "2024-01-01"
  }
}
```

### 6. Backup Script
```bash
#!/bin/bash
# backup-stickers.sh

# Download all sticker images from Printify
mkdir -p backup/stickers

# Loop through products and download
node -e "
const products = require('./printify-products.js');
products.forEach(p => {
  if (p.category === 'stickers') {
    console.log('wget -O backup/stickers/' + p.id + '.jpg ' + p.image);
  }
});
" | bash

# Upload to your CDN
# aws s3 sync backup/stickers s3://your-bucket/stickers
# or
# rclone copy backup/stickers cloudflare:your-bucket/stickers
```

## Immediate Action Items

1. **Today**: Download all images locally as backup
2. **This Week**: Set up Bunny CDN ($10 credit lasts months)
3. **Later**: Migrate to Cloudflare R2 when scaling

## Cost Estimate
- 25 stickers × 500KB each = 12.5MB
- Storage: < $0.01/month
- 1000 views/month: < $0.01 bandwidth
- **Total: Under $1/month to start**

## Security Notes
- Watermark images for public sharing
- Use signed URLs for purchases
- Keep high-res versions behind auth