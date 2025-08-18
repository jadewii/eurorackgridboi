/**
 * Plant Image Handler
 * Manages loading of preview and original images based on ownership
 */

const API_BASE = '/api/media-url';

// Cache for loaded images
const imageCache = new Map();

/**
 * Get plant image URL
 * @param {string} plantId - Plant ID
 * @param {boolean} isOwned - Whether user owns the plant
 * @returns {Promise<string>} Image URL
 */
async function getPlantImage(plantId, isOwned = false) {
  const cacheKey = `${plantId}-${isOwned ? 'orig' : 'preview'}`;
  
  // Check cache first
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  try {
    const kind = isOwned ? 'orig' : 'preview';
    const response = await fetch(`${API_BASE}?plant_id=${plantId}&kind=${kind}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}` // Get from Clerk
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch image for ${plantId}:`, response.status);
      return getPlaceholderImage();
    }

    let imageUrl;
    
    if (kind === 'preview') {
      // Preview returns JSON with URL
      const data = await response.json();
      imageUrl = data.url;
    } else {
      // Original returns the actual image blob
      const blob = await response.blob();
      imageUrl = URL.createObjectURL(blob);
    }

    // Cache the URL
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error(`Error loading image for ${plantId}:`, error);
    return getPlaceholderImage();
  }
}

/**
 * Get auth token from Clerk
 * TODO: Implement actual Clerk integration
 */
function getAuthToken() {
  // This should get the actual JWT from Clerk
  // For now, return empty string for preview-only access
  return localStorage.getItem('clerk_token') || '';
}

/**
 * Get placeholder image for loading/error states
 */
function getPlaceholderImage() {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <text x="100" y="100" text-anchor="middle" fill="#999" font-size="20">Plant</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Load image into an img element
 * @param {HTMLImageElement} imgElement - Image element to update
 * @param {string} plantId - Plant ID
 * @param {boolean} isOwned - Whether user owns the plant
 */
async function loadPlantImage(imgElement, plantId, isOwned = false) {
  // Show loading state
  imgElement.classList.add('loading');
  imgElement.src = getPlaceholderImage();
  
  try {
    const imageUrl = await getPlantImage(plantId, isOwned);
    
    // Create new image to preload
    const img = new Image();
    img.onload = () => {
      imgElement.src = imageUrl;
      imgElement.classList.remove('loading');
      imgElement.classList.add('loaded');
    };
    img.onerror = () => {
      imgElement.src = getPlaceholderImage();
      imgElement.classList.remove('loading');
      imgElement.classList.add('error');
    };
    img.src = imageUrl;
    
  } catch (error) {
    console.error('Failed to load plant image:', error);
    imgElement.src = getPlaceholderImage();
    imgElement.classList.remove('loading');
    imgElement.classList.add('error');
  }
}

/**
 * Batch load multiple plant images
 * @param {Array} plants - Array of {element, plantId, isOwned}
 */
async function batchLoadPlantImages(plants) {
  const promises = plants.map(({ element, plantId, isOwned }) => 
    loadPlantImage(element, plantId, isOwned)
  );
  
  await Promise.all(promises);
}

// Export functions for use in other scripts
window.PlantImages = {
  getPlantImage,
  loadPlantImage,
  batchLoadPlantImages
};