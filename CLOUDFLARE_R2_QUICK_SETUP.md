# 🚀 CLOUDFLARE R2 QUICK SETUP

## Step 1: Create R2 Bucket (5 minutes)

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com
   - Click "R2" in the left sidebar

2. **Create Bucket**
   - Click "Create bucket"
   - Name: `eurogrid-assets`
   - Location: Automatic
   - Click "Create bucket"

3. **Enable Public Access**
   - Click on your bucket name
   - Go to "Settings" tab
   - Under "Public access", click "Allow public access"
   - Confirm the warning

## Step 2: Set Up Custom Domain (2 minutes)

1. **In R2 bucket settings:**
   - Click "Connect Domain"
   - Enter subdomain: `assets.eurogrid.com` (or `cdn.eurogrid.com`)
   - Click "Continue"
   - Cloudflare will automatically set up the DNS

2. **Get your public URL:**
   - It will be: `https://assets.eurogrid.com/` (or whatever domain you chose)
   - Copy this URL - we'll need it!

## Step 3: Upload Images (5 minutes)

### Option A: Use Cloudflare Dashboard (Easiest)
1. In your R2 bucket, click "Upload"
2. Create folders by typing: `modules/static/`
3. Upload all SVG files from `frontend/modules/static/`

### Option B: Use Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Upload entire modules folder
wrangler r2 object put eurogrid-assets/modules/static/ --file=frontend/modules/static/ --recursive
```

## Step 4: Update Your Code (2 minutes)

Open `/Users/jade/eurogrid/frontend/image-config.js` and update:

```javascript
// Change this line:
const IMAGE_ENV = 'prod'; // Was 'dev'

// Update the prod config with your domain:
prod: {
  base: 'https://assets.eurogrid.com/', // Your R2 domain here
  modules: {
    static: 'modules/static/',
    animated: 'modules/animated/',
    webp: 'modules/webp/',
    powered: 'modules/powered/'
  }
}
```

## Step 5: Configure CORS (1 minute)

1. In R2 bucket settings, go to "CORS policy"
2. Add this policy:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 6: Test It!

Open your site and images should load from Cloudflare!

---

## 🎯 QUICK CHECKLIST

- [ ] Created R2 bucket named `eurogrid-assets`
- [ ] Enabled public access
- [ ] Connected custom domain
- [ ] Uploaded module images
- [ ] Updated image-config.js with R2 URL
- [ ] Set IMAGE_ENV to 'prod'
- [ ] Added CORS policy
- [ ] Tested images load

## 💰 COST
- **Free tier**: 10GB storage, 10 million requests/month
- Your usage: ~50MB storage = **$0/month**

## 🚨 NEED YOUR ACTION NOW:

1. **Login to Cloudflare**: https://dash.cloudflare.com
2. **Tell me**: 
   - Do you have a Cloudflare account?
   - What domain do you want to use? (e.g., assets.eurogrid.com)
   - Should I prepare the upload script while you create the bucket?

Once you create the bucket and tell me the domain, I'll immediately update all the code!