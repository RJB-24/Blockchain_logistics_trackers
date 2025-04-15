
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CarbonFootprintTracker from '@/components/sustainability/CarbonFootprintTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Search,
  Truck,
  Users,
  Star,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  Settings2
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSustainabilityAnalytics } from '@/services/blockchain/sustainabilityOperations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

// Helper function to format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// Demo data for shipments by status
const shipmentStatusData = [
  { status: 'Delivered', count: 342, color: '#22c55e' },
  { status: 'In Transit', count: 128, color: '#6f61ef' },
  { status: 'Processing', count: 84, color: '#eab308' },
  { status: 'Delayed', count: 23, color: '#ef4444' },
  { status: 'Cancelled', count: 12, color: '#94a3b8' },
];

// Demo data for shipments by transport type
const transportTypeData = [
  { type: 'Truck', value: 245, color: '#6f61ef' },
  { type: 'Rail', value: 121, color: '#84cc16' },
  { type: 'Ship', value: 164, color: '#0ea5e9' },
  { type: 'Air', value: 59, color: '#f97316' },
];

// Demo data for monthly shipments
const monthlyShipmentData = [
  { month: 'Jan', shipments: 142, revenue: 286000 },
  { month: 'Feb', shipments: 158, revenue: 312000 },
  { month: 'Mar', shipments: 173, revenue: 357000 },
  { month: 'Apr', shipments: 189, revenue: 392000 },
  { month: 'May', shipments: 204, revenue: 421000 },
  { month: 'Jun', shipments: 227, revenue: 459000 },
  { month: 'Jul', shipments: 241, revenue: 486000 },
  { month: 'Aug', shipments: 259, revenue: 512000 },
  { month: 'Sep', shipments: 236, revenue: 488000 },
  { month: 'Oct', shipments: 271, revenue: 532000 },
  { month: 'Nov', shipments: 284, revenue: 561000 },
  { month: 'Dec', shipments: 321, revenue: 624000 },
];

// Demo data for customer ratings
const customerRatingData = [
  { rating: '5 Stars', count: 427, percentage: 64 },
  { rating: '4 Stars', count: 184, percentage: 27 },
  { rating: '3 Stars', count: 42, percentage: 6 },
  { rating: '2 Stars', count: 12, percentage: 2 },
  { rating: '1 Star', count: 7, percentage: 1 },
];

// Demo data for top customers
const topCustomersData = [
  { name: 'Acme Corporation', shipments: 47, revenue: 124500, carbonSaved: 6240 },
  { name: 'Global Industries', shipments: 38, revenue: 97600, carbonSaved: 4820 },
  { name: 'Tech Solutions Inc', shipments: 32, revenue: 86400, carbonSaved: 3910 },
  { name: 'Eastern Distributors', shipments: 29, revenue: 72500, carbonSaved: 3650 },
  { name: 'Pacific Logistics', shipments: 26, revenue: 65000, carbonSaved: 3120 },
];

