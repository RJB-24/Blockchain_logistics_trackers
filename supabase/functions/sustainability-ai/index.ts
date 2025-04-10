
// Edge function for handling sustainability analysis and route optimization

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

interface RouteSegment {
  origin: {
    id: string;
    name: string;
  };
  destination: {
    id: string;
    name: string;
  };
  distance: number; // in km
  duration: number; // in minutes
  mode: 'truck' | 'ship' | 'rail' | 'air';
  carbonFootprint: number; // in kg CO2
  fuelConsumption: number; // in liters
}

interface OptimizedRoute {
  points: RoutePoint[];
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  totalCarbonFootprint: number;
  totalFuelConsumption: number;
}

// Sample transport mode emission factors (g CO2 per ton-km)
const emissionFactors = {
  truck: 62,
  ship: 8,
  rail: 22,
  air: 602
};

// Sample fuel consumption rates (L per km)
const fuelConsumptionRates = {
  truck: 0.35,
  ship: 0.01, // Normalized for comparison
  rail: 0.05,
  air: 2.8
};

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
    
    if (action === 'optimize_route') {
      // This simulates an AI route optimization algorithm
      return await optimizeRoute(routeParams, supabase);
    }
    else if (action === 'analyze_shipment') {
      // This simulates an AI sustainability analysis
      return await analyzeShipment(shipmentId || routeId, supabase);
    }
    else if (action === 'generate_suggestions') {
      // This simulates AI-generated sustainability suggestions
      return await generateSuggestions(shipmentId, supabase);
    }
    
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

