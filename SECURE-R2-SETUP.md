# Securing Your R2 Bucket for JAMNUTZ

## Current Situation
Your images are currently **publicly accessible** at:
`https://pub-003b43d100f94cca9fe8e5371e24ae6d.r2.dev/plant-001.webp`

## Goal
Make images **private** and only accessible through your Worker with ownership verification.

## Step 1: Make R2 Bucket Private

1. Go to Cloudflare Dashboard → R2
2. Select your bucket 
3. Go to **Settings** → **Public Access**
4. **DISABLE** public access (turn it OFF)
5. Remove any custom domain if configured

## Step 2: Update Worker Configuration

Update `wrangler.toml`:
```toml
name = "jamnutz-media-secure"
main = "workers/media-access-secure.js"
compatibility_date = "2023-10-30"

account_id = "YOUR_ACCOUNT_ID"

# Your domain route
routes = [
  { pattern = "jamnutz.com/api/plant-image", zone_name = "jamnutz.com" }
]

# R2 Bucket binding (PRIVATE)
[[r2_buckets]]
binding = "R2"
bucket_name = "YOUR_BUCKET_NAME"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "jamnutz-plants"
database_id = "YOUR_DATABASE_ID"
```

## Step 3: Deploy the Secure Worker

```bash
# Deploy the secure worker
wrangler deploy --config wrangler-secure.toml

# Or if you updated the main wrangler.toml:
wrangler deploy
```

## Step 4: Update Frontend

In `plants.html`, change the script import:
```html
<!-- OLD (direct public access) -->
<script src="js/plant-images-direct.js" defer></script>

<!-- NEW (secure API access) -->
<script src="js/plant-images-secure.js" defer></script>
```

## Step 5: Test Security

### Test Preview (No Auth Required)
```bash
# Should return watermarked/preview image
curl https://jamnutz.com/api/plant-image?plant_id=p1&quality=preview
```

### Test Full Quality (Auth Required)
```bash
# Without auth - should return 403
curl https://jamnutz.com/api/plant-image?plant_id=p1&quality=full

# With auth - should return full image
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://jamnutz.com/api/plant-image?plant_id=p1&quality=full
```

## Security Benefits

✅ **Images are now private** - No direct R2 access
✅ **Watermarked previews** - Non-owners see lower quality with watermark
✅ **Ownership verification** - Full quality only for verified owners
✅ **Token-based access** - Integrates with your auth system
✅ **Cached responses** - Efficient delivery through Cloudflare

## Next Steps

1. **Implement real authentication** - Replace the placeholder auth verification with Clerk/Auth0
2. **Add rate limiting** - Prevent abuse
3. **Generate actual watermarked previews** - Pre-process images with watermarks
4. **Add image resizing** - Serve different sizes based on device

## Important Notes

⚠️ **Once you disable public access, the old URLs will stop working!**
Make sure the Worker is deployed and tested before disabling public access.

⚠️ **Update all image references** in your frontend to use the new API endpoint instead of direct R2 URLs.