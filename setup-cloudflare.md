# 🚀 Cloudflare Setup Guide for JAMNUTZ Plant Images

## Prerequisites
- Cloudflare account with R2 enabled
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js 16+ installed

## Step 1: Create D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create the D1 database
wrangler d1 create jamnutz-plants
```

Copy the database ID from the output and update `wrangler.toml`:
```toml
database_id = "YOUR_DATABASE_ID_HERE"
```

## Step 2: Initialize Database Schema

```bash
# Run the schema migration
wrangler d1 execute jamnutz-plants --file=./workers/schema.sql
```

## Step 3: Configure R2 Buckets

### Create bucket (if not exists):
```bash
wrangler r2 bucket create jamnutz-media
```

### Organize your images:
Your R2 bucket should have this structure:
```
jamnutz-media/
├── plants/
│   ├── preview/     # Public access (watermarked/lower res)
│   │   ├── monstera.webp
│   │   ├── pothos.webp
│   │   └── ...
│   └── orig/        # Private access (full quality)
│       ├── monstera.webp
│       ├── pothos.webp
│       └── ...
```

## Step 4: Update Configuration

1. Get your Cloudflare Account ID:
   - Go to Cloudflare Dashboard
   - Right sidebar → Account ID
   - Copy and update in `wrangler.toml`

2. Update domain in `wrangler.toml`:
```toml
routes = [
  { pattern = "yourdomain.com/api/media-url", zone_name = "yourdomain.com" }
]
```

3. Set your public bucket URL:
```toml
[vars]
PUBLIC_BUCKET_URL = "https://YOUR-PUBLIC-ID.r2.dev"
```

## Step 5: Deploy the Worker

```bash
# Deploy to Cloudflare
wrangler publish

# Or for development
wrangler dev
```

## Step 6: Set R2 Bucket Permissions

### For Preview Bucket (Public):
1. Go to R2 → jamnutz-media bucket
2. Settings → Public Access
3. Enable public access for `/plants/preview/*`
4. Add CORS rules:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### For Original Bucket (Private):
- Keep `/plants/orig/*` private (no public access)
- Access only through Worker authentication

## Step 7: Test the Setup

### Test preview access (public):
```bash
curl https://yourdomain.com/api/media-url?plant_id=p1&kind=preview
```

### Test original access (requires auth):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://yourdomain.com/api/media-url?plant_id=p1&kind=orig
```

## Step 8: Integrate Clerk Authentication

1. Get your Clerk public key from dashboard
2. Update `wrangler.toml`:
```toml
[vars]
CLERK_PUBLIC_KEY = "pk_live_..."
```

3. Update the `verifyClerkJWT` function in `workers/media-access.js` with actual Clerk verification

## Step 9: Frontend Integration

The frontend is already set up to use the new API. Just ensure:

1. Plant pages include the script:
```html
<script src="js/plant-images.js" defer></script>
```

2. Images use the API:
```javascript
// Automatically handled by plant-images.js
await PlantImages.loadPlantImage(imgElement, plantId, isOwned);
```

## Troubleshooting

### Images not loading?
- Check browser console for CORS errors
- Verify R2 bucket public access settings
- Check Worker logs: `wrangler tail`

### Authentication failing?
- Verify Clerk JWT is being sent in Authorization header
- Check Worker logs for auth errors
- Ensure user_plants table has correct ownership data

### Slow loading?
- Enable Cloudflare caching on Worker responses
- Use smaller preview images (< 100KB)
- Implement progressive loading

## Security Checklist

- [ ] Original images are NOT publicly accessible
- [ ] Worker validates JWT on every request
- [ ] Rate limiting is enabled
- [ ] CORS is restricted to your domain
- [ ] Database queries use parameterized statements
- [ ] Cache headers are set for immutable content

## Monitoring

View Worker analytics:
```bash
wrangler tail  # Real-time logs
```

Or in Cloudflare Dashboard:
- Workers → jamnutz-media-access → Analytics

## Next Steps

1. Add watermarking to preview images
2. Implement progressive image loading
3. Add CDN caching rules
4. Set up error alerting
5. Create admin panel for managing plant data