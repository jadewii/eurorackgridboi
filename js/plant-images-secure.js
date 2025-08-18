/**
 * Secure Plant Image Loader
 * - Loads images through Worker API
 * - Adds watermark overlay for previews
 * - Requests full quality for owned plants
 */

const API_ENDPOINT = '/api/plant-image';

// Cache for loaded images
const imageCache = new Map();

/**
 * Get auth token (implement based on your auth system)
 */
function getAuthToken() {
  // TODO: Get from your auth system (Clerk, Auth0, etc.)
  return localStorage.getItem('auth_token') || '';
}

/**
 * Create watermark overlay
 */
function createWatermarkCanvas(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw image
  ctx.drawImage(img, 0, 0);
  
  // Add watermark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Diagonal watermark pattern
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  
  const text = 'JAMNUTZ PREVIEW';
  for (let y = -canvas.height; y < canvas.height * 2; y += 60) {
    for (let x = -canvas.width; x < canvas.width * 2; x += 200) {
      ctx.fillText(text, x, y);
    }
  }
  ctx.restore();
  
  return canvas.toDataURL('image/webp');
}

/**
 * Load plant image through secure API
 * @param {string} plantId - Plant ID (p1, p2, etc.)
 * @param {boolean} isOwned - Whether user owns this plant
 * @returns {Promise<string>} Image URL or data URL
 */
async function loadPlantImageSecure(plantId, isOwned = false) {
  const quality = isOwned ? 'full' : 'preview';
  const cacheKey = `${plantId}-${quality}`;
  
  // Check cache
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_ENDPOINT}?plant_id=${plantId}&quality=${quality}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status}`);
    }
    
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    // Check if we need to add watermark
    const needsWatermark = response.headers.get('X-Image-Quality') === 'preview';
    
    if (needsWatermark) {
      // Load image and add watermark
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const watermarkedUrl = createWatermarkCanvas(img);
          imageCache.set(cacheKey, watermarkedUrl);
          URL.revokeObjectURL(objectUrl); // Clean up
          resolve(watermarkedUrl);
        };
        img.src = objectUrl;
      });
    } else {
      // Full quality - use as is
      imageCache.set(cacheKey, objectUrl);
      return objectUrl;
    }
    
  } catch (error) {
    console.error(`Error loading plant ${plantId}:`, error);
    // Return placeholder
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="100" text-anchor="middle" fill="#999" font-size="20">No Access</text>
      </svg>
    `);
  }
}

/**
 * Update image element with secure loading
 * @param {HTMLImageElement} imgElement - Image element to update
 * @param {string} plantId - Plant ID
 * @param {boolean} isOwned - Whether user owns this plant
 */
async function updatePlantImage(imgElement, plantId, isOwned = false) {
  imgElement.classList.add('loading');
  
  try {
    const imageUrl = await loadPlantImageSecure(plantId, isOwned);
    
    imgElement.src = imageUrl;
    imgElement.classList.remove('loading');
    imgElement.classList.add('loaded');
    
    // Add visual indicator for owned vs preview
    if (isOwned) {
      imgElement.classList.add('owned');
      imgElement.title = 'Full Quality - You own this plant';
    } else {
      imgElement.classList.add('preview');
      imgElement.title = 'Preview Quality - Purchase to unlock full quality';
    }
    
  } catch (error) {
    console.error('Failed to update image:', error);
    imgElement.classList.remove('loading');
    imgElement.classList.add('error');
  }
}

/**
 * Batch load multiple plant images
 * @param {Array} plants - Array of {element, plantId, isOwned}
 */
async function batchLoadSecure(plants) {
  const promises = plants.map(({ element, plantId, isOwned }) => 
    updatePlantImage(element, plantId, isOwned)
  );
  
  await Promise.all(promises);
}

// Export for use in other scripts
window.PlantImagesSecure = {
  loadImage: loadPlantImageSecure,
  updateImage: updatePlantImage,
  batchLoad: batchLoadSecure,
  setAuthToken: (token) => localStorage.setItem('auth_token', token)
};