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
    
    // Get user
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
    
    // Start transaction logic
    // 1. Check module availability and price
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
    
    // 2. Check or create user balance
    let { data: balance, error: balanceError } = await supabaseClient
      .from('user_balance')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // If user has no balance record, create one with 0 HP
    if (balanceError || !balance) {
      const { data: newBalance, error: createError } = await supabaseClient
        .from('user_balance')
        .insert({
          user_id: user.id,
          hp_balance: 0,
          total_spent: 0
        })
        .select()
        .single()
      
      if (createError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create balance' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      balance = newBalance
    }
    
    if (balance.hp_balance < module.hp_cost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient HP',
          required: module.hp_cost,
          current: balance.hp_balance
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // 3. Check if already owned
    const { data: existing } = await supabaseClient
      .from('user_modules')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', module_id)
    
    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Already owned' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // 4. Check supply limits if applicable
    if (module.max_supply && module.current_supply >= module.max_supply) {
      return new Response(
        JSON.stringify({ error: 'Module sold out' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // 5. Process purchase
    // Deduct HP
    const { error: updateBalanceError } = await supabaseClient
      .from('user_balance')
      .update({ 
        hp_balance: balance.hp_balance - module.hp_cost,
        total_spent: balance.total_spent + module.hp_cost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
    
    if (updateBalanceError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Add module to user's collection
    const { error: insertError } = await supabaseClient
      .from('user_modules')
      .insert({
        user_id: user.id,
        module_id: module_id,
        purchase_price: module.hp_cost
      })
    
    if (insertError) {
      // Rollback balance update
      await supabaseClient
        .from('user_balance')
        .update({ 
          hp_balance: balance.hp_balance,
          total_spent: balance.total_spent
        })
        .eq('user_id', user.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to add module to collection' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Update supply if limited
    if (module.max_supply) {
      await supabaseClient
        .from('modules')
        .update({ 
          current_supply: module.current_supply + 1 
        })
        .eq('id', module_id)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Module purchased successfully',
        new_balance: balance.hp_balance - module.hp_cost
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