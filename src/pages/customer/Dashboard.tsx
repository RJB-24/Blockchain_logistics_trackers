
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Package, Search, BarChart3, Leaf, TruckIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  tracking_id: string;
  estimated_arrival_date: string | null;
  carbon_footprint: number;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myShipments, setMyShipments] = useState<ShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    totalCarbonSaved: 0
  });

  useEffect(() => {
    const fetchMyShipments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setMyShipments(data || []);

        // Calculate stats
        if (data) {
          const inTransit = data.filter(s => s.status === 'in-transit').length;
          const delivered = data.filter(s => s.status === 'delivered').length;
          
          // This is a simplified calculation. In a real app, you'd calculate actual carbon savings
          // based on comparison with traditional shipping methods
          const totalCarbonSaved = data.reduce((sum, shipment) => {
            // Assume 30% carbon saved compared to traditional methods
            return sum + (shipment.carbon_footprint * 0.3);
          }, 0);

          setStats({
            total: data.length,
            inTransit,
            delivered,
            totalCarbonSaved
          });
        }
      } catch (error) {
        console.error('Error fetching shipments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your shipments',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyShipments();
  }, [user, toast]);

  const handleTrackingSearch = () => {
    if (!trackingId.trim()) {
      toast({
        title: 'Required',
        description: 'Please enter a tracking ID',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/customer/track?id=${trackingId}`);
  };

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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.secondary }}>Customer Dashboard</h1>
            <p className="text-muted-foreground">Track and manage your shipments</p>
          </div>
        </div>

        {/* Tracking search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Track Your Shipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="flex-1"
              />
              <Button
                style={{ backgroundColor: colors.accent, color: 'white' }}
                onClick={handleTrackingSearch}
              >
                <Search className="mr-2 h-4 w-4" /> Track
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <Package className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your shipments
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
                    On the way
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
                    Completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Carbon Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <Leaf className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.totalCarbonSaved.toFixed(1)} kg
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CO₂ reduction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My shipments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}></div>
              </div>
            ) : myShipments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No shipments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myShipments.map((shipment) => (
                  <div 
                    key={shipment.id} 
                    className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => navigate(`/shipment/${shipment.id}`)}
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <h3 className="font-medium">{shipment.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(shipment.status)}`}>
                        {shipment.status}
                      </span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Tracking ID:</span> {shipment.tracking_id}
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA:</span> {formatDate(shipment.estimated_arrival_date)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Carbon Footprint:</span> {shipment.carbon_footprint} kg
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        className="text-white"
                        style={{ backgroundColor: colors.accent }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/track?id=${shipment.tracking_id}`);
                        }}
                      >
                        Track
                      </Button>
                      {shipment.status === 'delivered' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customer/review/${shipment.id}`);
                          }}
                        >
                          Leave Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sustainability insights */}
        <Card>
          <CardHeader>
            <CardTitle>Sustainability Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-800">Your Green Contribution</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Your sustainable shipping choices have saved <strong>{stats.totalCarbonSaved.toFixed(1)} kg</strong> of CO₂ emissions. 
                That's equivalent to planting <strong>{Math.round(stats.totalCarbonSaved / 5)}</strong> trees!
              </p>
              <Button 
                className="text-white"
                style={{ backgroundColor: colors.tertiary }}
                onClick={() => navigate('/customer/carbon')}
              >
                View Carbon Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
