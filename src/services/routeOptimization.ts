
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for route optimization
export interface RoutePoint {
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

export interface RouteSegment {
  origin: RoutePoint;
  destination: RoutePoint;
  distance: number; // in km
  duration: number; // in minutes
  mode: 'truck' | 'ship' | 'rail' | 'air';
  carbonFootprint: number; // in kg CO2
  fuelConsumption: number; // in liters
}

export interface OptimizedRoute {
  id: string;
  name: string;
  points: RoutePoint[];
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  totalCarbonFootprint: number;
  totalFuelConsumption: number;
  transportTypes: string[];
  shipmentsIncluded: string[];
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

export const routeOptimizationService = {
  // Get all routes from Supabase
  getRoutes: async (): Promise<OptimizedRoute[]> => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*');
      
      if (error) throw error;
      
      // If no data, return empty array
      if (!data || data.length === 0) {
        return [];
      }
      
      return data as OptimizedRoute[];
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
      return [];
    }
  },
  
  // Get a specific route by ID
  getRouteById: async (routeId: string): Promise<OptimizedRoute | null> => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeId)
        .single();
      
      if (error) throw error;
      
      return data as OptimizedRoute;
    } catch (error) {
      console.error(`Error fetching route ${routeId}:`, error);
      toast.error('Failed to load route details');
      return null;
    }
  },
  
  // Optimize existing route
  optimizeRoute: async (routeId: string): Promise<OptimizedRoute | null> => {
    try {
      // Get the original route
      const route = await routeOptimizationService.getRouteById(routeId);
      if (!route) throw new Error('Route not found');
      
      // Call optimization edge function
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { 
          action: 'optimize_route',
          routeParams: {
            routeId: route.id,
            points: route.points,
            transportTypes: route.transportTypes
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.success || !data.optimizedRoute) {
        throw new Error('Optimization failed');
      }
      
      // Store the optimized route
      const { error: updateError } = await supabase
        .from('routes')
        .update({ 
          points: data.optimizedRoute.points,
          segments: data.optimizedRoute.segments,
          totalDistance: data.optimizedRoute.totalDistance,
          totalDuration: data.optimizedRoute.totalDuration,
          totalCarbonFootprint: data.optimizedRoute.totalCarbonFootprint,
          totalFuelConsumption: data.optimizedRoute.totalFuelConsumption,
          isOptimized: true,
          optimizedAt: new Date().toISOString()
        })
        .eq('id', routeId);
      
      if (updateError) throw updateError;
      
      toast.success('Route successfully optimized');
      return data.optimizedRoute;
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast.error('Failed to optimize route');
      return null;
    }
  },
  
  // Generate multi-modal route
  generateMultiModalRoute: async (
    origins: RoutePoint[], 
    destinations: RoutePoint[],
    preferredModes: ('truck' | 'ship' | 'rail' | 'air')[],
    optimizationCriteria: 'time' | 'cost' | 'carbon' = 'carbon'
  ): Promise<OptimizedRoute | null> => {
    try {
      // Call the edge function for route generation
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { 
          action: 'optimize_route',
          routeParams: {
            origins,
            destinations,
            preferredModes,
            optimizationCriteria
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.success || !data.optimizedRoute) {
        throw new Error('Route generation failed');
      }
      
      // Store the generated route
      const { data: savedRoute, error: insertError } = await supabase
        .from('routes')
        .insert({
          name: `${origins[0].name} to ${destinations[0].name}`,
          points: data.optimizedRoute.points,
          segments: data.optimizedRoute.segments,
          totalDistance: data.optimizedRoute.totalDistance,
          totalDuration: data.optimizedRoute.totalDuration,
          totalCarbonFootprint: data.optimizedRoute.totalCarbonFootprint,
          totalFuelConsumption: data.optimizedRoute.totalFuelConsumption,
          transportTypes: preferredModes,
          isOptimized: true,
          optimizedAt: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      toast.success('Multi-modal route generated successfully');
      return savedRoute as OptimizedRoute;
    } catch (error) {
      console.error('Error generating multi-modal route:', error);
      toast.error('Failed to generate route');
      return null;
    }
  },
  
  // Calculate carbon footprint for a route
  calculateCarbonFootprint: (
    distance: number, 
    mode: 'truck' | 'ship' | 'rail' | 'air', 
    weightTons: number = 1
  ): number => {
    const emissionFactor = emissionFactors[mode] || emissionFactors.truck;
    // Calculate emissions in kg of CO2
    return (distance * emissionFactor * weightTons) / 1000;
  },
  
  // Calculate fuel consumption for a route
  calculateFuelConsumption: (
    distance: number, 
    mode: 'truck' | 'ship' | 'rail' | 'air'
  ): number => {
    const consumptionRate = fuelConsumptionRates[mode] || fuelConsumptionRates.truck;
    return distance * consumptionRate;
  },
  
  // Get route stats and sustainability metrics
  getRouteSustainabilityStats: async (routeId: string): Promise<{
    carbonSaved: number;
    fuelSaved: number;
    timeSaved: number;
    sustainabilityScore: number;
    recommendations: string[];
  } | null> => {
    try {
      // Get the route
      const route = await routeOptimizationService.getRouteById(routeId);
      if (!route) throw new Error('Route not found');
      
      // Call the sustainability-ai function
      const { data, error } = await supabase.functions.invoke('sustainability-ai', {
        body: { 
          action: 'analyze_shipment',
          routeId: routeId
        }
      });
      
      if (error) throw error;
      
      return {
        carbonSaved: data.analysis.carbonSaved || 0,
        fuelSaved: data.analysis.fuelSaved || 0,
        timeSaved: data.analysis.timeSaved || 0,
        sustainabilityScore: data.analysis.sustainabilityScore || 0,
        recommendations: data.analysis.recommendations || []
      };
    } catch (error) {
      console.error('Error getting route sustainability stats:', error);
      return null;
    }
  }
};

export default routeOptimizationService;
