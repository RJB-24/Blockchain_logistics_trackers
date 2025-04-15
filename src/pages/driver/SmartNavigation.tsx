
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Map, 
  Navigation, 
  ZapIcon,
  Truck, 
  Clock, 
  Fuel, 
  Leaf, 
  SettingsIcon,
  Mic,
  MessageSquare
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { optimizeRoute } from '@/services/routeOptimization/optimization';

const SmartNavigation = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechInput, setSpeechInput] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'assistant' | 'user', content: string}>>([
    {
      role: 'assistant',
      content: 'Hello driver! I can help you with navigation, find optimal routes, or answer questions about your delivery. What can I assist you with today?'
    }
  ]);
  const [userMessage, setUserMessage] = useState('');

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    toast.info('Optimizing route with AI...');
    
    // Simulate route optimization with a delay
    setTimeout(() => {
      setIsOptimizing(false);
      toast.success('Route optimized! Saved 23 minutes and reduced carbon footprint by 12%');
    }, 2000);
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      // Simulate voice recognition
      setIsListening(true);
      setTimeout(() => {
        setSpeechInput('Find the fastest route to avoid traffic on I-95');
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
      setSpeechInput('');
    }
  };

  const sendMessage = () => {
    if (!userMessage.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = '';
      
      if (userMessage.toLowerCase().includes('traffic')) {
        response = 'I detect heavy traffic on I-95. I recommend taking Route 1 as an alternative. This will add 2 miles to your trip but save approximately 15 minutes. Would you like me to reroute?';
      } else if (userMessage.toLowerCase().includes('weather')) {
        response = 'The weather forecast for your route shows light rain starting in about 30 minutes. The conditions should remain safe for driving, but I recommend increasing your following distance slightly as a precaution.';
      } else if (userMessage.toLowerCase().includes('rest') || userMessage.toLowerCase().includes('stop')) {
        response = 'I found several rest stops along your route. The nearest one is Eastbound Service Plaza, approximately 12 miles ahead. It has food, fuel, and restrooms available. Would you like me to add this as a waypoint?';
      } else if (userMessage.toLowerCase().includes('eta') || userMessage.toLowerCase().includes('arrival')) {
        response = 'Your estimated time of arrival at Downtown Distribution Center is 2:45 PM. This accounts for current traffic conditions. Would you like me to notify the recipient about your ETA?';
      } else {
        response = 'I understand you need assistance with this. Let me analyze the situation and provide optimal guidance based on current conditions. What specific details would help you most right now?';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
    
    // Clear input
    setUserMessage('');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Smart Navigation</h1>
            <p className="text-muted-foreground">AI-powered routing and navigation assistant</p>
          </div>
          <Button className="bg-eco-green hover:bg-eco-green/90">
            <Navigation className="mr-2 h-4 w-4" />
            Start Navigation
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5 text-eco-purple" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent className="relative h-[calc(100%-76px)]">
              <div className="absolute inset-0 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 text-eco-purple mx-auto mb-2" />
                  <p className="text-muted-foreground mb-4">
                    Interactive map with smart navigation would be displayed here
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Select defaultValue="truck">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Transport Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select defaultValue="fuel">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Optimization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time">Fastest Route</SelectItem>
                        <SelectItem value="fuel">Fuel Efficient</SelectItem>
                        <SelectItem value="eco">Eco-Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white p-4 rounded-md shadow-md">
                  <div className="flex space-x-2 mb-4">
                    <Input 
                      placeholder="Enter destination or say 'Navigate to...'" 
                      value={speechInput || '1500 Market St, Philadelphia, PA'}
                      onChange={(e) => setSpeechInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant={isListening ? "default" : "outline"} 
                      onClick={toggleVoiceInput}
                      className={isListening ? "bg-eco-purple" : ""}
                    >
                      <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                    </Button>
                    <Button>
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-bold">42 min</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Distance</p>
                        <p className="font-bold">18.5 mi</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Arrival</p>
                        <p className="font-bold">2:45 PM</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleOptimizeRoute} 
                      disabled={isOptimizing}
                      className="bg-eco-purple hover:bg-eco-purple/90"
                    >
                      <ZapIcon className={`mr-2 h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                      Optimize
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-eco-purple" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Ask for help with navigation, weather, traffic, or delivery info
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-eco-purple text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about traffic, weather, or navigation..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Driving Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Speed</span>
                  <span className="font-semibold">42 mph</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel Efficiency</span>
                  <span className="font-semibold">6.2 mpg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CO₂ Emissions</span>
                  <span className="font-semibold">18.4 kg/hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Idle Time</span>
                  <span className="font-semibold">6%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hard Braking</span>
                  <span className="font-semibold">2 events</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Navigation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ZapIcon className="h-4 w-4 text-eco-purple" />
                    <span>AI Route Optimization</span>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-eco-purple" />
                    <span>Real-time Traffic</span>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-4 w-4 text-eco-purple" />
                    <span>Eco-friendly Routes</span>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-eco-purple" />
                    <span>Vehicle-specific Routing</span>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                
                <Button variant="outline" className="w-full mt-2">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Adjust Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SmartNavigation;
