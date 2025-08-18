/**
 * Cloudflare Worker for gated media access
 * Handles plant image delivery with ownership verification
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Only handle /api/media-url routes
    if (!url.pathname.startsWith('/api/media-url')) {
      return new Response('Not Found', { status: 404 });
    }

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Update with your domain in production
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Get parameters
      const plantId = url.searchParams.get('plant_id');
      const kind = url.searchParams.get('kind') || 'preview';
      
      if (!plantId) {
        return new Response('Missing plant_id', { status: 400, headers: corsHeaders });
      }

      // Get user from Clerk JWT (simplified for now)
      const authorization = request.headers.get('Authorization');
      let userId = null;
      
      if (authorization && authorization.startsWith('Bearer ')) {
        // TODO: Verify Clerk JWT and extract user_id
        // For now, we'll use a placeholder
        userId = await verifyClerkJWT(authorization.substring(7), env);
      }

      // Get plant data from D1
      const plantData = await env.DB.prepare(
        'SELECT preview_key, orig_key FROM plants WHERE id = ?'
      ).bind(plantId).first();
      
      if (!plantData) {
        return new Response('Plant not found', { status: 404, headers: corsHeaders });
      }

      // Handle preview requests (always public)
      if (kind === 'preview') {
        // Map plant ID to existing image format (plant-001.webp, plant-002.webp, etc.)
        const imageNumber = plantId.replace('p', '').padStart(3, '0');
        const previewUrl = `${env.PUBLIC_BUCKET_URL}/plant-${imageNumber}.webp`;
        return Response.json({ url: previewUrl }, { headers: corsHeaders });
      }

      // Handle original requests (requires ownership)
      if (kind === 'orig') {
        // Check if user is authenticated
        if (!userId) {
          return new Response('Authentication required', { status: 401, headers: corsHeaders });
        }

        // Check ownership
        const ownership = await env.DB.prepare(
          'SELECT 1 FROM user_plants WHERE user_id = ? AND plant_id = ? LIMIT 1'
        ).bind(userId, plantId).first();
        
        if (!ownership) {
          return new Response('Access denied - you do not own this plant', { status: 403, headers: corsHeaders });
        }

        // Get original from R2 (private bucket)
        const object = await env.R2.get(plantData.orig_key);
        
        if (!object) {
          return new Response('Original file not found', { status: 404, headers: corsHeaders });
        }

        // Stream the original image
        return new Response(object.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Content-Length': object.size,
          }
        });
      }

      return new Response('Invalid kind parameter', { status: 400, headers: corsHeaders });
      
    } catch (error) {
      console.error('Error in media-access worker:', error);
      return new Response('Internal server error', { status: 500, headers: corsHeaders });
    }
  }
};

/**
 * Verify Clerk JWT and extract user_id
 * TODO: Implement actual Clerk verification
 */
async function verifyClerkJWT(token, env) {
  // This is a placeholder - implement actual Clerk JWT verification
  // You'll need to:
  // 1. Decode the JWT
  // 2. Verify signature with Clerk's public key
  // 3. Check expiration
  // 4. Extract user_id from claims
  
  // For testing, return a mock user_id
  return 'user_123'; 
}