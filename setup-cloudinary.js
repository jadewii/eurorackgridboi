// Cloudinary Setup - The SMART choice for EurorackGrid
// Why Cloudinary is better than Firebase Storage for you:
// 1. Automatic image optimization (makes WebP even smaller!)
// 2. On-the-fly transformations (resize, quality, format)
// 3. Global CDN (faster than Firebase)
// 4. 25GB free bandwidth/month (plenty for starting)
// 5. No complex Firebase setup needed

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Cloudinary Configuration
// FREE TIER: 25GB bandwidth, 25GB storage, 25k transformations/month
cloudinary.config({
  cloud_name: 'eurorackgrid',  // You'll create this account
  api_key: 'YOUR_API_KEY',     // From Cloudinary dashboard
  api_secret: 'YOUR_SECRET',   // From Cloudinary dashboard
  secure: true
});

// SMART Upload Settings for your modules
const UPLOAD_CONFIG = {
  // Cloudinary will automatically optimize these!
  folder: 'modules',  // Organized folders
  resource_type: 'image',
  
  // Auto-optimization settings
  transformation: [
    {
      quality: 'auto:best',  // Cloudinary picks best quality/size ratio
      fetch_format: 'auto',   // Serves WebP to Chrome, JPEG to Safari, etc.
      width: 300,            // Perfect square for modules
      height: 300,
      crop: 'fill',
      dpr: 'auto'            // Retina support
    }
  ],
  
  // Make URLs prettier
  use_filename: true,
  unique_filename: false,
  overwrite: true,
  
  // Performance settings
  eager: [
    { width: 150, height: 150, crop: 'fill' },  // Thumbnail size
    { width: 300, height: 300, crop: 'fill' }   // Full size
  ],
  eager_async: true
};

async function setupCloudinary() {
  console.log(`
  ⭐ CLOUDINARY SETUP - The Smart Choice!
  =======================================
  
  Why this is better than Firebase Storage:
  
  ✅ Automatic WebP optimization (smaller files)
  ✅ Global CDN (faster loading worldwide)  
  ✅ No authentication needed for images
  ✅ Simple URLs like: cloudinary.com/eurorackgrid/modules/module-name.webp
  ✅ Free tier is generous (25GB/month)
  ✅ Auto-resize for different screen sizes
  
  SETUP STEPS:
  
  1. Go to: https://cloudinary.com/users/register/free
  2. Sign up for FREE account
  3. Choose cloud name: "eurorackgrid"
  4. Get your API credentials from dashboard
  5. Run: npm install cloudinary
  6. Update this file with your credentials
  7. Run: node setup-cloudinary.js --upload
  
  `);
}

async function uploadToCloudinary() {
  const webpDir = './frontend/webp/';
  const files = fs.readdirSync(webpDir).filter(f => f.endsWith('.webp'));
  
  console.log(`📤 Uploading ${files.length} modules to Cloudinary...\n`);
  
  const results = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(webpDir, file);
      const publicId = path.basename(file, '.webp');
      
      console.log(`Uploading ${file}...`);
      
      const result = await cloudinary.uploader.upload(filePath, {
        ...UPLOAD_CONFIG,
        public_id: publicId
      });
      
      results.push({
        name: file,
        url: result.secure_url,
        optimizedUrl: result.eager[0].secure_url,
        size: (result.bytes / 1024).toFixed(2) + 'KB'
      });
      
      console.log(`✅ ${file} -> ${result.secure_url}`);
      
    } catch (error) {
      console.error(`❌ Error uploading ${file}:`, error.message);
    }
  }
  
  // Save URL mapping
  const urlMap = {};
  results.forEach(r => {
    urlMap[r.name] = r.url;
  });
  
  fs.writeFileSync('cloudinary-urls.json', JSON.stringify(urlMap, null, 2));
  
  console.log('\n✅ Upload complete! URLs saved to cloudinary-urls.json');
  
  return results;
}

// Alternative: Use Cloudflare R2 (even better for your needs!)
function cloudflareR2Setup() {
  console.log(`
  🚀 ALTERNATIVE: Cloudflare R2 Storage
  =====================================
  
  Even BETTER option for you:
  
  ✅ 10GB FREE storage forever
  ✅ NO bandwidth charges (completely free egress!)
  ✅ Compatible with Amazon S3 APIs
  ✅ Automatic global CDN
  ✅ $0.015 per GB after 10GB (super cheap)
  
  This means your images load FAST worldwide for FREE!
  
  Setup:
  1. Go to: https://dash.cloudflare.com/sign-up/r2
  2. Create R2 bucket called "eurorackgrid"
  3. Enable public access
  4. Upload your WebP files
  5. Get URLs like: https://eurorackgrid.r2.dev/modules/module-name.webp
  
  `);
}

// Simple CDN option using GitHub Pages (completely free!)
function githubPagesOption() {
  console.log(`
  📦 SIMPLEST OPTION: GitHub Pages
  =================================
  
  For starting out, this might be ALL you need:
  
  ✅ 100% FREE forever
  ✅ Automatic HTTPS
  ✅ GitHub's CDN
  ✅ No API keys needed
  ✅ Version control built-in
  
  Setup:
  1. Create repo: github.com/yourusername/eurorackgrid-assets
  2. Upload webp files to /modules/ folder
  3. Enable GitHub Pages in settings
  4. Access at: https://yourusername.github.io/eurorackgrid-assets/modules/module-name.webp
  
  This is probably the SMARTEST start!
  `);
}

// Show all options
if (process.argv[2] === '--help') {
  setupCloudinary();
  cloudflareR2Setup();
  githubPagesOption();
  
  console.log(`
  🎯 MY RECOMMENDATION FOR YOU:
  =============================
  
  Start with GitHub Pages (100% free, no complexity)
  ↓
  When you need more speed: Move to Cloudflare R2
  ↓
  When you need image transformations: Add Cloudinary
  
  For now, GitHub Pages will work PERFECTLY and costs $0!
  `);
}

// Upload to Cloudinary
if (process.argv[2] === '--upload') {
  uploadToCloudinary();
}

export { uploadToCloudinary };