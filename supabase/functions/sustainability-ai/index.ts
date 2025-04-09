
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  action: 'analyze_shipment' | 'generate_suggestions' | 'optimize_route' | 'predict_maintenance' | 'calculate_carbon_credits';
  shipmentId?: string;
  vehicleData?: any;
  routeParams?: {
    origin: string;
    destination: string;
    transportType: string;
    currentLocation?: { lat: number; lng: number };
  };
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

interface MultiModalRouteSegment {
  mode: 'truck' | 'rail' | 'ship' | 'air';
  distance: number;
  startLocation: string;
  endLocation: string;
  carbonFootprint: number;
  estimatedTime: number; // in minutes
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
    const { action, shipmentId, vehicleData, routeParams } = await req.json() as AIRequest;
    
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
    else if (action === 'optimize_route' && routeParams) {
      // Generate optimized route using AI for multi-modal transportation
      const optimizedRoute = generateOptimizedRoute(routeParams);
      
      return new Response(
        JSON.stringify({
          success: true,
          optimizedRoute,
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    }
    else if (action === 'predict_maintenance' && vehicleData) {
      // Use AI to predict maintenance needs based on vehicle data
      const maintenancePredictions = predictMaintenance(vehicleData);
      
      return new Response(
        JSON.stringify({
          success: true,
          predictions: maintenancePredictions,
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    }
    else if (action === 'calculate_carbon_credits' && shipmentId) {
      // Get shipment data
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();
      
      if (shipmentError) throw shipmentError;
      
      // Calculate carbon credits based on sustainability factors
      const carbonCredits = calculateCarbonCredits(shipment);
      
      return new Response(
        JSON.stringify({
          success: true,
          shipmentId,
          carbonCredits,
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
  
  // Add new AI-powered suggestions for predictive maintenance
  suggestions.push({
    title: "Implement predictive maintenance for delivery vehicles",
    description: "Our AI analysis shows that implementing predictive maintenance for your fleet could reduce fuel consumption by 12% and extend vehicle lifespan. This would result in significant carbon and cost savings.",
    carbon_savings: 28.5,
    cost_savings: 350.75,
    implemented: false
  });
  
  // Add suggestions for carbon credit trading
  suggestions.push({
    title: "Participate in blockchain carbon credit marketplace",
    description: "Based on your sustainability improvements, your company qualifies for carbon credit trading. By tokenizing and trading these credits on our blockchain marketplace, you could offset costs while further incentivizing sustainable practices.",
    carbon_savings: 45.0,
    cost_savings: 500.0,
    implemented: false
  });
  
  return suggestions;
}

// Generate optimized route with multi-modal transport options
function generateOptimizedRoute(routeParams: AIRequest['routeParams']) {
  if (!routeParams) return null;
  
  const { origin, destination, transportType } = routeParams;
  
  // This is a mock implementation - in a real application this would use
  // actual route optimization algorithms and real distance/time data
  const segments: MultiModalRouteSegment[] = [];
  
  // Create a mock multi-modal route based on the transport type preference
  if (transportType === 'multi-modal') {
    // Simulate a route with truck -> rail -> truck segments
    segments.push({
      mode: 'truck',
      startLocation: origin,
      endLocation: 'Railway Terminal A',
      distance: 120,
      carbonFootprint: 120 * 0.092, // kg CO2
      estimatedTime: 90 // minutes
    });
    
    segments.push({
      mode: 'rail',
      startLocation: 'Railway Terminal A',
      endLocation: 'Railway Terminal B',
      distance: 500,
      carbonFootprint: 500 * 0.022, // kg CO2
      estimatedTime: 240 // minutes
    });
    
    segments.push({
      mode: 'truck',
      startLocation: 'Railway Terminal B',
      endLocation: destination,
      distance: 80,
      carbonFootprint: 80 * 0.092, // kg CO2
      estimatedTime: 70 // minutes
    });
  } else if (transportType === 'ship') {
    // Simulate a route with truck -> ship -> truck segments
    segments.push({
      mode: 'truck',
      startLocation: origin,
      endLocation: 'Port A',
      distance: 50,
      carbonFootprint: 50 * 0.092, // kg CO2
      estimatedTime: 40 // minutes
    });
    
    segments.push({
      mode: 'ship',
      startLocation: 'Port A',
      endLocation: 'Port B',
      distance: 800,
      carbonFootprint: 800 * 0.015, // kg CO2
      estimatedTime: 2400 // minutes (40 hours)
    });
    
    segments.push({
      mode: 'truck',
      startLocation: 'Port B',
      endLocation: destination,
      distance: 70,
      carbonFootprint: 70 * 0.092, // kg CO2
      estimatedTime: 60 // minutes
    });
  } else {
    // Single mode transport (truck, air, rail)
    let distance = 600; // Mock distance
    let carbonFactor = 0.092; // Default to truck
    let speed = 7; // km per minute
    
    if (transportType === 'air') {
      carbonFactor = 0.82;
      speed = 15;
    } else if (transportType === 'rail') {
      carbonFactor = 0.022;
      speed = 2;
    }
    
    segments.push({
      mode: transportType as any,
      startLocation: origin,
      endLocation: destination,
      distance,
      carbonFootprint: distance * carbonFactor,
      estimatedTime: distance / speed
    });
  }
  
  // Calculate totals
  const totalDistance = segments.reduce((sum, segment) => sum + segment.distance, 0);
  const totalCarbonFootprint = segments.reduce((sum, segment) => sum + segment.carbonFootprint, 0);
  const totalTime = segments.reduce((sum, segment) => sum + segment.estimatedTime, 0);
  
  return {
    origin,
    destination,
    segments,
    summary: {
      totalDistance,
      totalCarbonFootprint,
      totalTime,
      primaryMode: transportType
    }
  };
}

// Predict maintenance needs for vehicles
function predictMaintenance(vehicleData: any) {
  // This is a simplified mock implementation
  if (!vehicleData) return [];
  
  const { vehicleId, mileage, engineHours, lastMaintenanceDate, telemetryData } = vehicleData;
  
  // In a real implementation, this would use ML models trained on vehicle data
  const maintenanceItems = [];
  
  // Mock logic to simulate AI predictions
  if (mileage > 5000 && Date.now() - new Date(lastMaintenanceDate).getTime() > 90 * 24 * 60 * 60 * 1000) {
    maintenanceItems.push({
      item: "Oil Change",
      urgency: "High",
      estimatedCost: 50,
      fuelSavings: 3, // percentage
      emissionReduction: 2.5 // percentage
    });
  }
  
  if (mileage > 20000) {
    maintenanceItems.push({
      item: "Transmission Service",
      urgency: "Medium",
      estimatedCost: 150,
      fuelSavings: 2,
      emissionReduction: 1.8
    });
  }
  
  if (telemetryData && telemetryData.tirePressure && 
      telemetryData.tirePressure.some((pressure: number) => pressure < 32)) {
    maintenanceItems.push({
      item: "Tire Pressure Adjustment",
      urgency: "High",
      estimatedCost: 0,
      fuelSavings: 4,
      emissionReduction: 4
    });
  }
  
  if (telemetryData && telemetryData.batteryHealth && telemetryData.batteryHealth < 70) {
    maintenanceItems.push({
      item: "Battery Replacement",
      urgency: "Medium",
      estimatedCost: 120,
      fuelSavings: 1,
      emissionReduction: 0.5
    });
  }
  
  return {
    vehicleId,
    predictionDate: new Date().toISOString(),
    maintenanceItems,
    summary: {
      totalItems: maintenanceItems.length,
      criticalItems: maintenanceItems.filter(item => item.urgency === "High").length,
      potentialFuelSavings: maintenanceItems.reduce((sum, item) => sum + item.fuelSavings, 0),
      potentialEmissionReduction: maintenanceItems.reduce((sum, item) => sum + item.emissionReduction, 0)
    }
  };
}

// Calculate carbon credits
function calculateCarbonCredits(shipment: ShipmentData) {
  // Calculate base score from transport type efficiency
  const transportEfficiency = {
    'rail': 0.9,
    'ship': 0.7,
    'multi-modal': 0.6,
    'truck': 0.4,
    'air': 0.2
  };
  
  const efficiency = transportEfficiency[shipment.transport_type as keyof typeof transportEfficiency] || 0.5;
  
  // Calculate carbon savings compared to industry average
  const industryAverageCO2 = shipment.weight * 0.1; // kg CO2 per kg of freight (mock value)
  const actualCO2 = shipment.carbon_footprint;
  const carbonSaved = Math.max(0, industryAverageCO2 - actualCO2);
  
  // Calculate credits (1 credit per 10kg CO2 saved)
  const credits = Math.floor(carbonSaved / 10);
  
  // Apply multiplier based on transport efficiency
  const adjustedCredits = Math.round(credits * (1 + efficiency));
  
  return {
    credits: adjustedCredits,
    carbonSaved,
    efficiency,
    monetaryValue: adjustedCredits * 5, // $5 per credit (mock value)
    breakdown: {
      baseCredits: credits,
      efficiencyBonus: adjustedCredits - credits,
      totalCredits: adjustedCredits
    }
  };
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
