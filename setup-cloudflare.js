#!/usr/bin/env node

// Automated Cloudflare R2 Setup Script
// This prepares everything for upload to R2

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log(`
🚀 EURORACKGRID CLOUDFLARE SETUP
=================================

This script will:
1. Create hashed module names (prevent URL guessing)
2. Generate R2 upload commands
3. Create optimized image URLs
4. Update all HTML files

`);

// Configuration
const CONFIG = {
  R2_BUCKET: 'eurorackgrid',
  R2_URL: 'https://eurorackgrid.r2.dev',
  MODULES_DIR: './frontend/webp',
  OUTPUT_DIR: './r2-ready'
};

// Step 1: Prepare module files with hashed names
function prepareModules() {
  console.log('📦 Preparing modules with secure names...\n');
  
  // Create output directory
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // Module list (we'll use placeholders for now)
  const modules = [
    'function-synthesizer',
    'honduh', 
    'andersons',
    'varigated',
    'bai',
    'cephalopod-rose',
    'physical-modeler',
    'voltaged-gray',
    'complex-oscillator',
    'textural-synthesizer',
    'mangler-tangler',
    'altered-black'
  ];

  const urlMapping = {};
  
  modules.forEach(moduleName => {
    // Generate hash prefix
    const hash = crypto.createHash('md5')
      .update(moduleName + 'eurorack2024')
      .digest('hex')
      .substring(0, 8);
    
    const hashedName = `${hash}_${moduleName}`;
    
    // Store mapping
    urlMapping[moduleName] = {
      preview: `${CONFIG.R2_URL}/cdn-cgi/image/width=300,quality=50,blur=5/previews/${hashedName}.jpg`,
      animated: `${CONFIG.R2_URL}/cdn-cgi/image/width=300,format=webp/modules/${hashedName}.webp`,
      thumbnail: `${CONFIG.R2_URL}/cdn-cgi/image/width=150,format=webp/modules/${hashedName}.webp`,
      hash: hash
    };
    
    console.log(`✓ ${moduleName} → ${hashedName}`);
  });

  // Save URL mapping
  fs.writeFileSync(
    './cloudflare-urls.json',
    JSON.stringify(urlMapping, null, 2)
  );
  
  console.log('\n✅ URL mapping saved to cloudflare-urls.json');
  
  return urlMapping;
}

// Step 2: Create placeholder images (until we have real ones)
function createPlaceholders(urlMapping) {
  console.log('\n🎨 Creating placeholder images...\n');
  
  // Create SVG placeholders for each module
  Object.keys(urlMapping).forEach(moduleName => {
    const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="#333"/>
      <text x="50%" y="50%" font-family="Arial" font-size="18" fill="#FFD700" text-anchor="middle" dy=".3em">
        ${moduleName.replace('-', ' ').toUpperCase()}
      </text>
    </svg>`;
    
    const filename = `${urlMapping[moduleName].hash}_${moduleName}.svg`;
    fs.writeFileSync(path.join(CONFIG.OUTPUT_DIR, filename), svg);
    console.log(`✓ Created ${filename}`);
  });
}

// Step 3: Generate R2 upload commands
function generateUploadCommands(urlMapping) {
  console.log('\n📝 Generating R2 upload commands...\n');
  
  const commands = [];
  
  // Wrangler commands for R2
  Object.keys(urlMapping).forEach(moduleName => {
    const hash = urlMapping[moduleName].hash;
    const filename = `${hash}_${moduleName}`;
    
    commands.push(`wrangler r2 object put ${CONFIG.R2_BUCKET}/modules/${filename}.webp --file=${CONFIG.OUTPUT_DIR}/${filename}.svg`);
    commands.push(`wrangler r2 object put ${CONFIG.R2_BUCKET}/previews/${filename}.jpg --file=${CONFIG.OUTPUT_DIR}/${filename}.svg`);
  });
  
  // Save commands to file
  const script = `#!/bin/bash
# Cloudflare R2 Upload Script
# Run this after logging in with: wrangler login

echo "Uploading to Cloudflare R2..."

${commands.join('\n')}

echo "✅ Upload complete!"
`;
  
  fs.writeFileSync('./upload-to-r2.sh', script);
  fs.chmodSync('./upload-to-r2.sh', '755');
  
  console.log('✅ Upload script saved to upload-to-r2.sh');
}

// Step 4: Update HTML files with new URLs
function updateHTMLFiles(urlMapping) {
  console.log('\n🔄 Updating HTML files with Cloudflare URLs...\n');
  
  const htmlFiles = [
    'frontend/starters.html',
    'frontend/collection.html',
    'frontend/landing.html',
    'frontend/my-modules.html',
    'frontend/my-gear.html'
  ];
  
  htmlFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updates = 0;
      
      // Replace Supabase URLs
      content = content.replace(
        /https:\/\/jqxshcyqxhbmvqrrthxy\.supabase\.co\/storage\/v1\/object\/public\/[^"']+/g,
        (match) => {
          // Try to extract module name from URL
          const moduleMatch = match.match(/\/([^\/]+)\.(webp|gif|jpg|png)/);
          if (moduleMatch) {
            const moduleName = moduleMatch[1].toLowerCase().replace(/\s+/g, '-');
            if (urlMapping[moduleName]) {
              updates++;
              return urlMapping[moduleName].animated;
            }
          }
          return match;
        }
      );
      
      // Replace local webp references
      content = content.replace(
        /src="webp\/([^"]+)\.webp"/g,
        (match, moduleName) => {
          const cleanName = moduleName.toLowerCase().replace(/\s+/g, '-');
          if (urlMapping[cleanName]) {
            updates++;
            return `src="${urlMapping[cleanName].animated}"`;
          }
          return match;
        }
      );
      
      if (updates > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Updated ${path.basename(filePath)} (${updates} URLs)`);
      }
    }
  });
}

