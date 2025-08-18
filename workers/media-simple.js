/**
 * Simple Secure Worker for Private R2 Images
 * Serves images from private R2 bucket
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Only handle /api/plant-image routes
    if (!url.pathname.startsWith('/api/plant-image')) {
      return new Response('Not Found', { status: 404 });
    }

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Get plant ID from query
      const plantId = url.searchParams.get('plant_id');
      
      if (!plantId) {
        return new Response('Missing plant_id', { status: 400, headers: corsHeaders });
      }

      // Map plant ID to image filename
      // p1 -> plant-001.webp, p2 -> plant-002.webp, etc.
      const imageNumber = plantId.replace('p', '').padStart(3, '0');
      const imageKey = `plant-${imageNumber}.webp`;

      console.log(`Fetching image: ${imageKey} from R2`);

      // Get image from private R2 bucket
      const object = await env.R2.get(imageKey);
      
      if (!object) {
        console.error(`Image not found in R2: ${imageKey}`);
        return new Response(`Image not found: ${imageKey}`, { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Return the image with appropriate headers
      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=3600',
        }
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};