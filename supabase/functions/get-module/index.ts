import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { module_id } = await req.json()
    
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Check if user owns this module
    const { data: ownership, error: ownershipError } = await supabaseClient
      .from('user_modules')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', module_id)
      .single()
    
    if (ownershipError || !ownership) {
      return new Response(
        JSON.stringify({ error: 'Module not owned' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Get module details
    const { data: module, error: moduleError } = await supabaseClient
      .from('modules')
      .select('*')
      .eq('id', module_id)
      .single()
    
    if (moduleError || !module) {
      return new Response(
        JSON.stringify({ error: 'Module not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabaseClient
      .storage
      .from(module.bucket_name)
      .createSignedUrl(module.file_path, 3600)
    
    if (urlError || !signedUrlData) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate URL' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        url: signedUrlData.signedURL,
        module: module 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})