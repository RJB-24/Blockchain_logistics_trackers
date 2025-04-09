
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Map, 
  LocateFixed, 
  Route as RouteIcon, 
  Zap, 
  Truck, 
  Clock, 
  Fuel, 
  Leaf, 
  RefreshCw, 
  Eye 
} from 'lucide-react';

// In a real app, this would come from a database or API
const MOCK_ROUTES = [
  {
    id: '1',
    name: 'Daily Delivery Route',
    stops: [
      { id: '1', name: 'Central Warehouse', address: '123 Main St, New York, NY', time: '08:00 AM', status: 'current' },
      { id: '2', name: 'Office Supplies Inc', address: '456 Business Ave, New York, NY', time: '09:30 AM', status: 'upcoming' },
      { id: '3', name: 'Tech Solutions', address: '789 Innovation Blvd, New York, NY', time: '11:00 AM', status: 'upcoming' },
      { id: '4', name: 'Downtown Mall', address: '101 Shopping Center, New York, NY', time: '01:00 PM', status: 'upcoming' },
      { id: '5', name: 'Hospital Campus', address: '202 Healthcare Dr, New York, NY', time: '02:30 PM', status: 'upcoming' },
    ],
    distance: 42.5, // km
    duration: 195, // minutes
    fuelConsumption: 12.3, // liters
    carbonEmission: 28.6, // kg CO2
  },
  {
    id: '2',
    name: 'Weekly Distribution',
    stops: [
      { id: '1', name: 'Regional Distribution Center', address: '100 Logistics Pkwy, Newark, NJ', time: '06:00 AM', status: 'current' },
      { id: '2', name: 'Grocery Outlet North', address: '234 Market St, Newark, NJ', time: '08:00 AM', status: 'upcoming' },
      { id: '3', name: 'Grocery Outlet East', address: '345 Food Ave, Jersey City, NJ', time: '10:30 AM', status: 'upcoming' },
      { id: '4', name: 'Grocery Outlet South', address: '456 Fresh Blvd, Bayonne, NJ', time: '01:00 PM', status: 'upcoming' },
      { id: '5', name: 'Grocery Outlet West', address: '567 Produce Ln, Hoboken, NJ', time: '03:30 PM', status: 'upcoming' },
      { id: '6', name: 'Regional Distribution Center', address: '100 Logistics Pkwy, Newark, NJ', time: '05:30 PM', status: 'upcoming' },
    ],
    distance: 78.2, // km
    duration: 320, // minutes
    fuelConsumption: 22.5, // liters
    carbonEmission: 52.3, // kg CO2
  }
];

// These would be actual optimized routes in a real app
const MOCK_OPTIMIZED_ROUTES = {
  '1': {
    id: '1-opt',
    name: 'Daily Delivery Route (Optimized)',
    stops: [
      { id: '1', name: 'Central Warehouse', address: '123 Main St, New York, NY', time: '08:00 AM', status: 'current' },
      { id: '3', name: 'Tech Solutions', address: '789 Innovation Blvd, New York, NY', time: '09:15 AM', status: 'upcoming' },
      { id: '5', name: 'Hospital Campus', address: '202 Healthcare Dr, New York, NY', time: '10:30 AM', status: 'upcoming' },
      { id: '4', name: 'Downtown Mall', address: '101 Shopping Center, New York, NY', time: '11:45 AM', status: 'upcoming' },
      { id: '2', name: 'Office Supplies Inc', address: '456 Business Ave, New York, NY', time: '01:00 PM', status: 'upcoming' },
    ],
    distance: 36.2, // km
    duration: 165, // minutes
    fuelConsumption: 10.5, // liters
    carbonEmission: 24.3, // kg CO2
  },
  '2': {
    id: '2-opt',
    name: 'Weekly Distribution (Optimized)',
    stops: [
      { id: '1', name: 'Regional Distribution Center', address: '100 Logistics Pkwy, Newark, NJ', time: '06:00 AM', status: 'current' },
      { id: '5', name: 'Grocery Outlet West', address: '567 Produce Ln, Hoboken, NJ', time: '07:30 AM', status: 'upcoming' },
      { id: '3', name: 'Grocery Outlet East', address: '345 Food Ave, Jersey City, NJ', time: '09:00 AM', status: 'upcoming' },
      { id: '4', name: 'Grocery Outlet South', address: '456 Fresh Blvd, Bayonne, NJ', time: '11:00 AM', status: 'upcoming' },
      { id: '2', name: 'Grocery Outlet North', address: '234 Market St, Newark, NJ', time: '01:30 PM', status: 'upcoming' },
      { id: '6', name: 'Regional Distribution Center', address: '100 Logistics Pkwy, Newark, NJ', time: '03:00 PM', status: 'upcoming' },
    ],
    distance: 65.7, // km
    duration: 270, // minutes
    fuelConsumption: 19.2, // liters
    carbonEmission: 44.5, // kg CO2
  }
};

