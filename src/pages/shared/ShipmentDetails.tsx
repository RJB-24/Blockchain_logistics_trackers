
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  TruckIcon, 
  Package, 
  Leaf, 
  MapPin, 
  Calendar, 
  Info, 
  BarChart,
  ThermometerIcon,
  Droplets,
  Smartphone,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Define colors based on your provided color palette
const colors = {
  primary: '#f2f4d5',   // Light cream
  secondary: '#2e2c31', // Dark gray
  tertiary: '#3b431e',  // Olive green
  accent: '#6f61ef'     // Purple
};

interface ShipmentData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  origin: string;
  destination: string;
  tracking_id: string;
  planned_departure_date: string | null;
  estimated_arrival_date: string | null;
  actual_arrival_date: string | null;
  created_at: string;
  updated_at: string;
  product_type: string;
  quantity: number;
  weight: number | null;
  carbon_footprint: number;
  transport_type: string;
  assigned_driver_id: string | null;
  customer_id: string;
  blockchain_tx_hash: string | null;
}

interface SensorData {
  id: string;
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  shock_detected: boolean | null;
  latitude: number | null;
  longitude: number | null;
  battery_level: number | null;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  approved: boolean;
}

const ShipmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, userRole, getProfileById } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      if (!id) return;
      
      try {
        // Fetch shipment details
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', id)
          .single();

        if (shipmentError) throw shipmentError;
        setShipment(shipmentData);

        // Fetch customer details
        if (shipmentData.customer_id) {
          const customerProfile = await getProfileById(shipmentData.customer_id);
          setCustomer(customerProfile);
        }

        // Fetch driver details
        if (shipmentData.assigned_driver_id) {
          const driverProfile = await getProfileById(shipmentData.assigned_driver_id);
          setDriver(driverProfile);
        }

        // Fetch sensor data
        const { data: sensorDataResult, error: sensorError } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('shipment_id', id)
          .order('timestamp', { ascending: false });

        if (sensorError) throw sensorError;
        setSensorData(sensorDataResult || []);

        // Fetch reviews
        let reviewsQuery = supabase
          .from('reviews')
          .select('*')
          .eq('shipment_id', id);
          
        // If not a manager, only show approved reviews
        if (userRole !== 'manager') {
          reviewsQuery = reviewsQuery.eq('approved', true);
        }
          
        const { data: reviewsData, error: reviewsError } = await reviewsQuery
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

      } catch (error) {
        console.error('Error fetching shipment details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load shipment details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [id, getProfileById, toast, userRole]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'air':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>;
      case 'ship':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"></path><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"></path><path d="M12 10v4"></path><path d="M12 2v3"></path></svg>;
      case 'rail':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11v5h16v-5"></path><path d="M12 3v8"></path><path d="M8 16h8"></path><path d="M18 8.5V11"></path><path d="M6 8.5V11"></path><path d="M12 3c-1.96 0-3.5-1.54-3.5-3.5"></path><path d="M12 3c1.96 0 3.5-1.54 3.5-3.5"></path><path d="M4 16v5h16v-5"></path></svg>;
      case 'multi-modal':
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><path d="M11 18H8a2 2 0 0 1-2-2V9"></path></svg>;
      default: // truck
        return <TruckIcon className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!shipment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Shipment Not Found</h2>
          <p className="text-muted-foreground mb-6">The shipment you're looking for does not exist or you don't have permission to view it.</p>
          <Button
            style={{ backgroundColor: colors.accent, color: 'white' }}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold" style={{ color: colors.secondary }}>{shipment.title}</h1>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">Tracking ID: {shipment.tracking_id}</span>
              {shipment.blockchain_tx_hash && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-blue-600">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  <span className="text-blue-600">Blockchain Verified</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {userRole === 'manager' && (
              <Button 
                variant="outline"
                onClick={() => navigate('/manager/create-shipment', { state: { shipment }})}
              >
                Edit Shipment
              </Button>
            )}
            {userRole === 'driver' && shipment.status === 'in-transit' && (
              <Button 
                style={{ backgroundColor: colors.accent, color: 'white' }}
                onClick={() => navigate(`/driver/delivery?id=${shipment.id}`)}
              >
                Update Status
              </Button>
            )}
            {userRole === 'customer' && shipment.status === 'delivered' && (
              <Button 
                style={{ backgroundColor: colors.accent, color: 'white' }}
                onClick={() => navigate(`/customer/review/${shipment.id}`)}
              >
                Leave Review
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - shipment details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route and Transport Type */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <MapPin className="h-5 w-5 mr-2" style={{ color: colors.tertiary }} />
                      <h3 className="font-medium">Route</h3>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="font-medium">{shipment.origin}</div>
                        <div className="text-sm text-muted-foreground">Origin</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center">
                          <div className="h-0.5 w-10 bg-gray-300"></div>
                          <div className="mx-2">
                            {getTransportIcon(shipment.transport_type)}
                          </div>
                          <div className="h-0.5 w-10 bg-gray-300"></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {shipment.transport_type.charAt(0).toUpperCase() + shipment.transport_type.slice(1)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{shipment.destination}</div>
                        <div className="text-sm text-muted-foreground">Destination</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(shipment.origin)}&destination=${encodeURIComponent(shipment.destination)}`, '_blank')}
                      >
                        View on Map
                      </Button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Calendar className="h-5 w-5 mr-2" style={{ color: colors.tertiary }} />
                      <h3 className="font-medium">Timeline</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="mr-3 flex flex-col items-center">
                          <div className="rounded-full h-8 w-8 flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.tertiary }}><path d="M12 22V8"></path><path d="m2 14 10-6 10 6"></path><path d="M18 13v9"></path><path d="M2 5h20"></path><path d="M2 2h20"></path></svg>
                          </div>
                          <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">Created</h4>
                          <p className="text-sm text-muted-foreground">{formatDate(shipment.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="mr-3 flex flex-col items-center">
                          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                            shipment.planned_departure_date ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={shipment.planned_departure_date ? 'text-blue-600' : 'text-gray-400'}><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"></path><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"></path><circle cx="7" cy="18" r="2"></circle><path d="M15 18H9"></path><circle cx="17" cy="18" r="2"></circle></svg>
                          </div>
                          <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">Planned Departure</h4>
                          <p className="text-sm text-muted-foreground">{formatDate(shipment.planned_departure_date)}</p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="mr-3 flex flex-col items-center">
                          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                            shipment.status === 'in-transit' || shipment.status === 'delivered' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <TruckIcon className={`h-4 w-4 ${
                              shipment.status === 'in-transit' || shipment.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="h-full w-0.5 bg-gray-200 mt-1"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">In Transit</h4>
                          <p className="text-sm text-muted-foreground">
                            {shipment.status === 'in-transit' || shipment.status === 'delivered'
                              ? `Started ${formatDate(shipment.updated_at)}`
                              : 'Not started yet'}
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <div className="mr-3 flex flex-col items-center">
                          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                            shipment.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={shipment.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">Delivered</h4>
                          <p className="text-sm text-muted-foreground">
                            {shipment.status === 'delivered'
                              ? formatDate(shipment.actual_arrival_date)
                              : `Expected ${formatDate(shipment.estimated_arrival_date)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Information */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Package className="h-5 w-5 mr-2" style={{ color: colors.tertiary }} />
                      <h3 className="font-medium">Product Information</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Product Type</div>
                        <div>{shipment.product_type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div>{shipment.quantity} units</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Weight</div>
                        <div>{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {shipment.description && (
                    <div>
                      <div className="flex items-center mb-3">
                        <Info className="h-5 w-5 mr-2" style={{ color: colors.tertiary }} />
                        <h3 className="font-medium">Description</h3>
                      </div>
                      <p className="text-sm">{shipment.description}</p>
                    </div>
                  )}

                  {/* Carbon Footprint */}
                  <div>
                    <div className="flex items-center mb-3">
                      <Leaf className="h-5 w-5 mr-2" style={{ color: colors.tertiary }} />
                      <h3 className="font-medium">Sustainability</h3>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm text-green-700">Carbon Footprint</div>
                          <div className="text-xl font-semibold text-green-800">{shipment.carbon_footprint} kg CO₂</div>
                        </div>
                        <div>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            30% below average
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-green-700">
                        This {shipment.transport_type} shipment produces {shipment.carbon_footprint} kg of CO₂, which is equivalent to driving a car for {Math.round(shipment.carbon_footprint * 4)} miles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IoT Sensor Data */}
            {sensorData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Real-Time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Latest Readings */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <ThermometerIcon className="h-4 w-4 mr-1 text-blue-600" />
                          <div className="text-sm font-medium">Temperature</div>
                        </div>
                        <div className="font-semibold text-lg">
                          {sensorData[0].temperature !== null ? `${sensorData[0].temperature}°C` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Droplets className="h-4 w-4 mr-1 text-blue-600" />
                          <div className="text-sm font-medium">Humidity</div>
                        </div>
                        <div className="font-semibold text-lg">
                          {sensorData[0].humidity !== null ? `${sensorData[0].humidity}%` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                          <div className="text-sm font-medium">Shock</div>
                        </div>
                        <div className="font-semibold text-lg">
                          {sensorData[0].shock_detected === true ? 'Detected' : 'None'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Smartphone className="h-4 w-4 mr-1 text-green-600" />
                          <div className="text-sm font-medium">Battery</div>
                        </div>
                        <div className="font-semibold text-lg">
                          {sensorData[0].battery_level !== null ? `${sensorData[0].battery_level}%` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Sensor History Table */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Sensor History</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-medium">Timestamp</th>
                              <th className="text-left py-2 px-3 font-medium">Temp (°C)</th>
                              <th className="text-left py-2 px-3 font-medium">Humidity (%)</th>
                              <th className="text-left py-2 px-3 font-medium">Location</th>
                              <th className="text-left py-2 px-3 font-medium">Shock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sensorData.slice(0, 5).map((reading) => (
                              <tr key={reading.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">{formatDate(reading.timestamp)}</td>
                                <td className="py-2 px-3">{reading.temperature !== null ? reading.temperature : 'N/A'}</td>
                                <td className="py-2 px-3">{reading.humidity !== null ? reading.humidity : 'N/A'}</td>
                                <td className="py-2 px-3">
                                  {reading.latitude !== null && reading.longitude !== null
                                    ? (
                                        <Button 
                                          variant="link" 
                                          className="p-0 h-auto text-blue-600" 
                                          onClick={() => window.open(`https://www.google.com/maps?q=${reading.latitude},${reading.longitude}`, '_blank')}
                                        >
                                          View
                                        </Button>
                                      )
                                    : 'N/A'
                                  }
                                </td>
                                <td className="py-2 px-3">
                                  {reading.shock_detected === true
                                    ? <span className="text-red-600">Yes</span>
                                    : <span className="text-green-600">No</span>
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-6">
            {/* Blockchain Information */}
            {shipment.blockchain_tx_hash && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Blockchain Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs break-all mb-3 bg-gray-50 p-2 rounded font-mono">
                    {shipment.blockchain_tx_hash}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => window.open(`https://etherscan.io/tx/${shipment.blockchain_tx_hash}`, '_blank')}
                  >
                    View on Blockchain Explorer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer && (
                  <div>
                    <div className="text-xs text-muted-foreground">Customer</div>
                    <div className="font-medium">{customer.full_name}</div>
                  </div>
                )}
                {driver && (
                  <div>
                    <div className="text-xs text-muted-foreground">Driver</div>
                    <div className="font-medium">{driver.full_name}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            ))}
                          </div>
                          {userRole === 'manager' && (
                            <div>
                              {review.approved ? (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Approved</span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">Pending</span>
                              )}
                            </div>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-sm">{review.comment}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(review.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipmentDetails;
