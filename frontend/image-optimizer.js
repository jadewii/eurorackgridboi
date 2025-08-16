// EUROGRID Image Performance Optimizer
// Add this script to all your HTML files for buttery smooth performance

(function() {
    'use strict';
    
    // Configuration
    const config = {
        lazyLoadOffset: '50px',
        thumbnailSize: 100,
        fullSize: 400,
        enableGifPause: true,
        useWebP: true
    };
    
    // 1. Lazy Load Implementation
    function setupLazyLoading() {
        // Convert all background images to lazy load
        document.querySelectorAll('[style*="background-image"]').forEach(element => {
            const style = element.getAttribute('style');
            const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
            
            if (urlMatch && urlMatch[1]) {
                const originalUrl = urlMatch[1];
                
                // Store original URL and clear background
                element.dataset.bg = originalUrl;
                element.style.backgroundImage = 'none';
                element.style.backgroundColor = '#333'; // Placeholder color
                element.classList.add('lazy-bg');
            }
        });
        
        // Create intersection observer
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const imageUrl = element.dataset.bg;
                    
                    if (imageUrl) {
                        // Load optimized version
                        const optimizedUrl = getOptimizedUrl(imageUrl);
                        element.style.backgroundImage = `url(${optimizedUrl})`;
                        element.classList.add('loaded');
                        imageObserver.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: config.lazyLoadOffset
        });
        
        // Observe all lazy images
        document.querySelectorAll('.lazy-bg').forEach(el => {
            imageObserver.observe(el);
        });
    }
    
    // 2. Optimize Image URLs (add size parameters)
    function getOptimizedUrl(url) {
        // Check if it's a Supabase URL
        if (url.includes('supabase.co')) {
            // Add width parameter for automatic resizing
            const separator = url.includes('?') ? '&' : '?';
            
            // For module icons, use smaller size
            if (url.includes('eurorackart') || url.includes('eurorackgif')) {
                return `${url}${separator}width=${config.fullSize}&quality=85`;
            }
        }
        return url;
    }
    
    // 3. Pause GIFs until interaction
    function setupGifOptimization() {
        if (!config.enableGifPause) return;
        
        // Find all GIF elements
        document.querySelectorAll('.module-icon.live, [style*="eurorackgif"]').forEach(element => {
            // Create a static preview
            const bgImage = window.getComputedStyle(element).backgroundImage;
            if (bgImage && bgImage.includes('.gif')) {
                element.dataset.animated = bgImage;
                element.dataset.playing = 'false';
                
                // Replace with static version initially
                // You could use a PNG thumbnail here instead
                element.style.filter = 'grayscale(50%)';
                
                // Add hover listeners
                element.addEventListener('mouseenter', function() {
                    if (this.dataset.playing === 'false') {
                        this.style.filter = 'none';
                        this.dataset.playing = 'true';
                    }
                });
                
                element.addEventListener('mouseleave', function() {
                    this.style.filter = 'grayscale(50%)';
                    this.dataset.playing = 'false';
                });
            }
        });
    }
    
    // 4. Preload critical images
    function preloadCriticalImages() {
        // Preload first few visible images
        const criticalImages = [
            'https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/icons/jacknut.png',
            // Add other critical images here
        ];
        
        criticalImages.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = getOptimizedUrl(url);
            document.head.appendChild(link);
        });
    }
    
    // 5. Add performance CSS
    function injectPerformanceCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Performance optimizations */
            .lazy-bg {
                transition: opacity 0.3s;
                opacity: 0.8;
            }
            
            .lazy-bg.loaded {
                opacity: 1;
            }
            
            /* Hardware acceleration */
            .pack-card,
            .module-icon,
            .rack-slot {
                transform: translateZ(0);
                will-change: transform;
                backface-visibility: hidden;
            }
            
            /* Optimize animations */
            .module-icon.live {
                animation-play-state: paused;
            }
            
            .pack-card:hover .module-icon.live,
            .module-icon.live:hover {
                animation-play-state: running;
            }
            
            /* Reduce paint areas */
            .pack-preview {
                contain: layout style paint;
            }
            
            /* Optimize image rendering */
            img, 
            [style*="background-image"] {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 6. Monitor and report performance
    function monitorPerformance() {
        if (window.performance && performance.getEntriesByType) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                const paintData = performance.getEntriesByType('paint');
                
                console.log('🚀 EUROGRID Performance Report:');
                console.log(`📊 Page Load Time: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
                
                paintData.forEach(entry => {
                    console.log(`🎨 ${entry.name}: ${Math.round(entry.startTime)}ms`);
                });
                
                // Count images
                const images = document.querySelectorAll('[style*="background-image"], img');
                console.log(`🖼️ Total Images: ${images.length}`);
            });
        }
    }
    
    // Initialize everything when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('🎛️ EUROGRID Image Optimizer Activated');
        
        injectPerformanceCSS();
        preloadCriticalImages();
        setupLazyLoading();
        setupGifOptimization();
        monitorPerformance();
    }
    
    // Expose API for manual control
    window.EUROGRID = window.EUROGRID || {};
    window.EUROGRID.imageOptimizer = {
        reloadImages: setupLazyLoading,
        pauseGifs: () => {
            document.querySelectorAll('[data-playing="true"]').forEach(el => {
                el.dataset.playing = 'false';
                el.style.filter = 'grayscale(50%)';
            });
        },
        getStats: () => {
            const images = document.querySelectorAll('[style*="background-image"], img');
            const loaded = document.querySelectorAll('.loaded').length;
            return {
                total: images.length,
                loaded: loaded,
                pending: images.length - loaded
            };
        }
    };
})();