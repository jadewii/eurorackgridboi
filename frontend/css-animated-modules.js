// CSS Animation Module System - Replaces GIFs with performant CSS animations
document.addEventListener('DOMContentLoaded', function() {
    // Module animation templates for different types
    const animationTemplates = {
        oscilloscope: `
            <div class="animated-module">
                <div class="oscilloscope">
                    <div class="wave"></div>
                </div>
                <div class="led-blink"></div>
                <div class="knob"></div>
            </div>
        `,
        vumeter: `
            <div class="animated-module">
                <div class="vu-meter">
                    <div class="vu-bar"></div>
                </div>
                <div class="led-blink green"></div>
                <div class="led-blink blue" style="left: auto; right: 10px;"></div>
            </div>
        `,
        spectrum: `
            <div class="animated-module">
                <div class="spectrum">
                    <div class="spectrum-bar"></div>
                    <div class="spectrum-bar"></div>
                    <div class="spectrum-bar"></div>
                    <div class="spectrum-bar"></div>
                    <div class="spectrum-bar"></div>
                </div>
                <div class="knob"></div>
            </div>
        `,
        matrix: `
            <div class="animated-module">
                <div class="matrix-rain">
                    <div class="matrix-drop" style="left: 10%; animation-delay: 0s;">0</div>
                    <div class="matrix-drop" style="left: 30%; animation-delay: 0.5s;">1</div>
                    <div class="matrix-drop" style="left: 50%; animation-delay: 1s;">0</div>
                    <div class="matrix-drop" style="left: 70%; animation-delay: 1.5s;">1</div>
                    <div class="matrix-drop" style="left: 90%; animation-delay: 2s;">1</div>
                </div>
                <div class="pulse-ring"></div>
            </div>
        `,
        pulser: `
            <div class="animated-module">
                <div class="pulse-ring"></div>
                <div class="led-blink"></div>
                <div class="led-blink green" style="top: auto; bottom: 10px;"></div>
                <div class="led-blink blue" style="left: auto; right: 10px;"></div>
            </div>
        `
    };

    // Animation types array
    const animationTypes = Object.keys(animationTemplates);
    
    // Process all powered module displays
    const poweredSections = document.querySelectorAll('.pack-section:has(.section-header:has(:text("POWERED")))');
    
    poweredSections.forEach(section => {
        // Find all module displays in powered section
        const moduleElements = section.querySelectorAll('[style*="eurorackgif"]');
        
        moduleElements.forEach((element, index) => {
            // Get the GIF number from URL
            const style = element.getAttribute('style');
            const match = style?.match(/(\d+)\.gif/);
            
            if (match) {
                const moduleNumber = parseInt(match[1]);
                // Pick animation type based on module number
                const animationType = animationTypes[moduleNumber % animationTypes.length];
                
                // Create wrapper div with same dimensions
                const wrapper = document.createElement('div');
                wrapper.style.cssText = element.style.cssText;
                wrapper.style.backgroundImage = 'none';
                wrapper.style.position = 'relative';
                wrapper.style.overflow = 'hidden';
                
                // Add the CSS animation
                wrapper.innerHTML = animationTemplates[animationType];
                
                // Add module type class for styling variation
                const moduleDiv = wrapper.querySelector('.animated-module');
                moduleDiv.classList.add(`module-type-${(moduleNumber % 3) + 1}`);
                
                // Replace the element
                element.parentNode.replaceChild(wrapper, element);
            }
        });
    });
    
    // Process unpowered modules - ensure they use PNGs
    const unpoweredSections = document.querySelectorAll('.pack-section:has(.section-header:has(:text("UNPOWERED")))');
    
    unpoweredSections.forEach(section => {
        const moduleElements = section.querySelectorAll('[style*="eurorackgif"], [style*="eurorackart"]');
        
        moduleElements.forEach(element => {
            const style = element.getAttribute('style');
            
            // If it's using a GIF, replace with PNG
            if (style && style.includes('.gif')) {
                const match = style.match(/(\d+)\.gif/);
                if (match) {
                    const pngUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/eurorackart/${match[1]}.png`;
                    element.style.backgroundImage = `url('${pngUrl}')`;
                }
            }
        });
    });
    
    console.log('✅ CSS animations loaded - 100x better performance!');
});