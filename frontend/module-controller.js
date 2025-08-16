// Module Animation Controller
// Controls whether modules animate or show static based on license

document.addEventListener('DOMContentLoaded', function() {
    
    // Create a static version of WebP by extracting first frame
    function createStaticImage(moduleElement) {
        const moduleName = moduleElement.getAttribute('data-module');
        if (!moduleName) return;
        
        // Create an off-screen video element to decode WebP
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS
        
        img.onload = function() {
            // Create canvas to capture the first frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            
            // Draw the image (first frame) to canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert to data URL and set as background
            try {
                const staticDataUrl = canvas.toDataURL('image/png');
                
                // Remove the ::after pseudo-element background by overriding with inline style
                const style = document.createElement('style');
                style.textContent = `
                    .module-slot[data-module="${moduleName}"]::after {
                        background-image: url('${staticDataUrl}') !important;
                    }
                `;
                document.head.appendChild(style);
                
                // Add visual indicator that it's static
                moduleElement.classList.add('static-applied');
                
            } catch (e) {
                console.error('Failed to create static image for', moduleName, e);
                // Fallback: just apply grayscale filter
                moduleElement.style.filter = 'grayscale(100%) brightness(0.8)';
            }
        };
        
        img.onerror = function() {
            console.error('Failed to load image for', moduleName);
        };
        
        // Load the WebP image
        const baseUrl = 'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/';
        img.src = baseUrl + encodeURIComponent(moduleName) + '.webp';
    }
    
    // Process all static modules
    const staticModules = document.querySelectorAll('.module-slot.static');
    console.log('Found', staticModules.length, 'static modules to process');
    
    staticModules.forEach((module, index) => {
        // Stagger the processing to avoid overwhelming the browser
        setTimeout(() => {
            createStaticImage(module);
        }, index * 50); // 50ms delay between each
    });
    
    // For powered modules, ensure they have the animated style
    const poweredModules = document.querySelectorAll('.module-slot.powered');
    poweredModules.forEach(module => {
        const moduleName = module.getAttribute('data-module');
        if (!moduleName) return;
        
        // Add visual indicators for powered modules
        module.classList.add('animated-active');
        
        // Add a subtle animation indicator
        const indicator = document.createElement('div');
        indicator.className = 'animation-indicator';
        indicator.innerHTML = '⚡';
        indicator.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 255, 0, 0.9);
            color: black;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
            z-index: 10;
            animation: pulse 2s infinite;
        `;
        module.appendChild(indicator);
    });
    
    // Add pulse animation for indicators
    if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.1); }
            }
            
            .module-slot.static-applied {
                position: relative;
            }
            
            .module-slot.static-applied::before {
                content: '🔒';
                position: absolute;
                top: 5px;
                left: 5px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                z-index: 10;
            }
            
            .module-slot.animated-active {
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Simulate user license data
    const userLicenses = {
        'Function Synthesizer': 'pro',
        'Honduh': 'basic',
        'Physical Modeler': 'pro',
        'Mangler and Tangler': 'basic',
        'Complex Oscillator': 'pro',
        'Cephalopod': 'basic',
        'Altered Black': 'pro',
        '00': 'basic'
    };
    
    // Apply license-based styling
    document.querySelectorAll('.module-slot').forEach(module => {
        const moduleName = module.getAttribute('data-module');
        const license = userLicenses[moduleName];
        
        if (license === 'pro' && !module.classList.contains('powered')) {
            // User owns pro but module is set to static - show upgrade available
            const upgradeBtn = document.createElement('div');
            upgradeBtn.className = 'upgrade-to-animated';
            upgradeBtn.innerHTML = '✨ Activate Animation';
            upgradeBtn.style.cssText = `
                position: absolute;
                bottom: 5px;
                right: 5px;
                background: linear-gradient(45deg, #ffd700, #ff8800);
                color: black;
                padding: 3px 8px;
                border-radius: 3px;
                font-size: 10px;
                cursor: pointer;
                z-index: 10;
                font-weight: bold;
            `;
            upgradeBtn.onclick = function() {
                module.classList.remove('static');
                module.classList.add('powered');
                location.reload(); // Reload to apply changes
            };
            module.appendChild(upgradeBtn);
            
        } else if (license === 'basic' && module.classList.contains('powered')) {
            // User only has basic but trying to use powered - downgrade to static
            module.classList.remove('powered');
            module.classList.add('static');
            createStaticImage(module);
            
            // Show upgrade prompt
            const upgradeBtn = document.createElement('div');
            upgradeBtn.className = 'upgrade-button';
            upgradeBtn.innerHTML = '⬆️ Upgrade $3';
            upgradeBtn.style.cssText = `
                position: absolute;
                bottom: 5px;
                left: 5px;
                background: #ff8800;
                color: white;
                padding: 3px 8px;
                border-radius: 3px;
                font-size: 10px;
                cursor: pointer;
                z-index: 10;
            `;
            upgradeBtn.title = 'Upgrade to Pro for animations';
            upgradeBtn.onclick = function() {
                if (confirm('Upgrade to Pro for $3?\n\nUnlock:\n• Animated WebP\n• Remove grayscale filter\n• Pro badge')) {
                    alert('✅ Upgraded! Reload to see animations.');
                    location.reload();
                }
            };
            module.appendChild(upgradeBtn);
        }
    });
    
    // Debug: Log module states
    console.log('Module Controller initialized');
    console.log('Static modules:', staticModules.length);
    console.log('Powered modules:', poweredModules.length);
});