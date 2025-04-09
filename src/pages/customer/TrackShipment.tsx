
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Package, Clock, Map, Route, ArrowRight, Loader2, LocateFixed } from 'lucide-react';

const TrackShipment = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shipment, setShipment] = useState<any>(null);
  const [sensorData, setSensorData] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }
    
    setIsLoading(true);
    try {
      // First, get the shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_id', trackingId)
        .single();
      
      if (shipmentError) throw shipmentError;
      
      if (!shipmentData) {
        toast.error('Shipment not found. Please check the tracking ID.');
        setIsLoading(false);
        return;
      }
      
      // Then get the latest sensor data
      const { data: sensorDataArr, error: sensorError } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (sensorError) throw sensorError;
      
      setShipment(shipmentData);
      setSensorData(sensorDataArr && sensorDataArr.length > 0 ? sensorDataArr[0] : null);
      
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast.error('Failed to track shipment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (shipment) {
      navigate(`/shipment/${shipment.id}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'in-transit':
        return <Badge className="bg-amber-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'delayed':
        return <Badge className="bg-red-500">Delayed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderShipmentTimeline = () => {
    if (!shipment) return null;
    
    const statusOrder = ['processing', 'in-transit', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(shipment.status);
    
    return (
      <div className="my-6">
        <div className="flex justify-between mb-2">
          {statusOrder.map((status, index) => (
            <div 
              key={status} 
              className="flex flex-col items-center"
              style={{ opacity: index <= currentStatusIndex ? 1 : 0.4 }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStatusIndex ? 'bg-eco-purple text-white' : 'bg-gray-200'
              }`}>
                {index === 0 && <Package className="h-4 w-4" />}
                {index === 1 && <Route className="h-4 w-4" />}
                {index === 2 && <Check className="h-4 w-4" />}
              </div>
              <span className="text-xs mt-1 text-center capitalize">{status.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
        
        <div className="relative h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="absolute h-2 bg-eco-purple rounded-full"
            style={{
              width: currentStatusIndex === 0 ? '15%' : 
                   currentStatusIndex === 1 ? '50%' : 
                   currentStatusIndex === 2 ? '100%' : '0%'
            }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Track Shipment</h1>
            <p className="text-muted-foreground">Monitor your shipments in real-time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-eco-purple" />
                Enter Tracking ID
              </CardTitle>
              <CardDescription>
                Track your shipment using the tracking ID provided
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter tracking ID (e.g., ECO-ABCDE-12345)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    className="bg-eco-purple hover:bg-eco-purple/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-2">Track</span>
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Example tracking IDs: ECO-ABCDE-12345, ECO-XYZ78-90123</p>
                </div>
              </form>
            </CardContent>
          </Card>

          {shipment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-eco-purple" />
                  Shipment Details
                </CardTitle>
                <CardDescription>
                  Tracking ID: {shipment.tracking_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{shipment.title}</h3>
                      <div className="flex items-center mb-4">
                        <span className="text-sm text-muted-foreground mr-2">Status:</span>
                        {getStatusBadge(shipment.status)}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="self-start"
                      onClick={handleViewDetails}
                    >
                      View Full Details
                    </Button>
                  </div>
                  
                  {renderShipmentTimeline()}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Origin</h4>
                      <p>{shipment.origin}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-eco-purple" />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Destination</h4>
                      <p>{shipment.destination}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Planned Departure
                      </h4>
                      <p>{shipment.planned_departure_date ? 
                          new Date(shipment.planned_departure_date).toLocaleDateString() : 
                          'Not scheduled'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Estimated Arrival
                      </h4>
                      <p>{shipment.estimated_arrival_date ? 
                          new Date(shipment.estimated_arrival_date).toLocaleDateString() : 
                          'Not estimated'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                        <Leaf className="h-4 w-4 mr-1" />
                        Carbon Footprint
                      </h4>
                      <p>{shipment.carbon_footprint} kg CO₂</p>
                    </div>
                  </div>
                  
                  {sensorData && (
                    <>
                      <Separator />
                      
                      <div>
                        <h3 className="text-md font-semibold mb-3 flex items-center">
                          <BarChart className="h-5 w-5 mr-2 text-eco-purple" />
                          Live Sensor Data
                          <Badge className="ml-2 bg-eco-purple">Updated {new Date(sensorData.timestamp).toLocaleTimeString()}</Badge>
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {sensorData.temperature !== null && (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center mb-1">
                                <ThermometerSun className="h-4 w-4 mr-1 text-amber-500" />
                                <span className="text-sm font-medium">Temperature</span>
                              </div>
                              <p className="text-lg font-semibold">{sensorData.temperature}°C</p>
                            </div>
                          )}
                          
                          {sensorData.humidity !== null && (
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center mb-1">
                                <Cloud className="h-4 w-4 mr-1 text-blue-500" />
                                <span className="text-sm font-medium">Humidity</span>
                              </div>
                              <p className="text-lg font-semibold">{sensorData.humidity}%</p>
                            </div>
                          )}
                          
                          {sensorData.latitude !== null && sensorData.longitude !== null && (
                            <div className="p-3 bg-gray-50 rounded-md col-span-2">
                              <div className="flex items-center mb-1">
                                <LocateFixed className="h-4 w-4 mr-1 text-eco-purple" />
                                <span className="text-sm font-medium">Last Location</span>
                              </div>
                              <p className="text-sm">
                                {sensorData.latitude.toFixed(4)}, {sensorData.longitude.toFixed(4)}
                              </p>
                              <Button variant="link" className="p-0 h-auto text-xs text-eco-purple">
                                View on Map
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Map className="h-5 w-5 mr-2 text-eco-purple" />
                      <h3 className="text-md font-semibold">Shipment Route</h3>
                    </div>
                    <div className="bg-gray-200 h-40 rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Map visualization would be displayed here
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Add missing components
const Check = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Leaf = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22l1-1c3.29-3.6 4-5.5 4-10V6a4 4 0 0 1 4-4h.09a6 6 0 0 1 5.91 6v4a10 10 0 0 1-2.1 6.26c-1.11 1.4-2.59 2.32-4.4 3.74-1.1.86-1.5 1-1.5 1l-1-1.5" />
    <path d="M2 6l7.9 4.6c1.68.93 3.18 1.29 5.1 1.36" />
  </svg>
);

const BarChart = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const ThermometerSun = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9a4 4 0 0 0-2 7.5" />
    <path d="M12 3v2" />
    <path d="M6.6 18.4l-1.4 1.4" />
    <path d="M18 2a2 2 0 0 1 2 2v10.5a4 4 0 1 1-4 0V4c0-1.1.9-2 2-2z" />
    <path d="M12 3a4.5 4.5 0 0 0 0 9" />
  </svg>
);

const Cloud = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 7A5 5 0 0 0 7 7m0 0a3 3 0 1 0-3 5h13a3 3 0 0 0 0-6h-1" />
  </svg>
);

export default TrackShipment;
