import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Leaf, Download, AlertTriangle, TrendingDown, Truck, Ship, Train } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';
import CarbonFootprintChart from '@/components/sustainability/CarbonFootprintChart';
import SustainabilityScore from '@/components/sustainability/SustainabilityScore';

// Define interfaces for data types
interface Shipment {
  id: string;
  title: string;
  tracking_id: string;
  status: string;
  origin: string;
  destination: string;
  customer_id: string;
  transport_type: string;
  carbon_footprint: number;
  created_at: string;
}

interface CarbonData {
  totalFootprint: number;
  averagePerShipment: number;
  transportBreakdown: {
    truck: number;
    rail: number;
    ship: number;
    air: number;
    multimodal: number;
  };
  monthlyData: {
    month: string;
    carbon: number;
  }[];
  reductionTips: string[];
  sustainabilityScore: number;
}

const CarbonReport = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [verifying, setVerifying] = useState(false);
  const { user } = useAuth();
  const { verifyOnBlockchain } = useBlockchain();

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user, period]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      
      // Define the time period for filtering
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Fetch shipments for the user within the time period
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setShipments(data || []);
      
      // Process the data to generate carbon report
      if (data && data.length > 0) {
        processShipmentData(data);
      } else {
        setCarbonData(null);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
      toast.error('Failed to load carbon data');
    } finally {
      setLoading(false);
    }
  };

  const processShipmentData = (data: Shipment[]) => {
    // Calculate total carbon footprint
    const totalFootprint = data.reduce((sum, shipment) => sum + shipment.carbon_footprint, 0);
    
    // Calculate average per shipment
    const averagePerShipment = totalFootprint / data.length;
    
    // Calculate transport type breakdown
    const transportBreakdown = {
      truck: 0,
      rail: 0,
      ship: 0,
      air: 0,
      multimodal: 0
    };
    
    data.forEach(shipment => {
      const type = shipment.transport_type === 'multi-modal' ? 'multimodal' : shipment.transport_type;
      if (type in transportBreakdown) {
        transportBreakdown[type as keyof typeof transportBreakdown] += shipment.carbon_footprint;
      }
    });
    
    // Generate monthly data for chart
    const monthlyData: { month: string; carbon: number }[] = [];
    const months: Record<string, number> = {};
    
    data.forEach(shipment => {
      const date = new Date(shipment.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = 0;
      }
      
      months[monthYear] += shipment.carbon_footprint;
    });
    
    Object.entries(months).forEach(([month, carbon]) => {
      monthlyData.push({ month, carbon });
    });
    
    // Sort monthly data chronologically
    monthlyData.sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
    });
    
    // Generate reduction tips based on transport types
    const reductionTips: string[] = [];
    
    if (transportBreakdown.truck > 0) {
      reductionTips.push('Consider using rail transport for long-distance shipments to reduce emissions by up to 75%.');
    }
    
    if (transportBreakdown.air > 0) {
      reductionTips.push('Air freight has the highest carbon footprint. When possible, use sea or rail alternatives.');
    }
    
    if (transportBreakdown.ship > 0 && transportBreakdown.ship < totalFootprint * 0.5) {
      reductionTips.push('Increase the proportion of sea freight in your logistics mix for better sustainability.');
    }
    
    reductionTips.push('Consolidate shipments to reduce the total number of trips and associated emissions.');
    reductionTips.push('Choose carriers with eco-friendly vehicle fleets and carbon offset programs.');
    
    // Calculate sustainability score (0-100)
    // This is a simplified calculation for demo purposes
    let sustainabilityScore = 0;
    
    // Lower average carbon footprint is better
    if (averagePerShipment < 50) sustainabilityScore += 30;
    else if (averagePerShipment < 100) sustainabilityScore += 20;
    else if (averagePerShipment < 200) sustainabilityScore += 10;
    
    // More sustainable transport types (ship, rail) get higher scores
    const sustainableTransport = transportBreakdown.ship + transportBreakdown.rail;
    const unsustainableTransport = transportBreakdown.truck + transportBreakdown.air;
    
    if (sustainableTransport > unsustainableTransport) {
      sustainabilityScore += 40;
    } else if (sustainableTransport > 0) {
      sustainabilityScore += 20;
    }
    
    // Bonus points for having multiple transport types (multimodal)
    if (transportBreakdown.multimodal > 0) {
      sustainabilityScore += 10;
    }
    
    // Base score that everyone gets
    sustainabilityScore += 20;
    
    // Cap at 100
    sustainabilityScore = Math.min(sustainabilityScore, 100);
    
    setCarbonData({
      totalFootprint,
      averagePerShipment,
      transportBreakdown,
      monthlyData,
      reductionTips,
      sustainabilityScore
    });
  };

  const verifyReportOnBlockchain = async () => {
    if (!carbonData || !user) return;
    
    try {
      setVerifying(true);
      
      const blockchainData = {
        userId: user.id,
        totalCarbonFootprint: carbonData.totalFootprint,
        sustainabilityScore: carbonData.sustainabilityScore,
        timestamp: new Date().toISOString()
      };
      
      const txHash = await verifyOnBlockchain(blockchainData);
      
      if (txHash) {
        toast.success('Carbon report verified on blockchain');
      }
    } catch (err) {
      console.error('Error verifying on blockchain:', err);
      toast.error('Failed to verify report on blockchain');
    } finally {
      setVerifying(false);
    }
  };

  const downloadReport = () => {
    if (!carbonData) return;
    
    // In a real app, this would generate a PDF report
    // For this demo, we'll just show a toast
    toast.success('Carbon report downloaded');
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'truck':
        return <Truck className="h-4 w-4" />;
      case 'ship':
        return <Ship className="h-4 w-4" />;
      case 'rail':
        return <Train className="h-4 w-4" />;
      default:
        return <Truck className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Carbon Footprint Report</h1>
            <p className="text-muted-foreground">Track and analyze your shipping emissions</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={downloadReport}
              disabled={!carbonData || loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
            
            <Button 
              onClick={verifyReportOnBlockchain}
              disabled={!carbonData || verifying || loading}
              className="bg-eco-purple hover:bg-eco-purple/90"
            >
              {verifying ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Leaf className="mr-2 h-4 w-4" />
                  Verify on Blockchain
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <Tabs defaultValue={period} onValueChange={(value) => setPeriod(value as any)}>
            <TabsList>
              <TabsTrigger value="month">Last Month</TabsTrigger>
              <TabsTrigger value="quarter">Last Quarter</TabsTrigger>
              <TabsTrigger value="year">Last Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-eco-purple border-t-transparent rounded-full"></div>
          </div>
        ) : !carbonData ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              We couldn't find any shipment data for the selected period. Try selecting a different time range or check back after you've completed some shipments.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Carbon Footprint</CardTitle>
                  <CardDescription>For the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Leaf className="h-8 w-8 text-green-500 mr-2" />
                    <span className="text-3xl font-bold">{carbonData.totalFootprint.toFixed(2)}</span>
                    <span className="ml-1 text-muted-foreground">kg CO₂</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    From {shipments.length} shipments
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Average per Shipment</CardTitle>
                  <CardDescription>Carbon efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <TrendingDown className="h-8 w-8 text-eco-purple mr-2" />
                    <span className="text-3xl font-bold">{carbonData.averagePerShipment.toFixed(2)}</span>
                    <span className="ml-1 text-muted-foreground">kg CO₂</span>
                  </div>
                  
                  {carbonData.averagePerShipment < 100 ? (
                    <Badge className="mt-2 bg-green-500">Low Emissions</Badge>
                  ) : carbonData.averagePerShipment < 200 ? (
                    <Badge className="mt-2 bg-yellow-500">Medium Emissions</Badge>
                  ) : (
                    <Badge className="mt-2 bg-red-500">High Emissions</Badge>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sustainability Score</CardTitle>
                  <CardDescription>Based on your shipping choices</CardDescription>
                </CardHeader>
                <CardContent>
                  <SustainabilityScore score={carbonData.sustainabilityScore} />
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Carbon Emissions Over Time</CardTitle>
                  <CardDescription>
                    Track your progress in reducing emissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <CarbonFootprintChart data={carbonData.monthlyData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Transport Type Breakdown</CardTitle>
                  <CardDescription>
                    Carbon footprint by transport method
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(carbonData.transportBreakdown).map(([type, value]) => {
                      if (value === 0) return null;
                      
                      const percentage = (value / carbonData.totalFootprint) * 100;
                      
                      return (
                        <div key={type}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              {getTransportIcon(type)}
                              <span className="ml-2 capitalize">{type}</span>
                            </div>
                            <span>{value.toFixed(2)} kg</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-right mt-1 text-muted-foreground">
                            {percentage.toFixed(1)}% of total
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Shipments</CardTitle>
                  <CardDescription>
                    Carbon footprint of your recent shipments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking ID</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Transport</TableHead>
                        <TableHead className="text-right">Carbon Footprint</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shipments.slice(0, 5).map((shipment) => (
                        <TableRow key={shipment.id}>
                          <TableCell className="font-medium">{shipment.tracking_id}</TableCell>
                          <TableCell>{shipment.origin}</TableCell>
                          <TableCell>{shipment.destination}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getTransportIcon(shipment.transport_type)}
                              <span className="ml-2 capitalize">{shipment.transport_type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {shipment.carbon_footprint.toFixed(2)} kg
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Reduction Tips</CardTitle>
                  <CardDescription>
                    How to lower your carbon footprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {carbonData.reductionTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <Leaf className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CarbonReport;