async function optimizeRoute(routeParams: any, supabase: any) {
  console.log("Optimizing route with params:", routeParams);

  // If we have an existing route to optimize
  if (routeParams.routeId) {
    const { data: routeData } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeParams.routeId)
      .single();
      
    if (!routeData) {
      throw new Error('Route not found');
    }
    
    const points = routeParams.points || routeData.points;
    const optimized = optimizeRoutePoints(points, routeParams.transportTypes || routeData.transport_types);
    
    return new Response(
      JSON.stringify({
        success: true,
        optimizedRoute: optimized
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } 
  // If creating a new route
  else if (routeParams.origins && routeParams.destinations) {
    const pointsToOptimize = [
      ...routeParams.origins,
      ...routeParams.destinations
    ];
    
    const optimized = optimizeRoutePoints(
      pointsToOptimize, 
      routeParams.preferredModes || ['truck'], 
      routeParams.optimizationCriteria || 'carbon'
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        optimizedRoute: optimized
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  
  throw new Error('Invalid route parameters');
}

function optimizeRoutePoints(
  points: RoutePoint[], 
  transportTypes: string[], 
  optimizationCriteria: 'time' | 'cost' | 'carbon' = 'carbon'
): OptimizedRoute {
  if (!points || points.length < 2) {
    throw new Error('At least two points are required for optimization');
  }
  
  console.log(`Optimizing ${points.length} points with criteria: ${optimizationCriteria}`);
  
  // Sort waypoints to minimize distance (simple greedy algorithm)
  // In a real app, this would use a sophisticated algorithm considering
  // traffic, time windows, vehicle constraints, etc.
  
  const origins = points.filter(p => p.type === 'origin');
  const destinations = points.filter(p => p.type === 'destination');
  let waypoints = points.filter(p => p.type === 'waypoint');
  
  // For demo, we'll just randomize the order of waypoints to simulate optimization
  waypoints = waypoints.sort(() => Math.random() - 0.5);
  
  // Create the optimized route
  const optimizedPoints = [...origins, ...waypoints, ...destinations];
  
  // Generate route segments
  const segments: RouteSegment[] = [];
  let totalDistance = 0;
  let totalDuration = 0;
  let totalCarbonFootprint = 0;
  let totalFuelConsumption = 0;
  
  for (let i = 0; i < optimizedPoints.length - 1; i++) {
    const origin = optimizedPoints[i];
    const destination = optimizedPoints[i + 1];
    
    // In a real app, calculate actual distance between points
    // Here we use a rough approximation based on coordinates
    const distance = calculateDistance(
      origin.coordinates.lat, 
      origin.coordinates.lng, 
      destination.coordinates.lat, 
      destination.coordinates.lng
    );
    
    // Choose transport mode based on preferences and distance
    const mode = chooseTransportMode(distance, transportTypes);
    
    // Calculate duration based on mode and distance
    const duration = calculateDuration(distance, mode);
    
    // Calculate carbon footprint and fuel consumption
    const carbonFootprint = calculateCarbonFootprint(distance, mode);
    const fuelConsumption = calculateFuelConsumption(distance, mode);
    
    segments.push({
      origin: { id: origin.id, name: origin.name },
      destination: { id: destination.id, name: destination.name },
      distance,
      duration,
      mode,
      carbonFootprint,
      fuelConsumption
    });
    
    totalDistance += distance;
    totalDuration += duration;
    totalCarbonFootprint += carbonFootprint;
    totalFuelConsumption += fuelConsumption;
  }
  
  return {
    points: optimizedPoints,
    segments,
    totalDistance,
    totalDuration,
    totalCarbonFootprint,
    totalFuelConsumption
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Simplified distance calculation using Haversine formula
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

function chooseTransportMode(
  distance: number, 
  preferences: string[]
): 'truck' | 'ship' | 'rail' | 'air' {
  // This is a simplistic model to choose transport mode
  // In a real app, this would consider many more factors
  
  const validPreferences = preferences.filter(p => 
    ['truck', 'ship', 'rail', 'air'].includes(p)
  );
  
  if (validPreferences.length === 0) {
    // Default fallback logic based on distance
    if (distance < 100) return 'truck';
    if (distance < 500) return 'rail';
    if (distance < 1000) return 'ship';
    return 'air';
  }
  
  // Choose from preferred modes based on distance
  if (distance < 100 && validPreferences.includes('truck')) return 'truck';
  if (distance < 500 && validPreferences.includes('rail')) return 'rail';
  if (distance < 1000 && validPreferences.includes('ship')) return 'ship';
  if (distance >= 1000 && validPreferences.includes('air')) return 'air';
  
  // If no preferred mode is suitable, use the first preference
  return validPreferences[0] as 'truck' | 'ship' | 'rail' | 'air';
}

function calculateDuration(distance: number, mode: 'truck' | 'ship' | 'rail' | 'air'): number {
  // Average speeds in km/h
  const speeds = {
    truck: 60,
    rail: 80,
    ship: 30,
    air: 800
  };
  
  const speed = speeds[mode];
  const hours = distance / speed;
  
  // Add loading/unloading time based on mode
  const loadingTime = {
    truck: 1,
    rail: 2,
    ship: 6,
    air: 3
  };
  
  return Math.round((hours * 60) + loadingTime[mode]);
}

function calculateCarbonFootprint(distance: number, mode: 'truck' | 'ship' | 'rail' | 'air'): number {
  const emissionFactor = emissionFactors[mode];
  // Calculate emissions in kg of CO2 (assume 10 ton cargo for simplicity)
  return Math.round((distance * emissionFactor * 10) / 1000 * 100) / 100;
}

function calculateFuelConsumption(distance: number, mode: 'truck' | 'ship' | 'rail' | 'air'): number {
  const consumptionRate = fuelConsumptionRates[mode];
  return Math.round(distance * consumptionRate * 100) / 100;
}

async function analyzeShipment(id: string, supabase: any) {
  console.log(`Analyzing sustainability for shipment/route ID: ${id}`);
  
  try {
    // Try to find as route first
    const { data: routeData } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (routeData) {
      // If optimized, compare to pre-optimization metrics
      if (routeData.is_optimized) {
        // Simulate pre-optimization values (in reality these would be stored)
        const originalDistance = routeData.total_distance * 1.2;
        const originalDuration = routeData.total_duration * 1.15;
        const originalCarbonFootprint = routeData.total_carbon_footprint * 1.3;
        const originalFuelConsumption = routeData.total_fuel_consumption * 1.25;
        
        return new Response(
          JSON.stringify({
            success: true,
            analysis: {
              carbonSaved: Math.round((originalCarbonFootprint - routeData.total_carbon_footprint) * 100) / 100,
              fuelSaved: Math.round((originalFuelConsumption - routeData.total_fuel_consumption) * 100) / 100,
              timeSaved: Math.round(originalDuration - routeData.total_duration),
              sustainabilityScore: calculateSustainabilityScore(routeData),
              recommendations: generateRecommendations(routeData)
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        // Not optimized yet, provide potential savings
        return new Response(
          JSON.stringify({
            success: true,
            analysis: {
              carbonSaved: 0,
              fuelSaved: 0,
              timeSaved: 0,
              sustainabilityScore: calculateSustainabilityScore(routeData),
              recommendations: [
                "Optimize this route to reduce carbon emissions and fuel consumption",
                "Consider using rail or ship transport for longer segments",
                "Implement load optimization to maximize cargo space usage"
              ]
            }
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // If not found as route, try as shipment
    const { data: shipmentData } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (shipmentData) {
      // Generate analysis based on shipment data
      return new Response(
        JSON.stringify({
          success: true,
          analysis: {
            carbonSaved: 0, // No comparison available
            fuelSaved: 0, // No comparison available
            timeSaved: 0, // No comparison available
            sustainabilityScore: 65 + Math.floor(Math.random() * 20), // Mock score
            recommendations: [
              "Create an optimized route plan for this shipment",
              "Consider alternative transport modes to reduce emissions",
              "Combine with other shipments going in the same direction"
            ]
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    throw new Error('Shipment or route not found');
    
  } catch (error) {
    console.error('Error analyzing shipment:', error);
    throw error;
  }
}

function calculateSustainabilityScore(routeData: any): number {
  // This is a simplified sustainability scoring model
  // In a real app, this would be much more sophisticated
  
  let score = 70; // Base score
  
  // Add points for using eco-friendly transport modes
  const transportTypes = routeData.transport_types || [];
  const ecoFriendlyCount = transportTypes.filter((type: string) => 
    ['rail', 'ship'].includes(type)
  ).length;
  
  score += ecoFriendlyCount * 5;
  
  // Subtract points for high-emission modes
  const highEmissionCount = transportTypes.filter((type: string) => 
    type === 'air'
  ).length;
  
  score -= highEmissionCount * 10;
  
  // Add points for optimization
  if (routeData.is_optimized) {
    score += 10;
  }
  
  // Cap score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function generateRecommendations(routeData: any): string[] {
  const recommendations: string[] = [];
  
  // Check transport modes
  const transportTypes = routeData.transport_types || [];
  if (transportTypes.includes('air')) {
    recommendations.push("Consider replacing air transport with rail or ship to reduce emissions");
  }
  
  if (!transportTypes.includes('rail') && routeData.total_distance > 500) {
    recommendations.push("Consider using rail transport for longer distances to reduce carbon footprint");
  }
  
  // Add general recommendations
  recommendations.push("Use vehicles with higher fuel efficiency or alternative fuels");
  recommendations.push("Implement load optimization to maximize cargo space usage");
  
  // Add recommendations based on route characteristics
  if (routeData.segments && routeData.segments.length > 3) {
    recommendations.push("Consolidate multiple short segments into fewer longer ones");
  }
  
  return recommendations;
}

async function generateSuggestions(shipmentId: string, supabase: any) {
  console.log(`Generating sustainability suggestions for shipment: ${shipmentId}`);
  
  try {
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
      
    if (!shipment) {
      throw new Error('Shipment not found');
    }
    
    // Generate mock AI suggestions based on shipment data
    const suggestions = [
      {
        title: "Use Rail Transport",
        description: "Switch from truck to rail transport for the main segment of this shipment to reduce carbon emissions.",
        carbonSavings: Math.round(shipment.carbon_footprint * 0.4 * 100) / 100,
        costSavings: Math.round(shipment.carbon_footprint * 0.2 * 100) / 100
      },
      {
        title: "Optimize Loading",
        description: "Increase vehicle fill rate by combining with other shipments going in the same direction.",
        carbonSavings: Math.round(shipment.carbon_footprint * 0.15 * 100) / 100,
        costSavings: Math.round(shipment.carbon_footprint * 0.18 * 100) / 100
      },
      {
        title: "Route Optimization",
        description: "Optimize the route to reduce total distance traveled and avoid traffic congestion.",
        carbonSavings: Math.round(shipment.carbon_footprint * 0.1 * 100) / 100,
        costSavings: Math.round(shipment.carbon_footprint * 0.12 * 100) / 100
      }
    ];
    
    // Save these suggestions to the database
    for (const suggestion of suggestions) {
      await supabase
        .from('ai_suggestions')
        .insert({
          title: suggestion.title,
          description: suggestion.description,
          carbon_savings: suggestion.carbonSavings,
          cost_savings: suggestion.costSavings,
          shipment_id: shipmentId,
          user_id: null, // Could be set to the current user if available
          implemented: false
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
