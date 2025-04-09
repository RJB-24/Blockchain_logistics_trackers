
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CarbonFootprintChart } from '@/components/sustainability/CarbonFootprintChart';
import { SustainabilityScore } from '@/components/sustainability/SustainabilityScore';
import { Leaf, BarChart, Download, Calendar, Share2, Printer, RefreshCw } from 'lucide-react';

interface ShipmentCarbonData {
  id: string;
  title: string;
  tracking_id: string;
  transport_type: string;
  origin: string;
  destination: string;
  carbon_footprint: number;
  created_at: string;
}

const CarbonReport = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<ShipmentCarbonData[]>([]);
  const [timeframe, setTimeframe] = useState('all');
  const [transportFilter, setTransportFilter] = useState('all');
  
  // Carbon totals
  const [totalCarbon, setTotalCarbon] = useState(0);
  const [carbonSaved, setCarbonSaved] = useState(0);
  const [sustainabilityScore, setSustainabilityScore] = useState(0);

  useEffect(() => {
    if (user) {
      fetchShipmentCarbonData();
    }
  }, [user]);

  const fetchShipmentCarbonData = async () => {
    try {
      setLoading(true);
      
      // Fetch shipments for the current customer
      const { data, error } = await supabase
        .from('shipments')
        .select('id, title, tracking_id, transport_type, origin, destination, carbon_footprint, created_at')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setShipments(data || []);
      
      // Calculate totals
      if (data) {
        const total = data.reduce((sum, shipment) => sum + (shipment.carbon_footprint || 0), 0);
        setTotalCarbon(total);
        
        // Simplified calculation for carbon saved (in reality this would be more complex)
        // Assuming 30% savings compared to industry average
        setCarbonSaved(total * 0.3);
        
        // Calculate sustainability score (0-100) based on transport types
        const score = calculateSustainabilityScore(data);
        setSustainabilityScore(score);
      }
    } catch (error) {
      console.error('Error fetching carbon data:', error);
      toast.error('Failed to load carbon report data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSustainabilityScore = (shipments: ShipmentCarbonData[]): number => {
    if (!shipments.length) return 0;
    
    // Different transport types have different sustainability weights
    const weights: {[key: string]: number} = {
      rail: 90,
      ship: 70,
      truck: 40,
      air: 20,
      'multi-modal': 60
    };
    
    // Calculate weighted average
    let totalWeight = 0;
    let weightedSum = 0;
    
    shipments.forEach(shipment => {
      const weight = weights[shipment.transport_type] || 50;
      weightedSum += weight;
      totalWeight++;
    });
    
    return Math.round(weightedSum / totalWeight);
  };

  const filterShipments = () => {
    let filtered = [...shipments];
    
    // Filter by timeframe
    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeframe) {
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(shipment => new Date(shipment.created_at) >= cutoffDate);
    }
    
    // Filter by transport type
    if (transportFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.transport_type === transportFilter);
    }
    
    return filtered;
  };

  const filteredShipments = filterShipments();
  
  const getTransportTypeColor = (type: string): string => {
    switch (type) {
      case 'truck':
        return 'bg-amber-500';
      case 'rail':
        return 'bg-eco-green';
      case 'ship':
        return 'bg-blue-500';
      case 'air':
        return 'bg-red-500';
      case 'multi-modal':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDownloadReport = () => {
    toast.info('Downloading carbon report as PDF...');
    // In a real app, this would generate and download a PDF report
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Carbon Footprint Report</h1>
            <p className="text-muted-foreground">Monitor and reduce your shipping carbon emissions</p>
          </div>
          <Button 
            className="bg-eco-purple hover:bg-eco-purple/90"
            onClick={handleDownloadReport}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-eco-green" />
                Total Carbon Footprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCarbon.toFixed(2)} kg CO₂</div>
              <p className="text-muted-foreground text-sm">Across all shipments</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-eco-green" />
                Carbon Emissions Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-eco-green">{carbonSaved.toFixed(2)} kg CO₂</div>
              <p className="text-muted-foreground text-sm">Compared to industry average</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-eco-purple" />
                Sustainability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SustainabilityScore score={sustainabilityScore} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-eco-purple" />
                Carbon Footprint Trends
              </CardTitle>
              <CardDescription>
                Carbon emissions over time by transport type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <CarbonFootprintChart 
                data={filteredShipments.map(s => ({
                  date: new Date(s.created_at).toLocaleDateString(), 
                  value: s.carbon_footprint,
                  type: s.transport_type
                }))}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-eco-purple" />
                Filter Report
              </CardTitle>
              <CardDescription>
                Customize your carbon report view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="timeframe" className="text-sm font-medium">
                    Time Period
                  </label>
                  <Select
                    value={timeframe}
                    onValueChange={setTimeframe}
                  >
                    <SelectTrigger id="timeframe">
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="transport" className="text-sm font-medium">
                    Transport Type
                  </label>
                  <Select
                    value={transportFilter}
                    onValueChange={setTransportFilter}
                  >
                    <SelectTrigger id="transport">
                      <SelectValue placeholder="Select transport type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transport Types</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="rail">Rail</SelectItem>
                      <SelectItem value="ship">Ship</SelectItem>
                      <SelectItem value="air">Air</SelectItem>
                      <SelectItem value="multi-modal">Multi-modal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setTimeframe('all');
                      setTransportFilter('all');
                    }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full" variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                  </Button>
                </div>
                
                <div>
                  <Button className="w-full" variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="mr-2 h-5 w-5 text-eco-green" />
              Shipment Carbon Details
            </CardTitle>
            <CardDescription>
              Carbon footprint breakdown by shipment ({filteredShipments.length} shipments)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-eco-purple" />
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No shipments found for the selected filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tracking ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Shipment</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Route</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transport</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Carbon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{shipment.tracking_id}</td>
                        <td className="py-3 px-4">{shipment.title}</td>
                        <td className="py-3 px-4">
                          <span className="truncate block max-w-[150px]">
                            {shipment.origin} → {shipment.destination}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getTransportTypeColor(shipment.transport_type)}>
                            {shipment.transport_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{new Date(shipment.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {shipment.carbon_footprint.toFixed(2)} kg CO₂
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <p className="text-sm text-muted-foreground">
                Showing {filteredShipments.length} of {shipments.length} shipments
              </p>
              <div className="text-sm">
                <span className="font-medium">Total for filtered shipments: </span>
                <span className="font-bold text-eco-purple">
                  {filteredShipments.reduce((sum, s) => sum + s.carbon_footprint, 0).toFixed(2)} kg CO₂
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CarbonReport;
