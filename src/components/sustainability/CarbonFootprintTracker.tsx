
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useBlockchain } from '@/hooks/blockchain';
import { toast } from 'sonner';
import { 
  Leaf, 
  TrendingDown, 
  Zap, 
  Award, 
  BarChart,
  Droplet,
  RefreshCw,
  Clock
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CarbonFootprintTrackerProps {
  shipmentId: string;
  initialCarbonFootprint?: number;
  transportType?: string;
}

export const CarbonFootprintTracker: React.FC<CarbonFootprintTrackerProps> = ({
  shipmentId,
  initialCarbonFootprint,
  transportType = 'truck'
}) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState<{
    carbonFootprint: number;
    carbonSaved: number;
    fuelSaved: number;
    timeSaved: number;
    sustainabilityScore: number;
    recommendations: Array<{
      title: string;
      description: string;
      potentialSavings: {
        carbon: number;
        cost: number;
      };
    }>;
  } | null>(null);

  const { getSustainabilityRecommendations, getCarbonCredits } = useBlockchain();

  useEffect(() => {
    if (shipmentId && initialCarbonFootprint) {
      setStats(prev => ({
        ...prev || {},
        carbonFootprint: initialCarbonFootprint,
        sustainabilityScore: calculateSustainabilityScore(initialCarbonFootprint, transportType),
        carbonSaved: 0,
        fuelSaved: 0,
        timeSaved: 0,
        recommendations: []
      }));
    }
  }, [shipmentId, initialCarbonFootprint, transportType]);

  const calculateSustainabilityScore = (carbonFootprint: number, transportType: string): number => {
    // Baseline emissions by transport type (higher means worse baseline)
    const baselineEmissions: Record<string, number> = {
      truck: 100,
      ship: 150,
      rail: 50,
      air: 700
    };
    
    const baseline = baselineEmissions[transportType] || baselineEmissions.truck;
    
    // Calculate score (0-100) where lower emissions = higher score
    return Math.min(100, Math.max(0, Math.round((1 - (carbonFootprint / baseline)) * 100)));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-lime-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  };

  const handleAnalyze = async () => {
    if (!shipmentId) {
      toast.error('Shipment ID is required');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await getSustainabilityRecommendations(shipmentId);
      
      if (result && result.recommendations) {
        // Calculate mock savings based on the recommendations
        const carbonSaved = result.recommendations.reduce(
          (sum, rec) => sum + (rec.potentialSavings?.carbon || 0), 
          0
        );
        
        const fuelSaved = carbonSaved * 0.3; // Approximate fuel savings
        const timeSaved = Math.round(carbonSaved * 0.2); // Approximate time savings in minutes
        
        setStats(prev => ({
          ...prev || {},
          carbonFootprint: prev?.carbonFootprint || initialCarbonFootprint || 0,
          carbonSaved,
          fuelSaved,
          timeSaved,
          sustainabilityScore: prev?.sustainabilityScore || 0,
          recommendations: result.recommendations
        }));
        
        toast.success('Sustainability analysis completed');
      }
    } catch (error) {
      console.error('Error analyzing sustainability:', error);
      toast.error('Failed to analyze sustainability metrics');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClaimCredits = async () => {
    if (!shipmentId || !stats) {
      toast.error('Shipment data is incomplete');
      return;
    }

    setLoading(true);
    try {
      const result = await getCarbonCredits(shipmentId, stats.sustainabilityScore);
      
      if (result && result.success) {
        toast.success(`Successfully claimed ${result.tokens} carbon credit tokens`);
      } else {
        toast.error('Failed to claim carbon credits');
      }
    } catch (error) {
      console.error('Error claiming carbon credits:', error);
      toast.error('Failed to claim carbon credits');
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.recommendations?.map(rec => ({
    name: rec.title.split(' ').slice(0, 2).join(' ') + '...',
    carbonSavings: rec.potentialSavings?.carbon || 0,
    costSavings: rec.potentialSavings?.cost || 0
  })) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-eco-purple" />
          Carbon Footprint & Sustainability
        </CardTitle>
        <CardDescription>
          Track and optimize environmental impact
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {stats ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Leaf className="h-4 w-4 mr-1" />
                  Carbon Footprint
                </div>
                <div className="font-bold text-lg">
                  {stats.carbonFootprint.toFixed(2)} kg CO₂
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Award className="h-4 w-4 mr-1" />
                  Sustainability Score
                </div>
                <div className="font-bold text-lg flex items-center">
                  <span className={getScoreColor(stats.sustainabilityScore)}>
                    {stats.sustainabilityScore}/100
                  </span>
                  <Badge className="ml-2 bg-eco-purple/90">
                    {getScoreLabel(stats.sustainabilityScore)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Sustainability Rating</span>
                <span className={`text-sm font-medium ${getScoreColor(stats.sustainabilityScore)}`}>
                  {getScoreLabel(stats.sustainabilityScore)}
                </span>
              </div>
              <Progress 
                value={stats.sustainabilityScore} 
                className="h-2" 
              />
            </div>
            
            {stats.carbonSaved > 0 && (
              <>
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                    Potential Savings
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-3 rounded-md text-center">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center">
                        <Leaf className="h-3 w-3 mr-1 text-green-500" />
                        Carbon
                      </div>
                      <div className="font-medium text-green-600">
                        {stats.carbonSaved.toFixed(1)} kg
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md text-center">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center">
                        <Droplet className="h-3 w-3 mr-1 text-blue-500" />
                        Fuel
                      </div>
                      <div className="font-medium text-blue-600">
                        {stats.fuelSaved.toFixed(1)} L
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-md text-center">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center">
                        <Clock className="h-3 w-3 mr-1 text-purple-500" />
                        Time
                      </div>
                      <div className="font-medium text-purple-600">
                        {stats.timeSaved} min
                      </div>
                    </div>
                  </div>
                </div>
                
                {stats.recommendations.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-amber-500" />
                        AI Recommendations
                      </h3>
                      
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 25 }}
                          >
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                            />
                            <YAxis 
                              tick={{ fontSize: 10 }}
                              width={30}
                            />
                            <Tooltip />
                            <Bar dataKey="carbonSavings" name="CO₂ Savings (kg)" fill="#10b981" />
                          </ReBarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {stats.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            <div className="font-medium mb-1">{rec.title}</div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600 flex items-center">
                                <Leaf className="h-3 w-3 mr-1" />
                                {rec.potentialSavings?.carbon || 0} kg CO₂
                              </span>
                              <span className="text-blue-600">
                                ${rec.potentialSavings?.cost || 0} saved
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <Leaf className="h-12 w-12 mx-auto mb-3 text-eco-purple opacity-50" />
            <p>No carbon footprint data available</p>
            <p className="text-sm">Analyze this shipment to see sustainability metrics</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          variant="outline" 
          className="w-full flex items-center"
          onClick={handleAnalyze}
          disabled={analyzing || !shipmentId}
        >
          {analyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart className="h-4 w-4 mr-2" />
              Analyze Sustainability
            </>
          )}
        </Button>
        
        <Button 
          className="w-full bg-eco-purple hover:bg-eco-purple/90"
          onClick={handleClaimCredits}
          disabled={loading || !stats || stats.sustainabilityScore < 50}
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              Claim Carbon Credits
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CarbonFootprintTracker;
