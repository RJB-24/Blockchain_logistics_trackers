
import { calculateCarbonFootprint, calculateFuelConsumption } from './calculations';
import { 
  getAllRoutes, 
  getRouteById, 
  updateRoute, 
  createRoute 
} from './routeQueries';
import { 
  optimizeRoute, 
  generateMultiModalRoute, 
  getRouteSustainabilityStats 
} from './optimization';
import { 
  OptimizedRoute, 
  RoutePoint, 
  RouteSegment, 
  RouteSustainabilityStats 
} from './types';

// Export all functionality from a single entry point
export const routeOptimizationService = {
  // Queries
  getRoutes: getAllRoutes,
  getRouteById,
  updateRoute,
  createRoute,
  
  // Optimization functions
  optimizeRoute,
  generateMultiModalRoute,
  getRouteSustainabilityStats,
  
  // Utility calculations
  calculateCarbonFootprint,
  calculateFuelConsumption
};

// Also export types for external usage
export type {
  OptimizedRoute,
  RoutePoint,
  RouteSegment,
  RouteSustainabilityStats
};

export default routeOptimizationService;
