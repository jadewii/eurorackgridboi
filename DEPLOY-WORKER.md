# Deploy Worker for Private R2 Images

## Quick Deploy Steps

### 1. Get Your Cloudflare Account ID
- Go to Cloudflare Dashboard
- Right sidebar shows your Account ID
- Copy it

### 2. Update wrangler-simple.toml
Replace `YOUR_ACCOUNT_ID` with your actual account ID:
```toml
account_id = "abc123def456..."
```

### 3. Login to Cloudflare
```bash
wrangler login
```

### 4. Upload Images to R2
```bash
# Run the upload script
./upload-private-images.sh
```

### 5. Deploy the Worker
```bash
# Deploy the simple worker
wrangler deploy --config wrangler-simple.toml
```

### 6. Test the Worker
After deployment, you'll get a URL like:
`https://jamnutz-media-simple.YOUR-SUBDOMAIN.workers.dev`

Test it:
```bash
# Test plant 1
curl https://jamnutz-media-simple.YOUR-SUBDOMAIN.workers.dev/api/plant-image?plant_id=p1
```

### 7. Update Your Frontend
In your HTML files, update the image loading to use the Worker URL:
```javascript
const WORKER_URL = 'https://jamnutz-media-simple.YOUR-SUBDOMAIN.workers.dev/api/plant-image';
```

## Local Testing (Before Deploy)

```bash
# Run worker locally
wrangler dev --config wrangler-simple.toml --local false

# This will give you http://localhost:8787
# Test with: http://localhost:8787/api/plant-image?plant_id=p1
```

## Verify R2 Bucket is Private
1. Try accessing old public URL - should fail
2. Images should ONLY work through Worker

## Troubleshooting

**"Image not found"**
- Check if images are uploaded to R2
- Verify image names match pattern: plant-001.webp, plant-002.webp, etc.

**"Unauthorized"**
- Make sure R2 bucket binding is correct in wrangler.toml
- Check account ID is correct

**CORS errors**
- Worker already includes CORS headers
- If still issues, update origin in worker from '*' to your domain