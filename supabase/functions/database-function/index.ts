
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Define CORS headers
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
    // Create a Supabase client
    const supabaseClient = createClient(
      // Get the Supabase URL and service_role_key from environment variables
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the request body
    const requestData = await req.json()

    // Extract function name and parameters
    const { function: funcName, ...params } = requestData

    // Based on the function name, call the appropriate RPC
    let result
    
    switch (funcName) {
      case 'get_all_routes':
        result = await supabaseClient.rpc('get_all_routes')
        break
        
      case 'get_route_by_id':
        result = await supabaseClient.rpc('get_route_by_id', { 
          route_id: params.route_id 
        })
        break
        
      case 'update_route':
        result = await supabaseClient.rpc('update_route', { 
          p_id: params.p_id,
          p_points: params.p_points,
          p_segments: params.p_segments,
          p_total_distance: params.p_total_distance,
          p_total_duration: params.p_total_duration,
          p_total_carbon_footprint: params.p_total_carbon_footprint,
          p_total_fuel_consumption: params.p_total_fuel_consumption,
          p_is_optimized: params.p_is_optimized,
          p_optimized_at: params.p_optimized_at
        })
        break
        
      case 'create_route':
        result = await supabaseClient.rpc('create_route', { 
          p_name: params.p_name,
          p_points: params.p_points,
          p_segments: params.p_segments,
          p_total_distance: params.p_total_distance,
          p_total_duration: params.p_total_duration,
          p_total_carbon_footprint: params.p_total_carbon_footprint,
          p_total_fuel_consumption: params.p_total_fuel_consumption,
          p_transport_types: params.p_transport_types,
          p_is_optimized: params.p_is_optimized,
          p_optimized_at: params.p_optimized_at
        })
        break
        
      default:
        throw new Error(`Unknown function: ${funcName}`)
    }

    // Handle database error
    if (result.error) {
      console.error(`Database function error: ${result.error.message}`)
      throw new Error(result.error.message)
    }

    // Return the result
    return new Response(
      JSON.stringify(result.data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error(`Error in database-function: ${error.message}`)
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
