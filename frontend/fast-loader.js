// Optimized Image Loading for EurorackGrid
// Preloads images and uses Cloudflare's edge caching

class FastModuleLoader {
  constructor() {
    this.preloadedImages = new Map();
    this.urlMapping = {
      "function-synthesizer": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/118b2523_function-synthesizer.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/118b2523_function-synthesizer.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/118b2523_function-synthesizer.webp"
      },
      "honduh": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/8cb68a78_honduh.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/8cb68a78_honduh.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/8cb68a78_honduh.webp"
      },
      "andersons": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/4230b967_andersons.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/4230b967_andersons.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/4230b967_andersons.webp"
      },
      "varigated": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/6fd2dbf2_varigated.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/6fd2dbf2_varigated.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/6fd2dbf2_varigated.webp"
      },
      "bai": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/cfbd3e0a_bai.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/cfbd3e0a_bai.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/cfbd3e0a_bai.webp"
      },
      "cephalopod-rose": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/3562316d_cephalopod-rose.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/3562316d_cephalopod-rose.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/3562316d_cephalopod-rose.webp"
      },
      "physical-modeler": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/4c7034c8_physical-modeler.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/4c7034c8_physical-modeler.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/4c7034c8_physical-modeler.webp"
      },
      "voltaged-gray": {
        "preview": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,quality=50,blur=5/previews/e5753518_voltaged-gray.jpg",
        "animated": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=300,format=webp/modules/e5753518_voltaged-gray.webp",
        "thumbnail": "https://eurorackgrid.r2.dev/cdn-cgi/image/width=150,format=webp/modules/e5753518_voltaged-gray.webp"
      }
    };
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
    return urls.animated.replace('width=300', `width=${width}`);
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