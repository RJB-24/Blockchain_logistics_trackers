
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  action: 'analyze_shipment' | 'generate_suggestions';
  shipmentId?: string;
}

interface ShipmentData {
  id: string;
  title: string;
  transport_type: string;
  origin: string;
  destination: string;
  carbon_footprint: number;
  weight: number;
  product_type: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    // Create a Supabase client with the service role key (for admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { action, shipmentId } = await req.json() as AIRequest;
    
    if (action === 'analyze_shipment' && shipmentId) {
      // Get shipment data
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();
      
      if (shipmentError) throw shipmentError;
      
      // Generate AI analysis (this is a simplified mock example)
      const analysis = analyzeSustainability(shipment);
      
      return new Response(
        JSON.stringify({
          success: true,
          analysis,
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    } 
    else if (action === 'generate_suggestions') {
      // Get recent shipments for analysis
      const { data: shipments, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (shipmentsError) throw shipmentsError;
      
      // Generate AI suggestions based on recent shipments
      const suggestions = generateSustainabilitySuggestions(shipments);
      
      // Save suggestions to the database
      const { error: insertError } = await supabase
        .from('ai_suggestions')
        .insert(suggestions);
      
      if (insertError) throw insertError;
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Generated ${suggestions.length} sustainability suggestions`,
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid action or missing parameters",
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});

// Mock function to analyze shipment sustainability
function analyzeSustainability(shipment: ShipmentData) {
  // This is a simplified mock implementation
  // In a real-world application, this would use an actual AI model
  
  const transportEfficiency = {
    'rail': 0.9,
    'ship': 0.7,
    'multi-modal': 0.6,
    'truck': 0.4,
    'air': 0.2
  };
  
  const efficiency = transportEfficiency[shipment.transport_type as keyof typeof transportEfficiency] || 0.5;
  
  // Calculate sustainability score (0-100)
  const sustainabilityScore = Math.round(efficiency * 100);
  
  // Calculate carbon savings potential
  const potentialSavings = calculatePotentialSavings(shipment);
  
  return {
    shipmentId: shipment.id,
    sustainabilityScore,
    analysis: {
      carbonFootprint: shipment.carbon_footprint,
      transportEfficiency: efficiency,
      potentialSavings,
      recommendations: [
        `Consider using ${getMoreSustainableTransport(shipment.transport_type)} for future shipments on similar routes`,
        `Optimize packaging to reduce weight and volume`,
        `Batch shipments to the same destination for improved efficiency`
      ]
    }
  };
}

// Mock function to generate sustainability suggestions
function generateSustainabilitySuggestions(shipments: ShipmentData[]) {
  // This is a simplified mock implementation
  // In a real-world application, this would use an actual AI model
  
  if (!shipments || shipments.length === 0) {
    return [];
  }
  
  const suggestions = [];
  
  // Analyze transport types used
  const transportCounts: Record<string, number> = {};
  shipments.forEach(s => {
    transportCounts[s.transport_type] = (transportCounts[s.transport_type] || 0) + 1;
  });
  
  // Find the most used transport type with a more sustainable alternative
  const mostUsedUnsustainable = Object.entries(transportCounts)
    .filter(([type]) => type === 'air' || type === 'truck')
    .sort(([, countA], [, countB]) => countB - countA)[0];
  
  if (mostUsedUnsustainable) {
    const [transportType, count] = mostUsedUnsustainable;
    const alternative = getMoreSustainableTransport(transportType);
    
    // Calculate average carbon and cost savings
    const relevantShipments = shipments.filter(s => s.transport_type === transportType);
    const avgCarbonFootprint = relevantShipments.reduce((sum, s) => sum + s.carbon_footprint, 0) / relevantShipments.length;
    const potentialCarbonSavings = avgCarbonFootprint * 0.4; // Assume 40% savings
    const potentialCostSavings = relevantShipments.reduce((sum, s) => sum + (s.weight * 2), 0) / relevantShipments.length;
    
    suggestions.push({
      title: `Switch from ${transportType} to ${alternative} transport where possible`,
      description: `You've used ${transportType} transport for ${count} recent shipments. Switching to ${alternative} could significantly reduce carbon emissions and potentially lower shipping costs, especially for non-urgent deliveries.`,
      carbon_savings: potentialCarbonSavings,
      cost_savings: potentialCostSavings,
      implemented: false
    });
  }
  
  // Look for common routes to suggest consolidation
  const routes: Record<string, number> = {};
  shipments.forEach(s => {
    const route = `${s.origin} → ${s.destination}`;
    routes[route] = (routes[route] || 0) + 1;
  });
  
  const commonRoutes = Object.entries(routes)
    .filter(([, count]) => count > 1)
    .sort(([, countA], [, countB]) => countB - countA);
  
  if (commonRoutes.length > 0) {
    const [routeName, count] = commonRoutes[0];
    const [origin, destination] = routeName.split(' → ');
    
    const routeShipments = shipments.filter(s => s.origin === origin && s.destination === destination);
    const totalCarbon = routeShipments.reduce((sum, s) => sum + s.carbon_footprint, 0);
    const avgWeight = routeShipments.reduce((sum, s) => sum + (s.weight || 0), 0) / routeShipments.length;
    
    suggestions.push({
      title: `Consolidate shipments on the ${routeName} route`,
      description: `You've made ${count} separate shipments on the ${routeName} route. Consolidating these into fewer, larger shipments could reduce carbon emissions by up to 30% and save on per-shipment handling costs.`,
      carbon_savings: totalCarbon * 0.3, // Assume 30% savings
      cost_savings: avgWeight * count * 0.4, // Simplified cost calculation
      implemented: false
    });
  }
  
  // Suggest packaging optimization
  if (shipments.some(s => s.weight > 50)) {
    suggestions.push({
      title: "Optimize packaging for heavy shipments",
      description: "Several of your heavier shipments could benefit from lightweight, eco-friendly packaging alternatives. This can reduce both shipping weight and environmental impact from packaging materials.",
      carbon_savings: 15.2, // Example value
      cost_savings: 120.5, // Example value
      implemented: false
    });
  }
  
  return suggestions;
}

// Helper to calculate potential carbon savings
function calculatePotentialSavings(shipment: ShipmentData) {
  // Simplified savings calculation
  switch (shipment.transport_type) {
    case 'air':
      return shipment.carbon_footprint * 0.7; // Can save up to 70% by switching from air
    case 'truck':
      return shipment.carbon_footprint * 0.5; // Can save up to 50% by switching from truck
    case 'multi-modal':
      return shipment.carbon_footprint * 0.2; // Can save up to 20% by optimizing multi-modal
    case 'ship':
      return shipment.carbon_footprint * 0.1; // Can save up to 10% by optimizing ship transport
    case 'rail':
      return shipment.carbon_footprint * 0.05; // Can save up to 5% by optimizing rail
    default:
      return shipment.carbon_footprint * 0.2;
  }
}

// Helper to suggest more sustainable transport options
function getMoreSustainableTransport(currentType: string): string {
  switch (currentType) {
    case 'air':
      return 'rail or ship';
    case 'truck':
      return 'rail';
    case 'multi-modal':
      return 'rail-focused multi-modal';
    case 'ship':
      return 'rail where applicable';
    default:
      return 'rail';
  }
}