// Demo data for carbon footprint by transport
const carbonFootprintData = [
  { type: 'Truck', carbon: 475, optimized: 380 },
  { type: 'Rail', carbon: 210, optimized: 192 },
  { type: 'Ship', carbon: 142, optimized: 132 },
  { type: 'Air', carbon: 684, optimized: 562 },
];

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('year');
  const [transportFilter, setTransportFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    totalShipments: 2505,
    totalRevenue: 5230000,
    activeShipments: 128,
    customerSatisfaction: 4.5,
    carbonSaved: 1280,
    deliverySuccess: 98.2
  });

  useEffect(() => {
    // In a real app, you'd fetch this data from the database
    // Simulate a data fetch based on selected filters
    console.log(`Fetching analytics for time range: ${timeRange} and transport: ${transportFilter}`);
  }, [timeRange, transportFilter]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-eco-dark">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive view of logistics performance and sustainability metrics</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
            <Button variant="outline" className="h-9">
              <Calendar className="mr-2 h-4 w-4" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="border-0 p-0 h-auto">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </Button>
            
            <Button variant="outline" className="h-9">
              <Truck className="mr-2 h-4 w-4" />
              <Select value={transportFilter} onValueChange={setTransportFilter}>
                <SelectTrigger className="border-0 p-0 h-auto">
                  <SelectValue placeholder="Transport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="ship">Ship</SelectItem>
                  <SelectItem value="air">Air</SelectItem>
                </SelectContent>
              </Select>
            </Button>
            
            <Button className="bg-eco-purple hover:bg-eco-purple/90 h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">Total Shipments</p>
                  <Truck className="h-4 w-4 text-eco-purple" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{formatNumber(analyticsData.totalShipments)}</p>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>12%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">Revenue</p>
                  <TrendingUp className="h-4 w-4 text-eco-purple" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">${(analyticsData.totalRevenue / 1000000).toFixed(2)}M</p>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>8.4%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">Active Shipments</p>
                  <Truck className="h-4 w-4 text-eco-purple" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{analyticsData.activeShipments}</p>
                  <div className="flex items-center text-amber-600 text-sm">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>3.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">Customer Rating</p>
                  <Star className="h-4 w-4 text-eco-purple" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{analyticsData.customerSatisfaction}</p>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>0.3</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">Carbon Saved</p>
                  <Leaf className="h-4 w-4 text-eco-purple" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{analyticsData.carbonSaved}t</p>
                  <div className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>18%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground text-sm">On-Time Delivery</p>
                  <Settings2 className="h-4 w-4 text-eco-purple" />
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{analyticsData.deliverySuccess}%</p>
                  <div className="flex items-center text-red-500 text-sm">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    <span>1.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Performance</CardTitle>
                  <CardDescription>Shipment volume and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyShipmentData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="shipments"
                          name="Shipments"
                          stroke="#6f61ef"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue ($)"
                          stroke="#22c55e"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipment Status Distribution</CardTitle>
                  <CardDescription>Current shipment status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={shipmentStatusData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="status" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Shipments">
                          {shipmentStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="shipments" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transport Types</CardTitle>
                  <CardDescription>Distribution by transportation method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={transportTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="type"
                          label={({type, value}) => `${type}: ${value}`}
                        >
                          {transportTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Shipments</CardTitle>
                    <CardDescription>Last 10 shipments processed</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => navigate('/manager/shipments')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">ID</th>
                          <th className="text-left py-3 px-2 font-medium">Route</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                          <th className="text-left py-3 px-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...Array(5)].map((_, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 text-sm">SH-{2500 + index}</td>
                            <td className="py-2 px-2 text-sm">
                              {["LA → NYC", "CHI → MIA", "SEA → DAL", "ATL → BOS", "SF → DEN"][index]}
                            </td>
                            <td className="py-2 px-2">
                              <Badge className={[
                                "bg-green-100 text-green-800", 
                                "bg-blue-100 text-blue-800",
                                "bg-amber-100 text-amber-800",
                                "bg-red-100 text-red-800",
                                "bg-purple-100 text-purple-800"
                              ][index]}>
                                {["Delivered", "In Transit", "Processing", "Delayed", "Completed"][index]}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-sm">
                              {new Date(Date.now() - index * 86400000).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="customers" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Ratings</CardTitle>
                  <CardDescription>Feedback distribution by rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customerRatingData.map((item) => (
                      <div key={item.rating} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.rating}</span>
                          <span className="font-medium">{item.count} reviews ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-eco-purple h-2.5 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Top Customers</CardTitle>
                    <CardDescription>By shipment volume and revenue</CardDescription>
                  </div>
                  <Button variant="ghost">
                    View Report
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Customer</th>
                          <th className="text-left py-3 px-2 font-medium">Shipments</th>
                          <th className="text-left py-3 px-2 font-medium">Revenue</th>
                          <th className="text-left py-3 px-2 font-medium">CO₂ Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCustomersData.map((customer, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2 font-medium">{customer.name}</td>
                            <td className="py-2 px-2">{customer.shipments}</td>
                            <td className="py-2 px-2">${customer.revenue.toLocaleString()}</td>
                            <td className="py-2 px-2">{customer.carbonSaved} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sustainability" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Carbon Footprint by Transport</CardTitle>
                  <CardDescription>Standard vs. Optimized Routes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={carbonFootprintData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="carbon" name="Standard Routes" fill="#ef4444" />
                        <Bar dataKey="optimized" name="Optimized Routes" fill="#22c55e" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <CarbonFootprintTracker />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsDashboard;
