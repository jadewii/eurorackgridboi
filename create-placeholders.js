#!/usr/bin/env node

// Create placeholder module images for testing
const fs = require('fs');
const path = require('path');

// Create modules directory
const modulesDir = path.join(__dirname, 'frontend', 'modules');
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
}

// Module list from your HTML
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

// Colors for variety
const colors = [
  '#FF1493', '#00CED1', '#FFD700', '#FF4500',
  '#9370DB', '#32CD32', '#FF69B4', '#4169E1',
  '#DC143C', '#00FF00', '#FF00FF', '#FFA500'
];

console.log('🎨 Creating placeholder module images...\n');

modules.forEach((module, index) => {
  const color = colors[index % colors.length];
  const displayName = module.replace(/-/g, ' ').toUpperCase();
  
  // Create SVG placeholder
  const svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#grad${index})"/>
  <rect x="10" y="10" width="280" height="280" fill="none" stroke="#FFD700" stroke-width="2"/>
  <text x="50%" y="45%" font-family="monospace" font-size="20" fill="#FFD700" text-anchor="middle" font-weight="bold">
    ${displayName}
  </text>
  <text x="50%" y="55%" font-family="monospace" font-size="14" fill="#FFD700" text-anchor="middle">
    MODULE
  </text>
  <circle cx="30" cy="30" r="5" fill="#FFD700"/>
  <circle cx="270" cy="30" r="5" fill="#FFD700"/>
  <circle cx="30" cy="270" r="5" fill="#FFD700"/>
  <circle cx="270" cy="270" r="5" fill="#FFD700"/>
</svg>`;

  // Save as SVG (can convert to WebP later)
  const filename = `${module}.svg`;
  const filepath = path.join(modulesDir, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Created: ${filename}`);
});

// Create a test HTML file
const testHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Module Test - Local Images</title>
    <style>
        body {
            background: #000;
            color: #FFD700;
            font-family: monospace;
            padding: 20px;
        }
        .rack {
            display: grid;
            grid-template-columns: repeat(4, 150px);
            gap: 10px;
            background: #222;
            padding: 20px;
            border: 3px solid #666;
            width: fit-content;
            margin: 20px auto;
        }
        .module {
            width: 150px;
            height: 150px;
            background: #333;
            border: 1px solid #555;
        }
        .module img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        h1 {
            text-align: center;
        }
        .load-status {
            text-align: center;
            margin: 20px;
            padding: 20px;
            background: #111;
            border: 1px solid #FFD700;
        }
    </style>
</head>
<body>
    <h1>🎛️ EURORACKGRID - Local Module Test</h1>
    
    <div class="load-status">
        <p>Images loading from: <strong>/frontend/modules/</strong></p>
        <p>Load time: <span id="loadTime">Calculating...</span></p>
    </div>
    
    <div class="rack">
        ${modules.map(m => `
        <div class="module">
            <img src="modules/${m}.svg" alt="${m}" onload="imageLoaded()">
        </div>`).join('')}
    </div>
    
    <script>
        let loadedCount = 0;
        const startTime = performance.now();
        const totalImages = ${modules.length};
        
        function imageLoaded() {
            loadedCount++;
            if (loadedCount === totalImages) {
                const loadTime = performance.now() - startTime;
                document.getElementById('loadTime').innerHTML = 
                    '<strong style="color: #00FF00;">' + Math.round(loadTime) + 'ms</strong> - FAST! ⚡';
            }
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'frontend', 'test-local-images.html'), testHTML);

console.log('\n✅ Created test page: frontend/test-local-images.html');

// Also create jacknut icon placeholder
const jacknutSVG = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="#FFD700" stroke="#000" stroke-width="3"/>
  <circle cx="50" cy="50" r="30" fill="none" stroke="#000" stroke-width="3"/>
  <circle cx="50" cy="50" r="15" fill="#000"/>
</svg>`;

fs.writeFileSync(path.join(modulesDir, 'jacknut.svg'), jacknutSVG);

console.log('✅ Created jacknut icon placeholder\n');

console.log(`
========================================
✅ PLACEHOLDER IMAGES CREATED!
========================================

TEST LOCALLY:
1. cd /Users/jade/eurogrid/frontend
2. python3 -m http.server 8000
3. Open: http://localhost:8000/test-local-images.html

The images are in: frontend/modules/
- 12 module placeholders
- 1 jacknut icon
- All as SVG (tiny file size)
- Ready to test!

These will load INSTANTLY because they're local!
Once you're happy, we can upload to Cloudflare R2.
`);