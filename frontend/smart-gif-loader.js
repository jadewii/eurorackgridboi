// Smart GIF Loader - Shows static preview, animates entire pack on card hover
document.addEventListener('DOMContentLoaded', function() {
    // Process each pack card
    const packCards = document.querySelectorAll('.pack-card');
    
    packCards.forEach(card => {
        // Find all GIF elements within this card
        const gifElements = card.querySelectorAll('.module-icon.live, [style*="eurorackgif"]');
        
        if (gifElements.length === 0) return; // Skip if no GIFs in this card
        
        // Process each GIF element
        gifElements.forEach(element => {
            let gifUrl = '';
            if (element.style.backgroundImage) {
                gifUrl = element.style.backgroundImage.match(/url\(['"]?([^'")]+)/)[1];
            } else {
                const style = element.getAttribute('style');
                if (style) {
                    const match = style.match(/url\(['"]?([^'")]+)/);
                    if (match) gifUrl = match[1];
                }
            }
            
            if (gifUrl && gifUrl.includes('.gif')) {
                // Extract the number from the GIF URL
                const gifNumber = gifUrl.match(/(\d+)\.gif/);
                if (gifNumber) {
                    const staticUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/eurorackart/${gifNumber[1]}.png`;
                    
                    // Initially show static PNG
                    element.style.backgroundImage = `url('${staticUrl}')`;
                    element.dataset.static = staticUrl;
                    element.dataset.animated = gifUrl;
                }
            }
        });
        
        // Add hover effect to the ENTIRE CARD
        card.addEventListener('mouseenter', function() {
            // Animate ALL modules in this card
            const modules = this.querySelectorAll('[data-animated]');
            modules.forEach(module => {
                module.style.backgroundImage = `url('${module.dataset.animated}')`;
            });
        });
        
        card.addEventListener('mouseleave', function() {
            // Stop animating ALL modules in this card
            const modules = this.querySelectorAll('[data-static]');
            modules.forEach(module => {
                module.style.backgroundImage = `url('${module.dataset.static}')`;
            });
        });
    });
    
    console.log('✅ Smart GIF loading enabled - hover over cards to animate entire packs!');
});