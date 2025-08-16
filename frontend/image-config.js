// EUROGRID Image Configuration
// Centralized image URL management for easy switching between dev/prod

const IMAGE_CONFIG = {
  // Development - Local SVG modules
  dev: {
    base: '', // Using relative paths for local files
    modules: {
      static: 'modules/static/',
      animated: 'modules/static/', // Using static for now
      webp: 'modules/static/',
      powered: 'modules/static/'
    }
  },
  
  // Production - Cloudflare R2
  prod: {
    base: 'https://pub-52e1e6cdc34a48efaf40dffb5e812617.r2.dev/', // Your R2 public URL
    modules: {
      static: '', // Files are at root level
      animated: '', 
      webp: '',
      powered: ''
    }
  }
};

// Environment flag - change to 'prod' when R2 is ready
const IMAGE_ENV = 'prod';

// Export the current configuration
const IMG_CONFIG = IMAGE_CONFIG[IMAGE_ENV];

/**
 * Get the URL for a module image
 * @param {string} moduleId - The module ID (e.g., '01', '02')
 * @param {string} type - Image type: 'static', 'animated', 'webp', or 'powered'
 * @param {object} options - Optional parameters for optimization
 * @returns {string} The complete image URL
 */
function getModuleImageUrl(moduleId, type = 'static', options = {}) {
  const folder = IMG_CONFIG.modules[type];
  
  // Determine file extension based on type
  let extension = '.webp'; // Using WebP files from R2
  
  // Build base URL
  let url = `${IMG_CONFIG.base}${folder}${moduleId}${extension}`;
  
  // Add optimization parameters for Cloudflare R2
  if (IMAGE_ENV === 'prod' && options.size) {
    const sizeParams = {
      thumb: 'width=150,quality=80,format=auto',
      small: 'width=200,quality=85,format=auto',
      medium: 'width=400,quality=90,format=auto',
      large: 'width=800,quality=95,format=auto'
    };
    
    if (sizeParams[options.size]) {
      url += `?${sizeParams[options.size]}`;
    }
  }
  
  // Add Supabase optimization parameters for dev
  if (IMAGE_ENV === 'dev' && options.size && type === 'animated') {
    const sizeParams = {
      thumb: 'width=100&quality=60',
      small: 'width=200&quality=70',
      medium: 'width=400&quality=80'
    };
    
    if (sizeParams[options.size]) {
      url += `?${sizeParams[options.size]}`;
    }
  }
  
  return url;
}

/**
 * Get rack image URL
 * @param {string} rackId - The rack ID
 * @returns {string} The rack image URL
 */
function getRackImageUrl(rackId) {
  const base = IMAGE_ENV === 'dev' 
    ? IMG_CONFIG.base + 'racks/'
    : IMG_CONFIG.base + 'racks/';
  return `${base}${rackId}.png`;
}

/**
 * Preload critical images for better performance
 * @param {Array} moduleIds - Array of module IDs to preload
 */
function preloadModuleImages(moduleIds) {
  moduleIds.forEach(id => {
    const img = new Image();
    img.src = getModuleImageUrl(id, 'static', { size: 'thumb' });
  });
}

/**
 * Create an optimized image element with lazy loading
 * @param {string} moduleId - The module ID
 * @param {string} type - Image type
 * @param {object} options - Additional options
 * @returns {HTMLImageElement} The image element
 */
function createModuleImage(moduleId, type = 'static', options = {}) {
  const img = document.createElement('img');
  img.src = getModuleImageUrl(moduleId, type, options);
  img.loading = 'lazy';
  img.alt = `Module ${moduleId}`;
  
  // Add error handling
  img.onerror = function() {
    console.error(`Failed to load image for module ${moduleId}`);
    // Fallback to placeholder
    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSI+TW9kdWxlPC90ZXh0Pjwvc3ZnPg==';
  };
  
  return img;
}

// Make functions available globally
window.EuroGridImages = {
  getModuleImageUrl,
  getRackImageUrl,
  preloadModuleImages,
  createModuleImage,
  config: IMG_CONFIG,
  env: IMAGE_ENV
};

console.log(`📸 Image configuration loaded (${IMAGE_ENV} mode)`);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getModuleImageUrl,
    getRackImageUrl,
    preloadModuleImages,
    createModuleImage,
    IMG_CONFIG,
    IMAGE_ENV
  };
}