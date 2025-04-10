
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoutePoint {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'origin' | 'destination' | 'waypoint';
  estimatedTime?: string;
  status?: 'current' | 'upcoming' | 'completed';
}

interface RouteParams {
  routeId?: string;
  origins?: RoutePoint[];
  destinations?: RoutePoint[];
  preferredModes?: string[];
  optimizationCriteria?: 'time' | 'cost' | 'carbon';
  transportTypes?: string[];
  points?: RoutePoint[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    const { action, routeParams, routeId, shipmentId } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Sustainability AI function called with action: ${action}`);
    
    switch (action) {
      case 'optimize_route':
        return await optimizeRoute(routeParams, supabase);
        
      case 'analyze_shipment':
        return await analyzeShipment(routeId || shipmentId, supabase);
        
      case 'generate_suggestions':
        return await generateSuggestions(shipmentId, supabase);
        
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid action specified",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function optimizeRoute(params: RouteParams, supabase: any): Promise<Response> {
  console.log(`Optimizing route with parameters:`, params);
  
  try {
    // For simulation, we'll create a mock optimized route
    // In a real implementation, this would use AI/ML models for route optimization
    
    const distance = Math.random() * 200 + 50; // Random distance between 50-250km
    const totalDuration = distance * 1.5; // Rough estimate of minutes
    
    const emissions = {
      truck: 62, // g CO2 per ton-km
      ship: 8,
      rail: 22,
      air: 602
    };
    
    const fuelRates = {
      truck: 0.35, // L per km
      ship: 0.01,
      rail: 0.05,
      air: 2.8
    };
    
    // Determine main transport type
    const transportType = params.preferredModes?.[0] || params.transportTypes?.[0] || 'truck';
    
    // Calculate carbon footprint (kg CO2)
    const carbonFootprint = (distance * (emissions[transportType as keyof typeof emissions] || emissions.truck)) / 1000;
    
    // Calculate fuel consumption (L)
    const fuelConsumption = distance * (fuelRates[transportType as keyof typeof fuelRates] || fuelRates.truck);
    
    // Generate optimized route
    const optimizedRoute = {
      points: params.points || params.origins?.concat(params.destinations || []) || [],
      segments: generateMockRouteSegments(params, distance, totalDuration, carbonFootprint, fuelConsumption),
      totalDistance: distance,
      totalDuration: totalDuration,
      totalCarbonFootprint: carbonFootprint,
      totalFuelConsumption: fuelConsumption
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        optimizedRoute,
        message: "Route optimized successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error optimizing route:', error);
    throw error;
  }
}

function generateMockRouteSegments(params: RouteParams, distance: number, duration: number, carbonFootprint: number, fuelConsumption: number) {
  const segments = [];
  const points = params.points || [];
  const origins = params.origins || [];
  const destinations = params.destinations || [];
  const allPoints = points.length > 0 ? points : [...origins, ...(destinations || [])];
  
  // If we have less than 2 points, we can't create segments
  if (allPoints.length < 2) {
    return [];
  }
  
  // Create segments between consecutive points
  for (let i = 0; i < allPoints.length - 1; i++) {
    const segmentDistance = distance / (allPoints.length - 1);
    const segmentDuration = duration / (allPoints.length - 1);
    const segmentCarbonFootprint = carbonFootprint / (allPoints.length - 1);
    const segmentFuelConsumption = fuelConsumption / (allPoints.length - 1);
    
    segments.push({
      origin: {
        id: allPoints[i].id,
        name: allPoints[i].name
      },
      destination: {
        id: allPoints[i + 1].id,
        name: allPoints[i + 1].name
      },
      distance: segmentDistance,
      duration: segmentDuration,
      mode: params.preferredModes?.[0] || params.transportTypes?.[0] || 'truck',
      carbonFootprint: segmentCarbonFootprint,
      fuelConsumption: segmentFuelConsumption
    });
  }
  
  return segments;
}

async function analyzeShipment(id: string, supabase: any): Promise<Response> {
  console.log(`Analyzing sustainability for shipment/route ${id}`);
  
  try {
    // Get the shipment or route data
    let carbonFootprint = 0;
    let distance = 0;
    let duration = 0;
    let transportType = 'truck';
    
    // Try to fetch as a route first
    let { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (route) {
      carbonFootprint = route.total_carbon_footprint;
      distance = route.total_distance;
      duration = route.total_duration;
      transportType = route.transport_types?.[0] || 'truck';
    } else {
      // If not a route, try as a shipment
      let { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', id)
        .single();
        
      if (shipment) {
        carbonFootprint = shipment.carbon_footprint;
        transportType = shipment.transport_type;
        // Estimate distance based on carbon footprint
        distance = transportType === 'air' ? carbonFootprint * 1.66 : 
                  transportType === 'ship' ? carbonFootprint * 125 : 
                  transportType === 'rail' ? carbonFootprint * 45 : 
                  carbonFootprint * 16; // truck
      }
    }
    
    // Generate analysis and recommendations
    const baselineCarbonFootprint = calculateBaselineFootprint(distance, transportType);
    const carbonSaved = baselineCarbonFootprint - carbonFootprint;
    
    // Generate sustainability score (0-100)
    const sustainabilityScore = Math.min(100, Math.max(0, 
      Math.round(100 - (carbonFootprint / baselineCarbonFootprint) * 100)
    ));
    
    // Calculate fuel saved compared to baseline
    const baselineFuel = calculateBaselineFuel(distance, transportType);
    const actualFuel = carbonFootprint / baselineCarbonFootprint * baselineFuel;
    const fuelSaved = baselineFuel - actualFuel;
    
    // Calculate time saved compared to baseline (if route optimized)
    const baselineTime = distance * 1.8; // rough estimate in minutes
    const timeSaved = baselineTime - duration;
    
    // Generate recommendations
    const recommendations = generateRecommendations(carbonFootprint, transportType, distance);
    
    // Insert analysis into database for future reference
    if (recommendations.length > 0) {
      for (const rec of recommendations) {
        await supabase
          .from('ai_suggestions')
          .insert({
            shipment_id: id,
            title: rec.title,
            description: rec.description,
            carbon_savings: rec.potential_savings?.carbon || 0,
            cost_savings: rec.potential_savings?.cost || 0
          })
          .select();
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          carbonFootprint,
          baselineFootprint: baselineCarbonFootprint,
          carbonSaved,
          fuelSaved,
          timeSaved,
          sustainabilityScore,
          recommendations: recommendations.map(r => ({
            title: r.title,
            description: r.description,
            potentialSavings: r.potential_savings
          }))
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error analyzing shipment:', error);
    throw error;
  }
}

function calculateBaselineFootprint(distance: number, transportType: string): number {
  const emissionFactors = {
    truck: 62, // g CO2 per ton-km
    ship: 8,
    rail: 22,
    air: 602
  };
  
  // Calculate baseline emissions using the least efficient method 
  // for that transport category (higher emission factor)
  const factor = transportType === 'air' ? emissionFactors.air * 1.2 : 
                transportType === 'ship' ? emissionFactors.ship * 1.5 : 
                transportType === 'rail' ? emissionFactors.rail * 1.3 : 
                emissionFactors.truck * 1.25;
  
  return (distance * factor) / 1000; // Convert to kg
}

function calculateBaselineFuel(distance: number, transportType: string): number {
  const fuelRates = {
    truck: 0.35, // L per km
    ship: 0.01,
    rail: 0.05,
    air: 2.8
  };
  
  // Calculate baseline fuel using the least efficient rate
  // for that transport category (higher fuel rate)
  const rate = transportType === 'air' ? fuelRates.air * 1.2 : 
               transportType === 'ship' ? fuelRates.ship * 1.5 : 
               transportType === 'rail' ? fuelRates.rail * 1.3 : 
               fuelRates.truck * 1.25;
  
  return distance * rate;
}

function generateRecommendations(carbonFootprint: number, transportType: string, distance: number) {
  const recommendations = [];
  
  // Common recommendations
  recommendations.push({
    title: "Optimize Loading Capacity",
    description: "Ensure vehicles are loaded to optimal capacity to reduce the number of trips required.",
    potential_savings: {
      carbon: Math.round(carbonFootprint * 0.15),
      cost: Math.round(distance * 0.18)
    }
  });
  
  // Transportation mode-specific recommendations
  if (transportType === 'truck') {
    recommendations.push({
      title: "Switch to Electric Vehicles",
      description: "Consider transitioning to electric trucks for shorter routes to reduce emissions.",
      potential_savings: {
        carbon: Math.round(carbonFootprint * 0.7),
        cost: Math.round(distance * 0.2)
      }
    });
    
    recommendations.push({
      title: "Aerodynamic Improvements",
      description: "Install aerodynamic devices on trucks to reduce fuel consumption.",
      potential_savings: {
        carbon: Math.round(carbonFootprint * 0.08),
        cost: Math.round(distance * 0.1)
      }
    });
  } 
  else if (transportType === 'air') {
    recommendations.push({
      title: "Consider Alternative Transport",
      description: "For non-urgent shipments, consider rail or sea transport to dramatically reduce emissions.",
      potential_savings: {
        carbon: Math.round(carbonFootprint * 0.85),
        cost: Math.round(distance * 0.4)
      }
    });
  }
  else if (transportType === 'ship') {
    recommendations.push({
      title: "Slow Steaming",
      description: "Reduce vessel speed by 10% to significantly decrease fuel consumption and emissions.",
      potential_savings: {
        carbon: Math.round(carbonFootprint * 0.3),
        cost: Math.round(distance * 0.25)
      }
    });
  }
  else if (transportType === 'rail') {
    recommendations.push({
      title: "Electrify Rail Routes",
      description: "When possible, choose electrified rail lines over diesel locomotives.",
      potential_savings: {
        carbon: Math.round(carbonFootprint * 0.6),
        cost: Math.round(distance * 0.15)
      }
    });
  }
  
  // General recommendations
  recommendations.push({
    title: "Route Optimization",
    description: "Use AI-powered route optimization to find the most efficient paths.",
    potential_savings: {
      carbon: Math.round(carbonFootprint * 0.12),
      cost: Math.round(distance * 0.15)
    }
  });
  
  return recommendations;
}

async function generateSuggestions(shipmentId: string, supabase: any): Promise<Response> {
  console.log(`Generating sustainability suggestions for shipment ${shipmentId}`);
  
  try {
    // Get shipment data
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
      
    if (shipmentError) throw shipmentError;
    
    if (!shipment) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Shipment not found"
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Generate AI suggestions based on shipment data
    const suggestions = [
      {
        title: "Optimize Loading Patterns",
        description: "Reorganize cargo to maximize space utilization and reduce the number of trips.",
        impact: "Medium",
        potentialSavings: {
          carbon: Math.round(shipment.carbon_footprint * 0.15),
          cost: Math.round(shipment.carbon_footprint * 2.5)
        }
      },
      {
        title: "Alternative Fuel Options",
        description: `Consider switching to biodiesel or renewable fuels for ${shipment.transport_type} transport.`,
        impact: "High",
        potentialSavings: {
          carbon: Math.round(shipment.carbon_footprint * 0.35),
          cost: Math.round(shipment.carbon_footprint * 1.8)
        }
      },
      {
        title: "Off-Peak Delivery Scheduling",
        description: "Schedule deliveries during off-peak hours to avoid traffic congestion.",
        impact: "Low",
        potentialSavings: {
          carbon: Math.round(shipment.carbon_footprint * 0.08),
          cost: Math.round(shipment.carbon_footprint * 1.2)
        }
      }
    ];
    
    // Insert these suggestions into the database
    for (const suggestion of suggestions) {
      await supabase
        .from('ai_suggestions')
        .insert({
          shipment_id: shipmentId,
          title: suggestion.title,
          description: suggestion.description,
          carbon_savings: suggestion.potentialSavings.carbon,
          cost_savings: suggestion.potentialSavings.cost
        });
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        suggestions
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw error;
  }
}