// Step 5: Create optimized loading script
function createOptimizedLoader() {
  console.log('\n⚡ Creating optimized image loader...\n');
  
  const loaderScript = `// Optimized Image Loading for EurorackGrid
// Preloads images and uses Cloudflare's edge caching

class FastModuleLoader {
  constructor() {
    this.preloadedImages = new Map();
    this.urlMapping = ${JSON.stringify(require('./cloudflare-urls.json'), null, 2)};
  }

  // Preload images for smooth animations
  preloadModule(moduleName) {
    if (this.preloadedImages.has(moduleName)) return;
    
    const urls = this.urlMapping[moduleName];
    if (!urls) return;
    
    const img = new Image();
    img.src = urls.animated;
    this.preloadedImages.set(moduleName, img);
  }

  // Get optimized URL based on context
  getModuleUrl(moduleName, options = {}) {
    const urls = this.urlMapping[moduleName];
    if (!urls) return '/placeholder.svg';
    
    const { width = 300, preview = false, owned = false } = options;
    
    if (!owned || preview) {
      return urls.preview;
    }
    
    // Use Cloudflare Transform for perfect size
    return urls.animated.replace('width=300', \`width=\${width}\`);
  }

  // Preload all modules in view
  preloadRack(moduleList) {
    moduleList.forEach(module => this.preloadModule(module));
  }

  // Initialize on page load
  init() {
    // Preload visible modules
    document.querySelectorAll('[data-module]').forEach(element => {
      const moduleName = element.dataset.module;
      this.preloadModule(moduleName);
      
      // Update src with optimized URL
      if (element.tagName === 'IMG') {
        element.src = this.getModuleUrl(moduleName, {
          width: element.width || 300,
          owned: element.classList.contains('owned')
        });
      }
    });
    
    // Add intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const module = entry.target.dataset.module;
          if (module) this.preloadModule(module);
        }
      });
    });
    
    document.querySelectorAll('[data-module]').forEach(el => {
      observer.observe(el);
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.moduleLoader = new FastModuleLoader();
  window.moduleLoader.init();
});
`;
  
  fs.writeFileSync('./frontend/fast-loader.js', loaderScript);
  console.log('✅ Created fast-loader.js');
}

// Run all steps
async function setup() {
  try {
    const urlMapping = prepareModules();
    createPlaceholders(urlMapping);
    generateUploadCommands(urlMapping);
    updateHTMLFiles(urlMapping);
    createOptimizedLoader();
    
    console.log(`
========================================
✅ CLOUDFLARE SETUP COMPLETE!
========================================

NEXT STEPS:

1. SIGN UP FOR CLOUDFLARE R2:
   https://dash.cloudflare.com/sign-up/r2
   
2. CREATE R2 BUCKET:
   - Name: eurorackgrid
   - Region: Auto
   - Enable public access

3. INSTALL WRANGLER:
   npm install -g wrangler
   wrangler login

4. UPLOAD YOUR MODULES:
   ./upload-to-r2.sh

5. TEST THE URLS:
   Check cloudflare-urls.json for your URLs

Your images will load SUPER FAST globally! 🚀
`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the setup
setup();