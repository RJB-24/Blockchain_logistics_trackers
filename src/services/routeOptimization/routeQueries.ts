
import { supabase } from '@/integrations/supabase/client';
import { OptimizedRoute } from './types';
import { toast } from 'sonner';

// Get all routes from Supabase
export const getAllRoutes = async (): Promise<OptimizedRoute[]> => {
  try {
    // Use direct database query instead of functions.invoke
    const { data, error } = await supabase
      .from('routes')
      .select('*');
    
    if (error) throw error;
    
    // If no data, return empty array
    if (!data || !Array.isArray(data) || data.length === 0) {
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
    // Use direct database query instead of functions.invoke
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return null;
    }
    
    // Transform database format to our interface format
    const route: OptimizedRoute = {
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
    // Convert from camelCase to snake_case for database
    const dbData = {
      name: routeData.name,
      points: routeData.points,
      segments: routeData.segments,
      total_distance: routeData.totalDistance,
      total_duration: routeData.totalDuration,
      total_carbon_footprint: routeData.totalCarbonFootprint,
      total_fuel_consumption: routeData.totalFuelConsumption,
      transport_types: routeData.transportTypes,
      is_optimized: routeData.isOptimized,
      optimized_at: routeData.optimizedAt
    };

    // Use direct database query instead of functions.invoke
    const { data, error } = await supabase
      .from('routes')
      .update(dbData)
      .eq('id', routeId)
      .select()
      .single();
    
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
};

// Create a new route
export const createRoute = async (
  routeData: Omit<OptimizedRoute, 'id'>
): Promise<OptimizedRoute | null> => {
  try {
    // Convert from camelCase to snake_case for database
    const dbData = {
      name: routeData.name,
      points: routeData.points,
      segments: routeData.segments,
      total_distance: routeData.totalDistance,
      total_duration: routeData.totalDuration,
      total_carbon_footprint: routeData.totalCarbonFootprint,
      total_fuel_consumption: routeData.totalFuelConsumption,
      transport_types: routeData.transportTypes,
      shipments_included: routeData.shipmentsIncluded,
      is_optimized: routeData.isOptimized,
      optimized_at: routeData.optimizedAt
    };

    // Use direct database query instead of functions.invoke
    const { data, error } = await supabase
      .from('routes')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error('No data returned from create operation');
    }
    
    // Transform response to our interface format
    const newRoute: OptimizedRoute = {
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
    
    return newRoute;
  } catch (error) {
    console.error('Error creating route:', error);
    toast.error('Failed to create route');
    return null;
  }
};
