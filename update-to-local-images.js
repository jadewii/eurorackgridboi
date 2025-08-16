#!/usr/bin/env node

// Update HTML files to use local placeholder images
const fs = require('fs');
const path = require('path');

console.log('🔄 Updating HTML files to use local images...\n');

// Files to update
const files = [
  'frontend/starters.html',
  'frontend/landing.html',
  'frontend/collection.html',
  'frontend/my-modules.html',
  'frontend/vibe-shop.html'
];

// Module name mapping
const moduleMapping = {
  'Function Synthesizer': 'function-synthesizer',
  'Honduh': 'honduh',
  'Andersons': 'andersons',
  'Varigated': 'varigated',
  'BAI': 'bai',
  'Cephalopod Rose': 'cephalopod-rose',
  'Physical Modeler': 'physical-modeler',
  'Voltaged Gray': 'voltaged-gray',
  'Complex Oscillator': 'complex-oscillator',
  'textural Synthesizer': 'textural-synthesizer',
  'Mangler and Tangler': 'mangler-tangler',
  'Altered Black': 'altered-black',
  'Cephalopod': 'cephalopod-rose'
};

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let updates = 0;
    
    // Replace Supabase URLs with local ones
    content = content.replace(
      /https:\/\/jqxshcyqxhbmvqrrthxy\.supabase\.co\/storage\/v1\/object\/public\/[^"']+\.(webp|gif|jpg|png)/g,
      (match) => {
        // Extract module name from the URL or context
        for (const [displayName, fileName] of Object.entries(moduleMapping)) {
          if (match.toLowerCase().includes(displayName.toLowerCase().replace(/ /g, '-')) ||
              match.toLowerCase().includes(fileName)) {
            updates++;
            return `modules/${fileName}.svg`;
          }
        }
        
        // Handle jacknut icon
        if (match.includes('jacknut')) {
          updates++;
          return 'modules/jacknut.svg';
        }
        
        return match; // Keep original if no match
      }
    );
    
    // Also update Cloudflare R2 URLs back to local
    content = content.replace(
      /https:\/\/eurorackgrid\.r2\.dev\/[^"']+\.(webp|jpg)/g,
      (match) => {
        for (const [displayName, fileName] of Object.entries(moduleMapping)) {
          if (match.includes(fileName)) {
            updates++;
            return `modules/${fileName}.svg`;
          }
        }
        return match;
      }
    );
    
    if (updates > 0) {
      // Create backup
      const backupPath = filePath + '.backup-' + Date.now();
      fs.copyFileSync(filePath, backupPath);
      
      // Write updated file
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${path.basename(filePath)}: ${updates} images now local`);
      console.log(`   Backup saved to: ${path.basename(backupPath)}`);
    }
  }
});

console.log(`
========================================
✅ HTML FILES UPDATED!
========================================

Your images now load from: /frontend/modules/

To test:
1. Open any HTML file directly in your browser
2. Or use a local server:
   cd frontend
   python3 -m http.server 9999
   
Then open: http://localhost:9999

The images will load INSTANTLY because they're local SVG files!

When ready for production:
1. Upload real images to Cloudflare R2
2. Update URLs to point to R2
3. Deploy to Netlify
`);