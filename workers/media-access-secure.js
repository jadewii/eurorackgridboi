/**
 * Secure Cloudflare Worker for Plant and Seed Images
 * - Serves plant images from eurorackgridplants bucket
 * - Serves seed images from seeds bucket (for UI decoration only)
 * - All images stored privately in R2
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle both plant and seed image routes
    const isPlantRoute = url.pathname.startsWith('/api/plant-image');
    const isSeedRoute = url.pathname.startsWith('/api/seed-image');
    
    if (!isPlantRoute && !isSeedRoute) {
      return new Response('Not Found', { status: 404 });
    }

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Update with your domain
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Handle seed images (simpler - just serve them)
      if (isSeedRoute) {
        const seedId = url.searchParams.get('seed_id');
        
        if (!seedId) {
          return new Response('Missing seed_id', { status: 400, headers: corsHeaders });
        }

        // Handle new format: seed-001, seed-002, seed-003 or just the filename
        let imageKey = seedId;
        
        // Try different extensions
        const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
        let object = null;
        let contentType = 'image/webp';
        
        // Remove any existing extension
        imageKey = imageKey.replace(/\.(webp|png|jpg|jpeg)$/i, '');
        
        // Try each extension
        for (const ext of extensions) {
          const keyToTry = `${imageKey}${ext}`;
          console.log('Attempting to fetch seed:', keyToTry);
          
          // Try with just the filename first
          object = await env.SEEDS_R2.get(keyToTry);
          
          // If not found, try with bucket prefix
          if (!object) {
            const altKey = `eurorackgridseeds/${keyToTry}`;
            console.log('Trying alternative key:', altKey);
            object = await env.SEEDS_R2.get(altKey);
          }
          
          if (object) {
            // Set correct content type based on extension
            if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else contentType = 'image/webp';
            break;
          }
        }
        
        if (!object) {
          return new Response('Seed image not found', { status: 404, headers: corsHeaders });
        }

        // Return seed image (these are just for UI decoration)
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // Cache for 1 day
          }
        });
      }

      // Handle plant images (existing logic)
      const plantId = url.searchParams.get('plant_id');
      const quality = url.searchParams.get('quality') || 'preview'; // preview or full
      
      if (!plantId) {
        return new Response('Missing plant_id', { status: 400, headers: corsHeaders });
      }

      // Map plant ID to image number (p1 -> 001, p2 -> 002, etc.)
      const imageNumber = plantId.replace('p', '').padStart(3, '0');
      const imageKey = `plant-${imageNumber}.webp`;

      // Get user from Authorization header (if provided)
      const authorization = request.headers.get('Authorization');
      let userId = null;
      
      if (authorization && authorization.startsWith('Bearer ')) {
        userId = await verifyAuthToken(authorization.substring(7), env);
      }

      // Check if user owns this plant (if requesting full quality)
      let hasOwnership = false;
      if (userId && quality === 'full') {
        const ownership = await env.DB.prepare(
          'SELECT 1 FROM user_plants WHERE user_id = ? AND plant_id = ? LIMIT 1'
        ).bind(userId, plantId).first();
        hasOwnership = !!ownership;
      }

      // Determine which version to serve
      if (quality === 'full' && !hasOwnership) {
        return new Response('Access denied - ownership required for full quality', { 
          status: 403, 
          headers: corsHeaders 
        });
      }

      // Get image from plants R2 bucket (keep existing bucket name)
      const object = await env.R2.get(imageKey);
      
      if (!object) {
        return new Response('Image not found', { status: 404, headers: corsHeaders });
      }

      // For preview quality, add watermark/reduce quality
      if (quality === 'preview') {
        // Option 1: Return lower quality version
        // For now, return with cache headers indicating it's a preview
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'X-Image-Quality': 'preview',
            'X-Watermark': 'JAMNUTZ PREVIEW' // Client can overlay watermark
          }
        });
      }

      // Full quality for verified owners
      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'image/webp',
          'Cache-Control': 'private, max-age=86400', // Cache for 1 day
          'X-Image-Quality': 'full',
        }
      });
      
    } catch (error) {
      console.error('Error in secure media worker:', error);
      return new Response('Internal server error', { status: 500, headers: corsHeaders });
    }
  }
};

/**
 * Verify authentication token
 * TODO: Implement actual verification (Clerk, Auth0, etc.)
 */
async function verifyAuthToken(token, env) {
  // Placeholder - implement your auth verification
  // For testing, accept specific test tokens
  if (token === 'test-user-123') {
    return 'user_123';
  }
  return null;
}