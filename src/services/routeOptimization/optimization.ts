
import { supabase } from '@/integrations/supabase/client';
import { OptimizedRoute, RoutePoint, RouteSustainabilityStats } from './types';
import { toast } from 'sonner';
import { getRouteById, updateRoute, createRoute } from './routeQueries';

// Optimize existing route
export const optimizeRoute = async (routeId: string): Promise<OptimizedRoute | null> => {
  try {
    // Get the original route
    const route = await getRouteById(routeId);
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
    
    // Update the route with optimized data
    const optimizedRoute = await updateRoute(routeId, {
      points: data.optimizedRoute.points,
      segments: data.optimizedRoute.segments,
      totalDistance: data.optimizedRoute.totalDistance,
      totalDuration: data.optimizedRoute.totalDuration,
      totalCarbonFootprint: data.optimizedRoute.totalCarbonFootprint,
      totalFuelConsumption: data.optimizedRoute.totalFuelConsumption,
      isOptimized: true,
      optimizedAt: new Date().toISOString()
    });
    
    if (!optimizedRoute) throw new Error('Failed to update route with optimized data');
    
    toast.success('Route successfully optimized');
    return optimizedRoute;
  } catch (error) {
    console.error('Error optimizing route:', error);
    toast.error('Failed to optimize route');
    return null;
  }
};

// Generate multi-modal route
export const generateMultiModalRoute = async (
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
    
    const routeName = `${origins[0].name} to ${destinations[0].name}`;
    
    // Create a new route with the optimized data
    return await createRoute({
      name: routeName,
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
    });
  } catch (error) {
    console.error('Error generating multi-modal route:', error);
    toast.error('Failed to generate route');
    return null;
  }
};

// Get route stats and sustainability metrics
export const getRouteSustainabilityStats = async (routeId: string): Promise<RouteSustainabilityStats | null> => {
  try {
    // Get the route
    const route = await getRouteById(routeId);
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
};