const RouteOptimization = () => {
  const [selectedRoute, setSelectedRoute] = useState<string>('1');
  const [optimized, setOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const currentRoute = optimized 
    ? MOCK_OPTIMIZED_ROUTES[selectedRoute as keyof typeof MOCK_OPTIMIZED_ROUTES]
    : MOCK_ROUTES.find(route => route.id === selectedRoute);

  const optimizeRoute = () => {
    setOptimizing(true);
    toast.info('Optimizing route using AI algorithms...');
    
    // Simulate API call delay
    setTimeout(() => {
      setOptimizing(false);
      setOptimized(true);
      
      // Calculate savings
      const original = MOCK_ROUTES.find(route => route.id === selectedRoute);
      const optimized = MOCK_OPTIMIZED_ROUTES[selectedRoute as keyof typeof MOCK_OPTIMIZED_ROUTES];
      
      if (original && optimized) {
        const timeSaved = original.duration - optimized.duration;
        const fuelSaved = original.fuelConsumption - optimized.fuelConsumption;
        const carbonSaved = original.carbonEmission - optimized.carbonEmission;
        
        toast.success(`Route optimized! Saved ${timeSaved} minutes, ${fuelSaved.toFixed(1)}L fuel, and ${carbonSaved.toFixed(1)}kg CO₂`);
      }
    }, 2000);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Route Optimization</h1>
            <p className="text-muted-foreground">Optimize delivery routes to save time, fuel, and emissions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5 text-eco-purple" />
                Route Map
              </CardTitle>
              <CardDescription>
                Select a route and view stop details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Select
                  value={selectedRoute}
                  onValueChange={(value) => {
                    setSelectedRoute(value);
                    setOptimized(false);
                  }}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_ROUTES.map(route => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Optimized</span>
                  <Switch
                    checked={optimized}
                    onCheckedChange={setOptimized}
                    disabled={optimizing}
                  />
                </div>
              </div>

              <div className="bg-gray-100 rounded-md p-4 h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-eco-purple mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Interactive map would display here with the route visualization
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Eye className="h-4 w-4 mr-1" />
                    View Full Map
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h3 className="text-md font-medium">Stops ({currentRoute?.stops.length})</h3>
                
                <div>
                  {currentRoute?.stops.map((stop, index) => (
                    <div key={stop.id} className="relative pl-8 pb-8">
                      {/* Vertical line connecting stops */}
                      {index < currentRoute.stops.length - 1 && (
                        <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      
                      {/* Stop marker */}
                      <div className={`absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full ${
                        stop.status === 'current' ? 'bg-eco-purple text-white' : 'bg-gray-200'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="bg-white rounded-md border p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{stop.name}</h4>
                            <p className="text-sm text-muted-foreground">{stop.address}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={stop.status === 'current' ? 'bg-eco-purple' : 'bg-gray-200'}>
                              {stop.time}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RouteIcon className="mr-2 h-5 w-5 text-eco-purple" />
                Route Details
              </CardTitle>
              <CardDescription>
                {currentRoute?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center mb-1 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4 mr-1" />
                      Distance
                    </div>
                    <div className="font-bold">{currentRoute?.distance} km</div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center mb-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration
                    </div>
                    <div className="font-bold">{formatDuration(currentRoute?.duration || 0)}</div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center mb-1 text-sm text-muted-foreground">
                      <Fuel className="h-4 w-4 mr-1" />
                      Fuel
                    </div>
                    <div className="font-bold">{currentRoute?.fuelConsumption}L</div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <div className="flex items-center mb-1 text-sm text-muted-foreground">
                      <Leaf className="h-4 w-4 mr-1" />
                      Carbon
                    </div>
                    <div className="font-bold">{currentRoute?.carbonEmission} kg CO₂</div>
                  </div>
                </div>

                {optimized && (
                  <div className="bg-eco-light p-4 rounded-md">
                    <h3 className="flex items-center text-eco-dark font-medium mb-2">
                      <Zap className="h-4 w-4 mr-1 text-eco-purple" />
                      Optimization Savings
                    </h3>
                    
                    <div className="space-y-2">
                      {(() => {
                        const original = MOCK_ROUTES.find(route => route.id === selectedRoute);
                        const optimized = MOCK_OPTIMIZED_ROUTES[selectedRoute as keyof typeof MOCK_OPTIMIZED_ROUTES];
                        
                        if (original && optimized) {
                          const distanceSaved = (original.distance - optimized.distance).toFixed(1);
                          const timeSaved = original.duration - optimized.duration;
                          const fuelSaved = (original.fuelConsumption - optimized.fuelConsumption).toFixed(1);
                          const carbonSaved = (original.carbonEmission - optimized.carbonEmission).toFixed(1);
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm">Distance Saved:</span>
                                <span className="font-medium text-eco-purple">{distanceSaved} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Time Saved:</span>
                                <span className="font-medium text-eco-purple">{formatDuration(timeSaved)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">Fuel Saved:</span>
                                <span className="font-medium text-eco-purple">{fuelSaved}L</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm">CO₂ Reduced:</span>
                                <span className="font-medium text-eco-purple">{carbonSaved} kg</span>
                              </div>
                            </>
                          );
                        }
                        
                        return <p>No comparison data available</p>;
                      })()}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Button 
                    className="w-full bg-eco-purple hover:bg-eco-purple/90"
                    onClick={optimizeRoute}
                    disabled={optimizing || optimized}
                  >
                    {optimizing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : optimized ? (
                      <>
                        <LocateFixed className="mr-2 h-4 w-4" />
                        Route Optimized
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Optimize Route
                      </>
                    )}
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <LocateFixed className="mr-2 h-4 w-4" />
                    Start Navigation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RouteOptimization;
