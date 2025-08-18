/**
 * Direct Plant Image Loader - Uses existing R2 public bucket
 * No authentication needed since all images are already public
 */

const R2_BASE_URL = 'https://pub-003b43d100f94cca9fe8e5371e24ae6d.r2.dev';

/**
 * Get plant image URL directly from R2
 * @param {string} plantId - Plant ID (p1, p2, etc.)
 * @returns {string} Direct image URL
 */
function getPlantImageDirect(plantId) {
  // Map plant ID to existing image format (plant-001.webp, plant-002.webp, etc.)
  const imageNumber = plantId.replace('p', '').padStart(3, '0');
  return `${R2_BASE_URL}/plant-${imageNumber}.webp`;
}

/**
 * Load image into an img element
 * @param {HTMLImageElement} imgElement - Image element to update
 * @param {string} plantId - Plant ID
 */
async function loadPlantImageDirect(imgElement, plantId) {
  // Show loading state
  imgElement.classList.add('loading');
  
  const imageUrl = getPlantImageDirect(plantId);
  
  // Create new image to preload
  const img = new Image();
  img.onload = () => {
    imgElement.src = imageUrl;
    imgElement.classList.remove('loading');
    imgElement.classList.add('loaded');
  };
  img.onerror = () => {
    console.error(`Failed to load image for ${plantId}`);
    imgElement.classList.remove('loading');
    imgElement.classList.add('error');
    // Show placeholder
    imgElement.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="100" text-anchor="middle" fill="#999" font-size="20">Plant</text>
      </svg>
    `);
  };
  img.src = imageUrl;
}

/**
 * Batch load multiple plant images
 * @param {Array} plants - Array of {element, plantId}
 */
async function batchLoadPlantImagesDirect(plants) {
  const promises = plants.map(({ element, plantId }) => 
    loadPlantImageDirect(element, plantId)
  );
  
  await Promise.all(promises);
}

// Export functions for use in other scripts
window.PlantImages = {
  getPlantImage: getPlantImageDirect,
  loadPlantImage: loadPlantImageDirect,
  batchLoadPlantImages: batchLoadPlantImagesDirect
};