
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TruckIcon, Package, BarChart, Route as RouteIcon, MapPin, AlertTriangle } from 'lucide-react';
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
  status: string;
  origin: string;
  destination: string;
  estimated_arrival_date: string | null;
  product_type: string;
  quantity: number;
}

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignedShipments, setAssignedShipments] = useState<ShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    inTransit: 0,
    delivered: 0
  });

  useEffect(() => {
    const fetchAssignedShipments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('assigned_driver_id', user.id)
          .order('estimated_arrival_date', { ascending: true });

        if (error) throw error;

        setAssignedShipments(data || []);

        // Calculate stats
        if (data) {
          const inTransit = data.filter(s => s.status === 'in-transit').length;
          const delivered = data.filter(s => s.status === 'delivered').length;

          setStats({
            assigned: data.length,
            inTransit,
            delivered
          });
        }
      } catch (error) {
        console.error('Error fetching assigned shipments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your assigned shipments',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedShipments();
  }, [user, toast]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const getPriorityClass = (date: string | null) => {
    if (!date) return 'bg-gray-100 text-gray-800';
    
    const today = new Date();
    const etaDate = new Date(date);
    const diffTime = etaDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays < 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.secondary }}>Driver Dashboard</h1>
            <p className="text-muted-foreground">Manage your assigned shipments and deliveries</p>
          </div>
          <Button 
            className="mt-4 sm:mt-0 text-white" 
            style={{ backgroundColor: colors.accent }}
            onClick={() => navigate('/driver/route')}
          >
            <RouteIcon className="mr-2 h-4 w-4" /> Optimize Route
          </Button>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Assigned Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <Package className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.assigned}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total assignments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <TruckIcon className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.inTransit}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current deliveries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2 bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.delivered}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed deliveries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned shipments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assigned Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}></div>
              </div>
            ) : assignedShipments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No shipments assigned to you</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedShipments.map((shipment) => (
                  <div 
                    key={shipment.id} 
                    className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => navigate(`/shipment/${shipment.id}`)}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <h3 className="font-medium">{shipment.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(shipment.status)}`}>
                          {shipment.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityClass(shipment.estimated_arrival_date)}`}>
                          {getPriorityClass(shipment.estimated_arrival_date) === 'bg-red-100 text-red-800'
                            ? 'Urgent'
                            : getPriorityClass(shipment.estimated_arrival_date) === 'bg-yellow-100 text-yellow-800'
                            ? 'High'
                            : 'Normal'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{shipment.origin}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-1">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                      <span>{shipment.destination}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Product:</span> {shipment.product_type}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quantity:</span> {shipment.quantity} units
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA:</span> {formatDate(shipment.estimated_arrival_date)}
                      </div>
                    </div>
                    {shipment.status === 'in-transit' && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          className="mr-2 text-white"
                          style={{ backgroundColor: colors.accent }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/driver/delivery?id=${shipment.id}`);
                          }}
                        >
                          Update Status
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(shipment.origin)}&destination=${encodeURIComponent(shipment.destination)}`, '_blank');
                          }}
                        >
                          Open in Maps
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4 p-4 border rounded-lg" style={{ borderColor: colors.primary, backgroundColor: colors.primary + '30' }}>
              <div className="rounded-full p-2 bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Heavy Rain Warning</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Heavy rain expected along the I-95 corridor between New York and Philadelphia. Consider alternate routes if possible.
                </p>
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open('https://weather.gov', '_blank')}
                  >
                    View Weather Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
