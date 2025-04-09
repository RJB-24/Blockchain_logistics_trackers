import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MapView from '@/components/dashboard/MapView';
import { toast } from 'sonner';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Package, 
  Search, 
  Calendar, 
  ArrowRight, 
  Leaf, 
  FileText, 
  Star, 
  AlertTriangle, 
  Ship, 
  Train 
} from 'lucide-react';

interface Shipment {
  id: string;
  title: string;
  tracking_id: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'delayed';
  origin: string;
  destination: string;
  customer_id: string;
  carbon_footprint: number;
  planned_departure_date: string;
  estimated_arrival_date: string;
  actual_arrival_date: string | null;
  transport_type: string;
  product_type: string;
  quantity: number;
  weight: number;
  blockchain_tx_hash?: string;
}

interface SensorData {
  id: string;
  shipment_id: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  location: string;
  notes: string | null;
  battery_level: number | null;
  shock_detected: boolean;
  blockchain_tx_hash?: string;
}

const TrackShipment = () => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState('status');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserShipments();
  }, [user?.id]);

  const fetchUserShipments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('tracking_id')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setTrackingId(data[0].tracking_id);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    }
  };

  const handleSearch = async () => {
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }
    
    setLoading(true);
    setNotFound(false);
    setShipment(null);
    setSensorData([]);
    
    try {
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_id', trackingId.trim())
        .maybeSingle();
      
      if (shipmentError) throw shipmentError;
      
      if (!shipmentData) {
        setNotFound(true);
        return;
      }
      
      if (user && shipmentData.customer_id !== user.id) {
        setNotFound(true);
        toast.error('This shipment does not belong to your account');
        return;
      }
      
      setShipment(shipmentData as Shipment);
      
      const { data: sensorDataResult, error: sensorError } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('timestamp', { ascending: true });
      
      if (sensorError) throw sensorError;
      
      if (sensorDataResult) {
        const formattedSensorData: SensorData[] = sensorDataResult.map(data => ({
          id: data.id,
          shipment_id: data.shipment_id,
          timestamp: data.timestamp,
          temperature: data.temperature,
          humidity: data.humidity,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status || 'unknown',
          location: data.location || 'Unknown location',
          notes: data.notes || null,
          battery_level: data.battery_level,
          shock_detected: data.shock_detected || false,
          blockchain_tx_hash: data.blockchain_tx_hash
        }));
        
        setSensorData(formattedSensorData);
      }
      
    } catch (err) {
      console.error('Error tracking shipment:', err);
      toast.error('Failed to retrieve shipment information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'processing':
        return 1;
      case 'in-transit':
        return 2;
      case 'delivered':
        return 4;
      case 'delayed':
        return 3;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'in-transit':
        return <Badge className="bg-blue-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'delayed':
        return <Badge className="bg-red-500">Delayed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getLatestLocation = () => {
    if (sensorData.length === 0) return 'N/A';
    
    const latestData = [...sensorData]
      .filter(data => data.location)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    return latestData?.location || 'N/A';
  };

  const getMostRecentCoordinates = () => {
    if (sensorData.length === 0) return null;
    
    const latestData = [...sensorData]
      .filter(data => data.latitude !== null && data.longitude !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (!latestData || latestData.latitude === null || latestData.longitude === null) {
      return null;
    }
    
    return {
      lat: latestData.latitude,
      lng: latestData.longitude
    };
  };

  const calculateProgress = () => {
    if (!shipment) return 0;
    
    const statusStep = getStatusStep(shipment.status);
    return (statusStep / 4) * 100;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-eco-dark">Track Shipment</h1>
          <p className="text-muted-foreground">Monitor the status and location of your shipments</p>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Tracking ID</CardTitle>
            <CardDescription>
              Enter your shipment's tracking ID to get real-time updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g. ECO-12345"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="bg-eco-purple hover:bg-eco-purple/90"
              >
                {loading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Track</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {notFound && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Shipment not found</AlertTitle>
            <AlertDescription>
              We couldn't find a shipment with the tracking ID you provided. Please check the ID and try again.
            </AlertDescription>
          </Alert>
        )}
        
        {shipment && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{shipment.title}</CardTitle>
                    <CardDescription>
                      Tracking ID: {shipment.tracking_id}
                    </CardDescription>
                  </div>
                  <div>
                    {getStatusBadge(shipment.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Shipment Progress</p>
                  <Progress value={calculateProgress()} className="h-2" />
                  
                  <div className="flex justify-between mt-2 text-xs">
                    <div className={`text-center ${shipment.status === 'processing' ? 'text-eco-purple font-medium' : 'text-muted-foreground'}`}>
                      Processing
                    </div>
                    <div className={`text-center ${shipment.status === 'in-transit' ? 'text-eco-purple font-medium' : 'text-muted-foreground'}`}>
                      In Transit
                    </div>
                    <div className={`text-center ${shipment.status === 'delayed' ? 'text-eco-purple font-medium' : 'text-muted-foreground'}`}>
                      Delayed
                    </div>
                    <div className={`text-center ${shipment.status === 'delivered' ? 'text-eco-purple font-medium' : 'text-muted-foreground'}`}>
                      Delivered
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">From</span>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-eco-purple mr-1" />
                      <span className="font-medium">{shipment.origin}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">To</span>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-eco-purple mr-1" />
                      <span className="font-medium">{shipment.destination}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Current Location</span>
                    <div className="flex items-center mt-1">
                      <Truck className="h-4 w-4 text-eco-purple mr-1" />
                      <span className="font-medium">{getLatestLocation()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Departure Date</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-eco-purple mr-1" />
                      <span className="font-medium">{formatDate(shipment.planned_departure_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Estimated Arrival</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-eco-purple mr-1" />
                      <span className="font-medium">{formatDate(shipment.estimated_arrival_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Actual Arrival</span>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-eco-purple mr-1" />
                      <span className="font-medium">{formatDate(shipment.actual_arrival_date)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col p-4 border rounded-lg">
                    <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                    <div className="flex items-center mt-1">
                      <Leaf className="h-4 w-4 text-green-500 mr-1" />
                      <span className="font-medium">{shipment.carbon_footprint} kg CO₂</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {shipment.product_type} • {shipment.quantity} units • {shipment.weight} kg
                    </span>
                  </div>
                  
                  {shipment.blockchain_tx_hash && (
                    <Badge variant="outline" className="border-eco-purple text-eco-purple">
                      Blockchain Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/customer/carbon')}
                    className="flex items-center"
                  >
                    <Leaf className="mr-2 h-4 w-4 text-green-500" />
                    View Carbon Report
                  </Button>
                  
                  {shipment.status === 'delivered' && (
                    <Button
                      onClick={() => navigate(`/customer/review/${shipment.id}`)}
                      className="bg-eco-purple hover:bg-eco-purple/90"
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Leave a Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Shipment Tracking</CardTitle>
                  <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                      <TabsTrigger value="status">Status Updates</TabsTrigger>
                      <TabsTrigger value="map">Map View</TabsTrigger>
                      <TabsTrigger value="sensor">Sensor Data</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="status" className="space-y-0">
                    {sensorData.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No status updates available yet</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute top-0 bottom-0 left-7 border-l-2 border-dashed border-muted"></div>
                        
                        <div className="space-y-8">
                          {sensorData.map((data, index) => (
                            <div key={data.id} className="relative pl-12">
                              <div className="absolute left-[14px] -translate-x-1/2 h-5 w-5 rounded-full bg-eco-purple flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                              
                              <div className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center">
                                      {getStatusBadge(data.status)}
                                      <span className="ml-2 font-medium">{data.location}</span>
                                    </div>
                                    <p className="text-sm mt-1 text-muted-foreground">
                                      {new Date(data.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                
                                {data.notes && (
                                  <p className="mt-2 text-sm">{data.notes}</p>
                                )}
                                
                                {(data.temperature !== null || data.humidity !== null) && (
                                  <div className="mt-2 grid grid-cols-2 gap-4">
                                    {data.temperature !== null && (
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Temperature:</span>{' '}
                                        <span>{data.temperature}°C</span>
                                      </div>
                                    )}
                                    {data.humidity !== null && (
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Humidity:</span>{' '}
                                        <span>{data.humidity}%</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="map">
                    <div className="h-[400px] w-full rounded-md overflow-hidden border">
                      <MapView
                        originLocation={shipment.origin}
                        destinationLocation={shipment.destination}
                        currentLocation={getMostRecentCoordinates()}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sensor">
                    {sensorData.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No sensor data available</p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Timestamp</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Temperature</TableHead>
                              <TableHead>Humidity</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sensorData.map((data) => (
                              <TableRow key={data.id}>
                                <TableCell>
                                  {new Date(data.timestamp).toLocaleString()}
                                </TableCell>
                                <TableCell>{data.location || 'N/A'}</TableCell>
                                <TableCell>{data.temperature !== null ? `${data.temperature}°C` : 'N/A'}</TableCell>
                                <TableCell>{data.humidity !== null ? `${data.humidity}%` : 'N/A'}</TableCell>
                                <TableCell>{getStatusBadge(data.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TrackShipment;
