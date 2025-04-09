
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Cloud, CloudRain, Wind, Thermometer, AlertTriangle, RefreshCcw, MapPin } from 'lucide-react';

// Mock data - would be replaced with actual API calls
interface WeatherAlert {
  id: string;
  location: string;
  type: 'storm' | 'flood' | 'extreme-temperature' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  start_date: string;
  end_date: string;
  affected_shipments: number;
}

interface WeatherForecast {
  location: string;
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  temperature: number;
  precipitation: number;
  wind_speed: number;
  humidity: number;
}

const MOCK_WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: '1',
    location: 'Houston, TX',
    type: 'storm',
    severity: 'high',
    description: 'Hurricane warning: Strong winds and heavy rainfall expected',
    start_date: '2025-04-10T00:00:00Z',
    end_date: '2025-04-12T00:00:00Z',
    affected_shipments: 12
  },
  {
    id: '2',
    location: 'Chicago, IL',
    type: 'extreme-temperature',
    severity: 'medium',
    description: 'Cold wave: Temperatures dropping below -10°C',
    start_date: '2025-04-11T00:00:00Z',
    end_date: '2025-04-14T00:00:00Z',
    affected_shipments: 8
  },
  {
    id: '3',
    location: 'Seattle, WA',
    type: 'flood',
    severity: 'low',
    description: 'Minor flooding possible in low-lying areas',
    start_date: '2025-04-09T00:00:00Z',
    end_date: '2025-04-10T00:00:00Z',
    affected_shipments: 3
  }
];

const MOCK_WEATHER_FORECAST: Record<string, WeatherForecast[]> = {
  'New York, NY': [
    {
      location: 'New York, NY',
      date: '2025-04-09',
      condition: 'sunny',
      temperature: 18,
      precipitation: 0,
      wind_speed: 10,
      humidity: 45
    },
    {
      location: 'New York, NY',
      date: '2025-04-10',
      condition: 'cloudy',
      temperature: 16,
      precipitation: 20,
      wind_speed: 15,
      humidity: 60
    },
    {
      location: 'New York, NY',
      date: '2025-04-11',
      condition: 'rainy',
      temperature: 14,
      precipitation: 70,
      wind_speed: 20,
      humidity: 80
    }
  ],
  'Los Angeles, CA': [
    {
      location: 'Los Angeles, CA',
      date: '2025-04-09',
      condition: 'sunny',
      temperature: 26,
      precipitation: 0,
      wind_speed: 5,
      humidity: 30
    },
    {
      location: 'Los Angeles, CA',
      date: '2025-04-10',
      condition: 'sunny',
      temperature: 28,
      precipitation: 0,
      wind_speed: 8,
      humidity: 35
    },
    {
      location: 'Los Angeles, CA',
      date: '2025-04-11',
      condition: 'cloudy',
      temperature: 25,
      precipitation: 10,
      wind_speed: 12,
      humidity: 40
    }
  ],
  'Miami, FL': [
    {
      location: 'Miami, FL',
      date: '2025-04-09',
      condition: 'cloudy',
      temperature: 29,
      precipitation: 30,
      wind_speed: 18,
      humidity: 75
    },
    {
      location: 'Miami, FL',
      date: '2025-04-10',
      condition: 'rainy',
      temperature: 27,
      precipitation: 80,
      wind_speed: 25,
      humidity: 85
    },
    {
      location: 'Miami, FL',
      date: '2025-04-11',
      condition: 'stormy',
      temperature: 25,
      precipitation: 90,
      wind_speed: 40,
      humidity: 90
    }
  ]
};

const WeatherAnalytics = () => {
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>(MOCK_WEATHER_ALERTS);
  const [selectedLocation, setSelectedLocation] = useState<string>('New York, NY');
  const [loading, setLoading] = useState(false);

  // In a real app, we would fetch this data from the OpenWeather API
  const refreshWeatherData = () => {
    setLoading(true);
    toast.info('Refreshing weather data...');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Weather data updated');
    }, 1500);
  };

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'storm':
        return <CloudRain className="h-5 w-5" />;
      case 'flood':
        return <Cloud className="h-5 w-5" />;
      case 'extreme-temperature':
        return <Thermometer className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getWeatherIcon = (condition: WeatherForecast['condition']) => {
    switch (condition) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'stormy':
        return '⛈️';
      case 'snowy':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Weather Analytics</h1>
            <p className="text-muted-foreground">Monitor weather conditions affecting shipments</p>
          </div>
          <Button 
            className="bg-eco-purple hover:bg-eco-purple/90"
            onClick={refreshWeatherData}
            disabled={loading}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                Active Weather Alerts
              </CardTitle>
              <CardDescription>
                Weather events that may impact shipments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weatherAlerts.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No active weather alerts at this time.</p>
              ) : (
                <div className="space-y-4">
                  {weatherAlerts.map((alert) => (
                    <Alert key={alert.id} variant="default">
                      <div className="flex items-start">
                        <div className="mr-4">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <AlertTitle className="flex items-center">
                              {alert.location}
                              <Badge className={`ml-2 ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </AlertTitle>
                            <span className="text-sm text-muted-foreground">
                              {new Date(alert.start_date).toLocaleDateString()} - {new Date(alert.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <AlertDescription className="mt-1">
                            {alert.description}
                          </AlertDescription>
                          <div className="mt-2">
                            <Badge variant="outline" className="text-eco-purple">
                              {alert.affected_shipments} shipments affected
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="mr-2 h-5 w-5 text-eco-purple" />
              Shipment Route Weather Forecast
            </CardTitle>
            <CardDescription>
              5-day forecast for major shipping routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={selectedLocation} onValueChange={setSelectedLocation}>
              <TabsList className="mb-4">
                {Object.keys(MOCK_WEATHER_FORECAST).map((location) => (
                  <TabsTrigger key={location} value={location}>
                    <MapPin className="h-4 w-4 mr-1" />
                    {location}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(MOCK_WEATHER_FORECAST).map(([location, forecasts]) => (
                <TabsContent key={location} value={location}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {forecasts.map((forecast, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </CardTitle>
                          <CardDescription>
                            {new Date(forecast.date).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-4xl">{getWeatherIcon(forecast.condition)}</span>
                            <span className="text-3xl font-bold">{forecast.temperature}°C</span>
                          </div>
                          
                          <Separator className="mb-4" />
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center">
                                <CloudRain className="h-4 w-4 mr-1" /> Precipitation
                              </span>
                              <span>{forecast.precipitation}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center">
                                <Wind className="h-4 w-4 mr-1" /> Wind
                              </span>
                              <span>{forecast.wind_speed} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center">
                                <Cloud className="h-4 w-4 mr-1" /> Humidity
                              </span>
                              <span>{forecast.humidity}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WeatherAnalytics;
