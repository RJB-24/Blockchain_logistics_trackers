
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSustainabilityRecommendations, getSustainabilityAnalytics, SustainabilityRecommendation } from '@/services/blockchain/sustainabilityOperations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Props {
  shipmentId?: string;
}

// Carbon footprint data point
interface FootprintDataPoint {
  date: string;
  footprint: number;
  baseline: number;
}

// Generate demo data for the chart
const generateDemoData = (): FootprintDataPoint[] => {
  const data: FootprintDataPoint[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Create some variation in the data
    const footprint = Math.max(15, 50 - i * 0.8 + Math.random() * 10);
    const baseline = 50 - i * 0.2; // Industry baseline decreases slower
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      footprint: parseFloat(footprint.toFixed(1)),
      baseline: parseFloat(baseline.toFixed(1))
    });
  }
  return data;
};

const CarbonFootprintTracker: React.FC<Props> = ({ shipmentId }) => {
  const [chartData, setChartData] = useState<FootprintDataPoint[]>([]);
  const [recommendations, setRecommendations] = useState<SustainabilityRecommendation[]>([]);
  const [analytics, setAnalytics] = useState({
    totalCarbonFootprint: 0,
    totalCarbonSaved: 0,
    transportModeBreakdown: {} as Record<string, number>,
    sustainabilityScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load chart data
    setChartData(generateDemoData());
    
    // Load recommendations
    if (shipmentId) {
      fetchRecommendations(shipmentId);
    } else {
      // Load general analytics
      fetchAnalytics();
    }
  }, [shipmentId]);

  const fetchRecommendations = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await getSustainabilityRecommendations(id);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sustainability recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Set date range to last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const result = await getSustainabilityAnalytics(startDate, endDate);
      setAnalytics(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sustainability analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Leaf className="mr-2 h-5 w-5 text-green-500" />
            Carbon Footprint Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Industry Average"
                  stroke="#8884d8"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="footprint" 
                  name="Your Footprint" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Carbon Saved</p>
                    <h4 className="text-2xl font-bold">{analytics.totalCarbonSaved.toFixed(1)} kg</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Leaf className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Sustainability Score</p>
                    <h4 className="text-2xl font-bold">{analytics.sustainabilityScore}/100</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600 mr-4" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Cost Impact</p>
                    <h4 className="text-2xl font-bold">$1,250 Saved</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sustainability Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <h3 className="font-bold text-lg">{recommendation.title}</h3>
                  <p className="text-gray-600 mt-1">{recommendation.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {recommendation.impact}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {recommendation.potentialSavings.carbon} kg CO₂ saved
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ${recommendation.potentialSavings.cost} potential savings
                    </span>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" size="sm">Implement</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarbonFootprintTracker;
