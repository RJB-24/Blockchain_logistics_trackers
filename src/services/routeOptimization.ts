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
  isOptimized?: boolean;
  optimizedAt?: string;
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
      // Use the database function to get routes
      const { data, error } = await supabase.functions.invoke('database-function', {
        body: { function: 'get_all_routes' }
      });
      
      if (error) throw error;
      
      // If no data, return empty array
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      // Transform database format to our interface format
      const routes: OptimizedRoute[] = data.map((route: any) => ({
        id: route.id,
        name: route.name,
        points: route.points as RoutePoint[],
        segments: route.segments as RouteSegment[],
        totalDistance: route.total_distance,
        totalDuration: route.total_duration,
        totalCarbonFootprint: route.total_carbon_footprint,
        totalFuelConsumption: route.total_fuel_consumption,
        transportTypes: route.transport_types,
        shipmentsIncluded: route.shipments_included,
        isOptimized: route.is_optimized,
        optimizedAt: route.optimized_at
      }));
      
      return routes;
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast.error('Failed to load routes');
      return [];
    }
  },
  
  // Get a specific route by ID
  getRouteById: async (routeId: string): Promise<OptimizedRoute | null> => {
    try {
      // Use the database function to get a specific route
      const { data, error } = await supabase.functions.invoke('database-function', {
        body: { function: 'get_route_by_id', route_id: routeId }
      });
      
      if (error) throw error;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return null;
      }
      
      // Transform database format to our interface format
      const route: OptimizedRoute = {
        id: data[0].id,
        name: data[0].name,
        points: data[0].points as RoutePoint[],
        segments: data[0].segments as RouteSegment[],
        totalDistance: data[0].total_distance,
        totalDuration: data[0].total_duration,
        totalCarbonFootprint: data[0].total_carbon_footprint,
        totalFuelConsumption: data[0].total_fuel_consumption,
        transportTypes: data[0].transport_types,
        shipmentsIncluded: data[0].shipments_included,
        isOptimized: data[0].is_optimized,
        optimizedAt: data[0].optimized_at
      };
      
      return route;
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
      
      // Store the optimized route using raw query
      const { error: updateError } = await supabase
        .rpc('update_route', {
          p_id: routeId,
          p_points: data.optimizedRoute.points,
          p_segments: data.optimizedRoute.segments,
          p_total_distance: data.optimizedRoute.totalDistance,
          p_total_duration: data.optimizedRoute.totalDuration,
          p_total_carbon_footprint: data.optimizedRoute.totalCarbonFootprint,
          p_total_fuel_consumption: data.optimizedRoute.totalFuelConsumption,
          p_is_optimized: true,
          p_optimized_at: new Date().toISOString()
        });
      
      if (updateError) throw updateError;
      
      toast.success('Route successfully optimized');
      
      // Return the optimized route in our application format
      const optimizedRoute: OptimizedRoute = {
        id: route.id,
        name: route.name,
        points: data.optimizedRoute.points,
        segments: data.optimizedRoute.segments,
        totalDistance: data.optimizedRoute.totalDistance,
        totalDuration: data.optimizedRoute.totalDuration,
        totalCarbonFootprint: data.optimizedRoute.totalCarbonFootprint,
        totalFuelConsumption: data.optimizedRoute.totalFuelConsumption,
        transportTypes: route.transportTypes,
        shipmentsIncluded: route.shipmentsIncluded,
        isOptimized: true,
        optimizedAt: new Date().toISOString()
      };
      
      return optimizedRoute;
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
      
      // Prepare route data for insertion using RPC function
      const { data: savedRoute, error: insertError } = await supabase
        .rpc('create_route', {
          p_name: `${origins[0].name} to ${destinations[0].name}`,
          p_points: data.optimizedRoute.points,
          p_segments: data.optimizedRoute.segments,
          p_total_distance: data.optimizedRoute.totalDistance,
          p_total_duration: data.optimizedRoute.totalDuration,
          p_total_carbon_footprint: data.optimizedRoute.totalCarbonFootprint,
          p_total_fuel_consumption: data.optimizedRoute.totalFuelConsumption,
          p_transport_types: preferredModes,
          p_is_optimized: true,
          p_optimized_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
      
      toast.success('Multi-modal route generated successfully');
      
      // Return the route in our application format
      const newRoute: OptimizedRoute = {
        id: savedRoute.id,
        name: `${origins[0].name} to ${destinations[0].name}`,
        points: data.optimizedRoute.points,
        segments: data.optimizedRoute.segments,
        totalDistance: data.optimizedRoute.totalDistance,
        totalDuration: data.optimizedRoute.totalDuration,
        totalCarbonFootprint: data.optimizedRoute.totalCarbonFootprint,
        totalFuelConsumption: data.optimizedRoute.totalFuelConsumption,
        transportTypes: preferredModes,
        shipmentsIncluded: [],
        isOptimized: true,
        optimizedAt: new Date().toISOString()
      };
      
      return newRoute;
    } catch (error) {
      console.error('Error generating multi-modal route:', error);
      toast.error('Failed to generate route');
      return null;
    }
  },
  
  // Update an existing route
  updateRoute: async (
    routeId: string,
    routeData: Partial<OptimizedRoute>
  ): Promise<OptimizedRoute | null> => {
    try {
      // Use the database function to update the route
      const { data, error } = await supabase.functions.invoke('database-function', {
        body: { 
          function: 'update_route',
          p_id: routeId,
          p_points: routeData.points || [],
          p_segments: routeData.segments || [],
          p_total_distance: routeData.totalDistance || 0,
          p_total_duration: routeData.totalDuration || 0,
          p_total_carbon_footprint: routeData.totalCarbonFootprint || 0,
          p_total_fuel_consumption: routeData.totalFuelConsumption || 0,
          p_is_optimized: routeData.isOptimized || false,
          p_optimized_at: routeData.optimizedAt || new Date().toISOString()
        }
      });
      
      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned from update operation');
      }
      
      // Transform response to our interface format
      const updatedRoute: OptimizedRoute = {
        id: data.id,
        name: data.name,
        points: data.points || [],
        segments: data.segments || [],
        totalDistance: data.total_distance,
        totalDuration: data.total_duration,
        totalCarbonFootprint: data.total_carbon_footprint,
        totalFuelConsumption: data.total_fuel_consumption,
        transportTypes: data.transport_types || [],
        shipmentsIncluded: data.shipments_included || [],
        isOptimized: data.is_optimized,
        optimizedAt: data.optimized_at
      };
      
      return updatedRoute;
    } catch (error) {
      console.error(`Error updating route ${routeId}:`, error);
      toast.error('Failed to update route');
      return null;
    }
  },
  
  // Create a new route
  createRoute: async (
    routeData: Omit<OptimizedRoute, 'id'>
  ): Promise<OptimizedRoute | null> => {
    try {
      // Use the database function to create a new route
      const { data, error } = await supabase.functions.invoke('database-function', {
        body: { 
          function: 'create_route',
          p_name: routeData.name,
          p_points: routeData.points || [],
          p_segments: routeData.segments || [],
          p_total_distance: routeData.totalDistance || 0,
          p_total_duration: routeData.totalDuration || 0,
          p_total_carbon_footprint: routeData.totalCarbonFootprint || 0,
          p_total_fuel_consumption: routeData.totalFuelConsumption || 0,
          p_transport_types: routeData.transportTypes || [],
          p_is_optimized: routeData.isOptimized || false,
          p_optimized_at: routeData.optimizedAt || new Date().toISOString()
        }
      });
      
      if (error) throw error;
      
      if (!data) {
        throw new Error('No data returned from create operation');
      }
      
      // Transform response to our interface format
      const newRoute: OptimizedRoute = {
        id: data.id || '', // Ensure we have an ID even if it's empty
        name: data.name,
        points: data.points || [],
        segments: data.segments || [],
        totalDistance: data.total_distance,
        totalDuration: data.total_duration,
        totalCarbonFootprint: data.total_carbon_footprint,
        totalFuelConsumption: data.total_fuel_consumption,
        transportTypes: data.transport_types || [],
        shipmentsIncluded: data.shipments_included || [],
        isOptimized: data.is_optimized,
        optimizedAt: data.optimized_at
      };
      
      return newRoute;
    } catch (error) {
      console.error('Error creating route:', error);
      toast.error('Failed to create route');
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
