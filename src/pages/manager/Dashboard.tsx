
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BarChart3, ArrowUpRight, TruckIcon, PackageIcon, Leaf, AlertTriangle } from 'lucide-react';
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
  created_at: string;
  carbon_footprint: number;
  estimated_arrival_date: string | null;
}

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipments, setShipments] = useState<ShipmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    delayed: 0,
    totalCarbonFootprint: 0
  });

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setShipments(data || []);

        // Calculate stats
        if (data) {
          const inTransit = data.filter(s => s.status === 'in-transit').length;
          const delivered = data.filter(s => s.status === 'delivered').length;
          const delayed = data.filter(s => s.status === 'delayed').length;
          const totalCarbonFootprint = data.reduce((sum, shipment) => sum + (shipment.carbon_footprint || 0), 0);

          setStats({
            total: data.length,
            inTransit,
            delivered,
            delayed,
            totalCarbonFootprint
          });
        }
      } catch (error) {
        console.error('Error fetching shipments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load shipments data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipments();
  }, [toast]);

  const handleCreateShipment = () => {
    navigate('/manager/create-shipment');
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
            <h1 className="text-3xl font-bold" style={{ color: colors.secondary }}>Manager Dashboard</h1>
            <p className="text-muted-foreground">Manage your logistics operations</p>
          </div>
          <Button 
            className="mt-4 sm:mt-0 text-white" 
            style={{ backgroundColor: colors.accent }}
            onClick={handleCreateShipment}
          >
            <ArrowUpRight className="mr-2 h-4 w-4" /> New Shipment
          </Button>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <PackageIcon className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall shipments
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
                    Active shipments
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
                    Completed shipments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full p-2" style={{ backgroundColor: colors.primary }}>
                  <Leaf className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {stats.totalCarbonFootprint.toFixed(1)} kg
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total CO₂ emissions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent shipments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-8 w-8 border-4 border-t-transparent rounded-full" style={{ borderColor: colors.accent, borderTopColor: 'transparent' }}></div>
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No shipments found</p>
                <Button 
                  className="mt-4" 
                  style={{ backgroundColor: colors.accent, color: 'white' }}
                  onClick={handleCreateShipment}
                >
                  Create Your First Shipment
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Shipment</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Route</th>
                      <th className="text-left py-3 px-4 font-medium">Created</th>
                      <th className="text-left py-3 px-4 font-medium">ETA</th>
                      <th className="text-left py-3 px-4 font-medium">CO₂</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipments.slice(0, 5).map((shipment) => (
                      <tr key={shipment.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/shipment/${shipment.id}`)}>
                        <td className="py-3 px-4">{shipment.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(shipment.status)}`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-xs">{shipment.origin}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-1">
                              <path d="M5 12h14"></path>
                              <path d="m12 5 7 7-7 7"></path>
                            </svg>
                            <span className="text-xs">{shipment.destination}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(shipment.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(shipment.estimated_arrival_date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Leaf className="h-4 w-4 mr-1" style={{ color: colors.tertiary }} />
                            <span>{shipment.carbon_footprint} kg</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {shipments.length > 5 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" className="text-sm" onClick={() => navigate('/manager/shipments')}>
                      View All Shipments
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 border rounded-lg" style={{ borderColor: colors.primary, backgroundColor: colors.primary + '30' }}>
                <div style={{ backgroundColor: colors.primary }} className="p-2 rounded-full">
                  <Leaf className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <h3 className="font-medium">Switch to rail for Los Angeles shipments</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Switching from air freight to rail can reduce carbon emissions by up to 75% for your LA route.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      -52% CO₂
                    </span>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      +$1,200 savings
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 border rounded-lg" style={{ borderColor: colors.primary, backgroundColor: colors.primary + '30' }}>
                <div style={{ backgroundColor: colors.primary }} className="p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5" style={{ color: colors.tertiary }} />
                </div>
                <div>
                  <h3 className="font-medium">Consolidate Atlanta shipments</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have 3 half-empty trucks going to Atlanta next week. Consolidating could save fuel and reduce emissions.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      -28% CO₂
                    </span>
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      +$800 savings
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <Button style={{ backgroundColor: colors.accent, color: 'white' }} onClick={() => navigate('/manager/ai-suggestions')}>
                View All Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
