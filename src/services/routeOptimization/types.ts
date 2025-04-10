
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

export interface RouteSustainabilityStats {
  carbonSaved: number;
  fuelSaved: number;
  timeSaved: number;
  sustainabilityScore: number;
  recommendations: string[];
}
