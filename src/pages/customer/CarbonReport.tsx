import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBlockchain } from '@/hooks/useBlockchain';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import CarbonFootprintChart from '@/components/sustainability/CarbonFootprintChart';
import SustainabilityScore from '@/components/sustainability/SustainabilityScore';
import { toast } from 'sonner';
import { Leaf, Package, Info, Truck, Ship, Train, Download, FileCheck, FileText, CheckCircle } from 'lucide-react';

// Define interfaces
interface Shipment {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  origin: string;
  destination: string;
  customer_id: string;
  carbon_footprint: number;
  transport_type: string;
  created_at: string;
  blockchain_tx_hash?: string;
}

interface MonthlyCarbon {
  month: string;
  carbon: number;
}

interface TransportTypeBreakdown {
  type: string;
  percentage: number;
  carbon: number;
  count: number;
}

interface CarbonStats {
  totalCarbon: number;
  totalShipments: number;
  averageCarbon: number;
  sustainabilityScore: number;
  bestShipment: Shipment | null;
  worstShipment: Shipment | null;
  monthlyData: MonthlyCarbon[];
  transportBreakdown: TransportTypeBreakdown[];
  verifiedPercentage: number;
}

const CarbonReport = () => {
  const [stats, setStats] = useState<CarbonStats>({
    totalCarbon: 0,
    totalShipments: 0,
    averageCarbon: 0,
    sustainabilityScore: 0,
    bestShipment: null,
    worstShipment: null,
    monthlyData: [],
    transportBreakdown: [],
    verifiedPercentage: 0
  });
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const { user } = useAuth();
  const { verifyBlockchainRecord } = useBlockchain();

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch all shipments for the current user
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_id', user.id);
      
      if (shipmentsError) throw shipmentsError;
      
      if (!shipmentsData) {
        console.log('No shipments found for this user.');
        setLoading(false);
        return;
      }
      
      setShipments(shipmentsData as Shipment[]);
      
      // Calculate total carbon footprint
      const totalCarbon = shipmentsData.reduce((sum, shipment) => sum + shipment.carbon_footprint, 0);
      
      // Calculate average carbon footprint
      const totalShipments = shipmentsData.length;
      const averageCarbon = totalShipments > 0 ? totalCarbon / totalShipments : 0;
      
      // Determine best and worst shipment based on carbon footprint
      const bestShipment = shipmentsData.reduce((min, shipment) =>
        shipment.carbon_footprint < min.carbon_footprint ? shipment : min, shipmentsData[0] || { carbon_footprint: Infinity }
      );
      const worstShipment = shipmentsData.reduce((max, shipment) =>
        shipment.carbon_footprint > max.carbon_footprint ? shipment : max, shipmentsData[0] || { carbon_footprint: 0 }
      );
      
      // Calculate monthly carbon footprint
      const monthlyData: MonthlyCarbon[] = [];
      const monthlyCarbonMap: { [month: string]: number } = {};
      
      shipmentsData.forEach(shipment => {
        const date = new Date(shipment.created_at);
        const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        if (monthlyCarbonMap[month]) {
          monthlyCarbonMap[month] += shipment.carbon_footprint;
        } else {
          monthlyCarbonMap[month] = shipment.carbon_footprint;
        }
      });
      
      for (const month in monthlyCarbonMap) {
        monthlyData.push({ month, carbon: monthlyCarbonMap[month] });
      }
      
      // Calculate transport type breakdown
      const transportBreakdownMap: { [type: string]: { carbon: number; count: number } } = {};
      
      shipmentsData.forEach(shipment => {
        const type = shipment.transport_type;
        
        if (transportBreakdownMap[type]) {
          transportBreakdownMap[type].carbon += shipment.carbon_footprint;
          transportBreakdownMap[type].count++;
        } else {
          transportBreakdownMap[type] = { carbon: shipment.carbon_footprint, count: 1 };
        }
      });
      
      const transportBreakdown: TransportTypeBreakdown[] = Object.entries(transportBreakdownMap).map(([type, data]) => ({
        type,
        percentage: (data.count / totalShipments) * 100,
        carbon: data.carbon,
        count: data.count
      }));
      
      // Calculate sustainability score (example logic)
      const sustainabilityScore = calculateSustainabilityScore(averageCarbon, transportBreakdown);
      
      // Calculate percentage of shipments verified on blockchain
      const verifiedCount = shipmentsData.filter(shipment => shipment.blockchain_tx_hash).length;
      const verifiedPercentage = (verifiedCount / totalShipments) * 100;
      
      // Set the calculated stats
      setStats({
        totalCarbon,
        totalShipments,
        averageCarbon,
        sustainabilityScore,
        bestShipment: bestShipment === shipmentsData[0] ? null : bestShipment as Shipment,
        worstShipment: worstShipment === shipmentsData[0] ? null : worstShipment as Shipment,
        monthlyData,
        transportBreakdown,
        verifiedPercentage
      });
      
    } catch (err: any) {
      console.error('Error fetching carbon footprint data:', err);
      toast.error('Failed to load carbon footprint data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSustainabilityScore = (averageCarbon: number, transportBreakdown: TransportTypeBreakdown[]): number => {
    let score = 100;
    
    // Reduce score based on average carbon footprint
    if (averageCarbon > 50) {
      score -= 20;
    } else if (averageCarbon > 20) {
      score -= 10;
    }
    
    // Increase score if using eco-friendly transport
    transportBreakdown.forEach(item => {
      if (item.type === 'rail' || item.type === 'ship') {
        score += 5;
      }
    });
    
    return Math.max(0, Math.min(100, score)); // Ensure score is within 0-100 range
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return <Truck className="mr-1 h-4 w-4" />;
      case 'ship':
        return <Ship className="mr-1 h-4 w-4" />;
      case 'rail':
        return <Train className="mr-1 h-4 w-4" />;
      default:
        return <Truck className="mr-1 h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-eco-dark">Carbon Footprint Report</h1>
          <p className="text-muted-foreground">Track and analyze the environmental impact of your shipments</p>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="trends">Trends & Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Carbon Footprint</CardTitle>
                  <CardDescription>Total carbon emissions from all your shipments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCarbon.toFixed(2)} kg CO₂</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Leaf className="mr-2 h-4 w-4 text-green-500" />
                    Compared to last month: N/A
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Shipments</CardTitle>
                  <CardDescription>Number of shipments made</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalShipments}</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Package className="mr-2 h-4 w-4" />
                    Since account creation
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Average Carbon per Shipment</CardTitle>
                  <CardDescription>Average carbon emissions per shipment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageCarbon.toFixed(2)} kg CO₂</div>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Info className="mr-2 h-4 w-4" />
                    Based on all shipments
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sustainability Score</CardTitle>
                  <CardDescription>Overall sustainability score based on your shipping habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <SustainabilityScore score={stats.sustainabilityScore} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Blockchain Verification</CardTitle>
                  <CardDescription>Percentage of shipments verified on the blockchain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verifiedPercentage.toFixed(2)}%</div>
                  <Progress value={stats.verifiedPercentage} className="mt-4" />
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <FileCheck className="mr-2 h-4 w-4 text-green-500" />
                    Ensuring transparency and trust
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Carbon Footprint</CardTitle>
                <CardDescription>Carbon emissions from your shipments over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CarbonFootprintChart data={stats.monthlyData} />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Best Performing Shipment</CardTitle>
                  <CardDescription>Shipment with the lowest carbon footprint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.bestShipment ? (
                    <>
                      <p className="text-lg font-medium">{stats.bestShipment.title}</p>
                      <p className="text-sm text-muted-foreground">Tracking ID: {stats.bestShipment.tracking_id}</p>
                      <div className="flex items-center">
                        <Leaf className="mr-2 h-4 w-4 text-green-500" />
                        <span>{stats.bestShipment.carbon_footprint} kg CO₂</span>
                      </div>
                    </>
                  ) : (
                    <p>No data available</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Worst Performing Shipment</CardTitle>
                  <CardDescription>Shipment with the highest carbon footprint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.worstShipment ? (
                    <>
                      <p className="text-lg font-medium">{stats.worstShipment.title}</p>
                      <p className="text-sm text-muted-foreground">Tracking ID: {stats.worstShipment.tracking_id}</p>
                      <div className="flex items-center">
                        <Leaf className="mr-2 h-4 w-4 text-red-500" />
                        <span>{stats.worstShipment.carbon_footprint} kg CO₂</span>
                      </div>
                    </>
                  ) : (
                    <p>No data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="shipments">
            <Card>
              <CardHeader>
                <CardTitle>Shipment List</CardTitle>
                <CardDescription>A list of all your shipments</CardDescription>
              </CardHeader>
              <CardContent>
                {shipments.length === 0 ? (
                  <div className="text-center py-4">No shipments found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tracking ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Origin
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Destination
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transport
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbon (kg CO₂)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {shipments.map((shipment) => (
                          <tr key={shipment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{shipment.tracking_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{shipment.origin}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{shipment.destination}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getTransportIcon(shipment.transport_type)}
                                {shipment.transport_type}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{shipment.carbon_footprint}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {shipment.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Transport Type Breakdown</CardTitle>
                <CardDescription>Carbon footprint distribution by transport type</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.transportBreakdown.length === 0 ? (
                  <div>No data available</div>
                ) : (
                  <div className="space-y-4">
                    {stats.transportBreakdown.map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getTransportIcon(item.type)}
                          <span>{item.type}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.percentage.toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">{item.carbon.toFixed(2)} kg CO₂</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CarbonReport;
