
import { supabase } from '@/integrations/supabase/client';
import { OptimizedRoute } from './types';
import { toast } from 'sonner';

// Get all routes from Supabase
export const getAllRoutes = async (): Promise<OptimizedRoute[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('database-function', {
      body: { function: 'get_all_routes' }
    });
    
    if (error) throw error;
    
    // If no data, return empty array
    if (!data || !data.length) {
      return [];
    }
    
    // Transform database format to our interface format
    const routes: OptimizedRoute[] = data.map((route: any) => ({
      id: route.id,
      name: route.name,
      points: route.points || [],
      segments: route.segments || [],
      totalDistance: route.total_distance,
      totalDuration: route.total_duration,
      totalCarbonFootprint: route.total_carbon_footprint,
      totalFuelConsumption: route.total_fuel_consumption,
      transportTypes: route.transport_types || [],
      shipmentsIncluded: route.shipments_included || [],
      isOptimized: route.is_optimized,
      optimizedAt: route.optimized_at
    }));
    
    return routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    toast.error('Failed to load routes');
    return [];
  }
};

// Get a specific route by ID
export const getRouteById = async (routeId: string): Promise<OptimizedRoute | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('database-function', {
      body: { function: 'get_route_by_id', route_id: routeId }
    });
    
    if (error) throw error;
    
    if (!data || !data.length) return null;
    
    // Transform database format to our interface format
    const route: OptimizedRoute = {
      id: data[0].id,
      name: data[0].name,
      points: data[0].points || [],
      segments: data[0].segments || [],
      totalDistance: data[0].total_distance,
      totalDuration: data[0].total_duration,
      totalCarbonFootprint: data[0].total_carbon_footprint,
      totalFuelConsumption: data[0].total_fuel_consumption,
      transportTypes: data[0].transport_types || [],
      shipmentsIncluded: data[0].shipments_included || [],
      isOptimized: data[0].is_optimized,
      optimizedAt: data[0].optimized_at
    };
    
    return route;
  } catch (error) {
    console.error(`Error fetching route ${routeId}:`, error);
    toast.error('Failed to load route details');
    return null;
  }
};

// Update an existing route
export const updateRoute = async (
  routeId: string,
  routeData: Partial<OptimizedRoute>
): Promise<OptimizedRoute | null> => {
  try {
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
        p_optimized_at: routeData.optimizedAt || null
      }
    });
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
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
  } catch (error) {
    console.error('Error updating route:', error);
    toast.error('Failed to update route');
    return null;
  }
};

// Create a new route
export const createRoute = async (routeData: Omit<OptimizedRoute, 'id'>): Promise<OptimizedRoute | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('database-function', {
      body: { 
        function: 'create_route',
        p_name: routeData.name,
        p_points: routeData.points,
        p_segments: routeData.segments,
        p_total_distance: routeData.totalDistance,
        p_total_duration: routeData.totalDuration,
        p_total_carbon_footprint: routeData.totalCarbonFootprint,
        p_total_fuel_consumption: routeData.totalFuelConsumption,
        p_transport_types: routeData.transportTypes,
        p_is_optimized: routeData.isOptimized || false,
        p_optimized_at: routeData.optimizedAt || null
      }
    });
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
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
  } catch (error) {
    console.error('Error creating route:', error);
    toast.error('Failed to create route');
    return null;
  }
};
