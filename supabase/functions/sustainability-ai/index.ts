
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Respond to CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

// AI-generated recommendations based on shipment data (simulated)
const generateRecommendations = async (shipmentData: any, userId: string) => {
  // In a real application, this would call an AI service like OpenAI
  // For now, we'll return mock recommendations
  
  // Create a Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Calculate carbon and cost savings based on transport type
  const transportType = shipmentData.transport_type;
  const distance = Math.random() * 1000 + 500; // Mock distance in km
  
  let recommendations = [];
  
  if (transportType === 'air') {
    // Recommendation to switch from air to rail
    const carbonSavings = shipmentData.carbon_footprint * 0.7; // 70% reduction
    const costSavings = Math.round(distance * 2.5); // $2.5 per km saved
    
    recommendations.push({
      title: "Switch to rail transport",
      description: "Switching from air freight to rail can reduce carbon emissions by up to 70% for your route.",
      carbon_savings: carbonSavings,
      cost_savings: costSavings,
      shipment_id: shipmentData.id,
      user_id: userId,
    });
  } else if (transportType === 'truck') {
    // Recommendation for truck route optimization
    const carbonSavings = shipmentData.carbon_footprint * 0.25; // 25% reduction
    const costSavings = Math.round(distance * 0.8); // $0.8 per km saved
    
    recommendations.push({
      title: "Optimize truck routes",
      description: "Optimizing truck routes can save up to 25% in fuel consumption and emissions.",
      carbon_savings: carbonSavings,
      cost_savings: costSavings,
      shipment_id: shipmentData.id,
      user_id: userId,
    });
    
    // Recommendation for truck consolidation
    const carbonSavings2 = shipmentData.carbon_footprint * 0.3; // 30% reduction
    const costSavings2 = Math.round(distance * 1.2); // $1.2 per km saved
    
    recommendations.push({
      title: "Consolidate shipments",
      description: "Combining multiple shipments into fewer trucks can reduce emissions and costs.",
      carbon_savings: carbonSavings2,
      cost_savings: costSavings2,
      shipment_id: shipmentData.id,
      user_id: userId,
    });
  }
  
  // Add a general recommendation regardless of transport type
  recommendations.push({
    title: "Use eco-friendly packaging",
    description: "Switching to biodegradable packaging can reduce your environmental impact.",
    carbon_savings: Math.round(shipmentData.carbon_footprint * 0.1),
    cost_savings: null,
    shipment_id: shipmentData.id,
    user_id: userId,
  });
  
  // Save the recommendations to the database
  for (const recommendation of recommendations) {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .insert(recommendation);
      
      if (error) {
        console.error("Error saving recommendation:", error);
      }
    } catch (err) {
      console.error("Failed to save recommendation:", err);
    }
  }
  
  return recommendations;
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Check request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    // Parse request body
    const body = await req.json();
    
    // Validate input
    if (!body.shipmentId || !body.userId) {
      return new Response(JSON.stringify({ error: "Shipment ID and user ID are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Create a Supabase client to fetch the shipment data
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the shipment data
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', body.shipmentId)
      .single();
    
    if (shipmentError) {
      return new Response(JSON.stringify({ error: "Shipment not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }
    
    // Generate recommendations based on the shipment data
    const recommendations = await generateRecommendations(shipmentData, body.userId);
    
    return new Response(JSON.stringify({ success: true, recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
