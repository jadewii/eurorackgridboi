# EUROGRID Deployment Guide

## Quick Deploy Options

### Option 1: Netlify (Recommended - Fastest)
Free tier includes:
- Custom domain
- HTTPS
- Automatic deploys from Git
- 100GB bandwidth/month

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from frontend directory
cd frontend
netlify deploy --prod --dir .

# Or use the quick deploy script
./quick-deploy.sh
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

### Option 3: GitHub Pages
1. Push code to GitHub repository
2. Go to Settings > Pages
3. Select source branch
4. Site will be available at: `https://[username].github.io/eurogrid/`

### Option 4: Cloudflare Pages (Best for R2 Integration)
1. Connect GitHub repository
2. Set build command: (none - static site)
3. Set output directory: `frontend`
4. Deploy

## Pre-Deployment Checklist

- [x] Test purchase flow working
- [x] User authentication functional
- [x] Data persistence verified
- [x] Navigation working across all pages
- [x] Image configuration ready for production
- [ ] Update image URLs to production CDN
- [ ] Test on mobile devices
- [ ] Check console for errors

## Environment Configuration

### Development URLs
Currently using:
- Supabase for images
- localStorage for user data
- No backend required

### Production URLs
Update these before deploying:
1. In `image-config.js`, change:
   ```javascript
   const IMAGE_ENV = 'prod'; // Change from 'dev'
   ```

2. Update R2 domain when ready:
   ```javascript
   base: 'https://your-r2-domain.com/'
   ```

## Test URLs After Deployment

### Netlify
- Auto-generated: `https://[random-name].netlify.app`
- Custom domain: `https://eurogrid.netlify.app` (if available)

### Vercel
- Auto-generated: `https://eurogrid-[random].vercel.app`
- Custom domain: `https://eurogrid.vercel.app` (if available)

### Your Test Server
Currently running at: `http://localhost:8123`

## Post-Deployment Testing

1. **Test Core Features**:
   - [ ] Create new account
   - [ ] Login/logout flow
   - [ ] Purchase a module
   - [ ] Navigate all pages
   - [ ] Check My Studio displays correctly

2. **Test Pages**:
   - [ ] Landing page: `/landing.html`
   - [ ] My Studio: `/my-studio.html`
   - [ ] Collection: `/collection.html`
   - [ ] Module Packs: `/module-packs.html`
   - [ ] Rack Shop: `/rack-shop.html`
   - [ ] Vibe Shop: `/vibe-shop.html`

3. **Performance Tests**:
   - [ ] Page load time < 3 seconds
   - [ ] Images loading properly
   - [ ] No console errors
   - [ ] Mobile responsive

## Deployment Scripts

### quick-deploy.sh
```bash
#!/bin/bash
# Save as frontend/quick-deploy.sh

echo "🚀 Deploying EUROGRID to Netlify..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
netlify deploy --prod --dir . --site eurogrid-test

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at the URL shown above"
```

### deploy-vercel.sh
```bash
#!/bin/bash
# Save as frontend/deploy-vercel.sh

echo "🚀 Deploying EUROGRID to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
```

## Custom Domain Setup

### For test deployment:
- Netlify: `eurogrid-test.netlify.app`
- Vercel: `eurogrid-test.vercel.app`

### For production:
1. Purchase domain (e.g., `eurogrid.io`)
2. Add to deployment platform
3. Configure DNS records
4. Enable HTTPS

## Monitoring

### Analytics (Optional)
Add before closing `</head>` tag:
```html
<!-- Plausible Analytics (Privacy-friendly) -->
<script defer data-domain="eurogrid.com" src="https://plausible.io/js/script.js"></script>
```

### Error Tracking (Optional)
```javascript
// Add to purchase-integration-fixed.js
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  // Send to error tracking service if needed
});
```

## Rollback Plan

If issues arise after deployment:
1. **Netlify**: Use instant rollback in dashboard
2. **Vercel**: Redeploy previous version
3. **Emergency**: Point domain back to old version

## Support & Maintenance

### Known Issues:
- Images currently on Supabase (migration to R2 pending)
- Mock data in some sections (racks, plants)

### Future Improvements:
- [ ] Real backend integration
- [ ] Payment processing
- [ ] User profiles
- [ ] Social features
- [ ] Mobile app

## Contact for Issues

Create issues at: `https://github.com/[your-username]/eurogrid/issues`

---

## Quick Start Deployment

Run this command to deploy immediately:

```bash
cd /Users/jade/eurogrid/frontend
npx -y netlify-cli deploy --prod --dir .
```

This will:
1. Install Netlify CLI if needed
2. Deploy your site
3. Provide a live URL

Test URL will be shown in the terminal output!