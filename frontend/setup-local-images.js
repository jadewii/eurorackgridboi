// Script to create placeholder module images for local testing
// This creates simple colored gradient images as placeholders

const fs = require('fs');
const path = require('path');

// Create directories
const dirs = [
  'modules/static',
  'modules/animated',
  'modules/thumbnails'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Generate SVG placeholder modules with different colors
const colors = [
  ['#667eea', '#764ba2'], // Purple gradient
  ['#f093fb', '#f5576c'], // Pink gradient  
  ['#4facfe', '#00f2fe'], // Blue gradient
  ['#43e97b', '#38f9d7'], // Green gradient
  ['#fa709a', '#fee140'], // Sunset gradient
  ['#30cfd0', '#330867'], // Ocean gradient
  ['#a8edea', '#fed6e3'], // Pastel gradient
  ['#ff9a9e', '#fecfef'], // Rose gradient
  ['#fbc2eb', '#a6c1ee'], // Lavender gradient
  ['#fdcbf1', '#e6dee9'], // Light pink
  ['#a1c4fd', '#c2e9fb'], // Sky blue
  ['#d299c2', '#fef9d7'], // Orchid
  ['#667eea', '#764ba2'], // Purple (repeat for more)
  ['#f093fb', '#f5576c'], // Pink (repeat)
  ['#4facfe', '#00f2fe'], // Blue (repeat)
  ['#43e97b', '#38f9d7'], // Green (repeat)
  ['#fa709a', '#fee140'], // Sunset (repeat)
];

// Module names for better placeholders
const moduleNames = [
  'OSCILLATOR', 'FILTER', 'VCA', 'ENVELOPE', 'LFO', 'MIXER',
  'SEQUENCER', 'DELAY', 'REVERB', 'DISTORTION', 'SAMPLER', 'QUANTIZER',
  'CLOCK', 'RANDOM', 'LOGIC', 'WAVEFOLDER', 'PHASER', 'COMPRESSOR',
  'VOCODER', 'GRANULAR', 'RESONATOR', 'CHORUS', 'FLANGER', 'BITCRUSH',
  'RINGMOD', 'CROSSFADER', 'PANNER', 'TREMOLO', 'GATE', 'TRIGGER',
  'MULTIPLIER', 'ATTENUATOR', 'INVERTER', 'SLEW', 'S&H', 'NOISE'
];

// Generate static module SVGs
console.log('🎨 Creating placeholder module images...\n');

for (let i = 1; i <= 36; i++) {
  const num = i.toString().padStart(2, '0');
  const colorIndex = (i - 1) % colors.length;
  const [color1, color2] = colors[colorIndex];
  const moduleName = moduleNames[i - 1] || `MODULE ${i}`;
  
  const svg = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Module background -->
  <rect width="300" height="400" fill="url(#grad${i})" />
  
  <!-- Panel screws -->
  <circle cx="20" cy="20" r="8" fill="#333" />
  <circle cx="280" cy="20" r="8" fill="#333" />
  <circle cx="20" cy="380" r="8" fill="#333" />
  <circle cx="280" cy="380" r="8" fill="#333" />
  
  <!-- Module name -->
  <text x="150" y="50" font-family="monospace" font-size="20" font-weight="bold" fill="white" text-anchor="middle">
    ${moduleName}
  </text>
  
  <!-- Knobs -->
  <circle cx="75" cy="120" r="25" fill="#222" stroke="white" stroke-width="2"/>
  <line x1="75" y1="120" x2="75" y2="100" stroke="white" stroke-width="2"/>
  
  <circle cx="150" cy="120" r="25" fill="#222" stroke="white" stroke-width="2"/>
  <line x1="150" y1="120" x2="150" y2="100" stroke="white" stroke-width="2"/>
  
  <circle cx="225" cy="120" r="25" fill="#222" stroke="white" stroke-width="2"/>
  <line x1="225" y1="120" x2="225" y2="100" stroke="white" stroke-width="2"/>
  
  <!-- Jacks -->
  <circle cx="75" cy="200" r="15" fill="#111" stroke="#888" stroke-width="2"/>
  <circle cx="150" cy="200" r="15" fill="#111" stroke="#888" stroke-width="2"/>
  <circle cx="225" cy="200" r="15" fill="#111" stroke="#888" stroke-width="2"/>
  
  <circle cx="75" cy="250" r="15" fill="#111" stroke="#888" stroke-width="2"/>
  <circle cx="150" cy="250" r="15" fill="#111" stroke="#888" stroke-width="2"/>
  <circle cx="225" cy="250" r="15" fill="#111" stroke="#888" stroke-width="2"/>
  
  <!-- LEDs -->
  <circle cx="75" cy="320" r="8" fill="#0f0" opacity="0.8"/>
  <circle cx="150" cy="320" r="8" fill="#f00" opacity="0.8"/>
  <circle cx="225" cy="320" r="8" fill="#00f" opacity="0.8"/>
  
  <!-- Module ID -->
  <text x="150" y="370" font-family="monospace" font-size="14" fill="white" text-anchor="middle" opacity="0.5">
    #${num}
  </text>
</svg>`;
  
  const filePath = path.join(__dirname, 'modules', 'static', `${num}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`✅ Created module ${num}: ${moduleName}`);
}

// Create HTML file that uses local images
const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Local Module Test</title>
    <style>
        body {
            font-family: monospace;
            padding: 20px;
            background: #f5f5f5;
        }
        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
        }
        .module {
            background: white;
            border: 2px solid #000;
            padding: 10px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .module:hover {
            transform: scale(1.05);
        }
        .module img {
            width: 100%;
            height: auto;
        }
    </style>
</head>
<body>
    <h1>Local Module Gallery</h1>
    <div class="module-grid" id="moduleGrid"></div>
    
    <script>
        const grid = document.getElementById('moduleGrid');
        for (let i = 1; i <= 36; i++) {
            const num = i.toString().padStart(2, '0');
            const div = document.createElement('div');
            div.className = 'module';
            div.innerHTML = \`
                <img src="modules/static/\${num}.svg" alt="Module \${num}">
                <div style="text-align: center; margin-top: 5px;">Module \${num}</div>
            \`;
            grid.appendChild(div);
        }
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'test-local-modules.html'), testHtml);

console.log('\n✅ Created 36 placeholder modules!');
console.log('📁 Location: frontend/modules/static/');
console.log('🧪 Test page: frontend/test-local-modules.html');
console.log('\n🎯 Next steps:');
console.log('1. These SVG modules will work immediately (no hosting needed)');
console.log('2. Update image-config.js to use local paths');
console.log('3. Test with: open test-local-modules.html');