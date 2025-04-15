
import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Mic, 
  Send,
  RefreshCw,
  Zap,
  Route,
  Truck,
  Leaf,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Quick reply suggestions
const quickReplies = [
  { id: 'traffic', text: 'Traffic ahead?' },
  { id: 'route', text: 'Optimize my route' },
  { id: 'weather', text: 'Weather forecast' },
  { id: 'delivery', text: 'Update delivery ETA' },
  { id: 'rest', text: 'Find rest stop' },
  { id: 'fuel', text: 'Nearby fuel stations' },
  { id: 'carbon', text: 'Reduce carbon footprint' }
];

const AIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your EcoFreight AI assistant. How can I help you with your deliveries today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      let responseContent = '';
      
      if (inputMessage.toLowerCase().includes('traffic')) {
        responseContent = 'I\'ve checked the traffic conditions ahead. There\'s congestion reported on I-95 northbound near exit 23. I recommend taking the alternate route via Route 40, which will add approximately 2.3 miles but save you about 18 minutes. Would you like me to update your navigation?';
      } else if (inputMessage.toLowerCase().includes('optimize') || inputMessage.toLowerCase().includes('route')) {
        responseContent = 'I\'ve analyzed your current route and found a more efficient path that reduces your carbon footprint by 14% and saves 3.2 gallons of fuel. The new route avoids the city center and utilizes the recently opened bypass. This optimization would reduce your ETA by approximately 22 minutes. Would you like me to apply this optimization?';
      } else if (inputMessage.toLowerCase().includes('weather')) {
        responseContent = 'Current weather along your route shows clear conditions for the next 3 hours, followed by light rain near your destination. The temperature will remain around 64°F (18°C), with winds at 8-10 mph from the northwest. No severe weather warnings are in effect that would impact your delivery timeline.';
      } else if (inputMessage.toLowerCase().includes('eta') || inputMessage.toLowerCase().includes('delivery')) {
        responseContent = 'Based on current conditions, your estimated arrival at Johnson Distribution Center is 2:45 PM. Would you like me to notify the recipient about your updated ETA? I can also provide details about the loading dock availability and current queue status at the destination.';
      } else if (inputMessage.toLowerCase().includes('rest') || inputMessage.toLowerCase().includes('stop')) {
        responseContent = 'I\'ve identified three rest stops along your route within the next 50 miles. The closest one is Eastbound Service Plaza in 12 miles (approximately 15 minutes), which has restrooms, food options, and truck parking. Would you like me to mark this as a waypoint in your navigation?';
      } else if (inputMessage.toLowerCase().includes('fuel') || inputMessage.toLowerCase().includes('gas')) {
        responseContent = 'I found 5 fuel stations along your route. The most economical option is the Truck Stop at exit 47 (36 miles ahead), currently pricing diesel at $3.45/gallon. This location also offers DEF and has a designated truck fueling area with minimal wait times reported.';
      } else if (inputMessage.toLowerCase().includes('carbon') || inputMessage.toLowerCase().includes('footprint')) {
        responseContent = 'To reduce your carbon footprint, I recommend: 1) Maintaining a steady speed of 55-60 mph which optimizes fuel efficiency for your vehicle, 2) Limiting idle time at stops, and 3) Taking the recently suggested optimized route which reduces emissions by approximately 14%. Would you like more specific eco-driving tips?';
      } else {
        responseContent = 'I understand you need assistance with this. Based on your current route and schedule, I can provide specific recommendations. Could you clarify what particular aspect of your delivery you need help with? I can offer guidance on routing, scheduling, vehicle maintenance, or communication with the recipient.';
      }
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickReply = (replyText: string) => {
    setInputMessage(replyText);
    // Small timeout to ensure the UI updates before sending
    setTimeout(() => {
      handleSendMessage();
    }, 10);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-3/4">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 bg-eco-purple mr-2">
                      <AvatarFallback><Zap /></AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>EcoFreight AI Assistant</CardTitle>
                      <CardDescription>Your intelligent driving companion</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Online
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              
              <CardContent className="flex-1 overflow-hidden flex flex-col pt-4">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 mr-2 mt-1">
                          <AvatarFallback className="bg-eco-purple text-white"><Zap className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col max-w-[75%]">
                        <div className={`rounded-lg px-4 py-2 ${
                          message.role === 'user' 
                            ? 'bg-eco-purple text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {message.content}
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 ml-1">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 ml-2 mt-1">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-eco-green text-white">D</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarFallback className="bg-eco-purple text-white"><Zap className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg px-4 py-2 rounded-tl-none flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-eco-purple" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply.text)}
                        className="bg-gray-100 hover:bg-gray-200 text-sm px-3 py-1.5 rounded-full"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" className="shrink-0">
                      <Mic className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-eco-purple hover:bg-eco-purple/90"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:w-1/4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Traffic congestion</p>
                    <p className="text-xs text-muted-foreground">I-95 North, Exit 23-27</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Truck className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Maintenance reminder</p>
                    <p className="text-xs text-muted-foreground">Oil change due in 500 miles</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Route className="h-5 w-5 text-eco-purple mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Route optimization</p>
                    <p className="text-xs text-muted-foreground">Save 22 minutes with new route</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sustainability Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Leaf className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Maintain Steady Speed</p>
                    <p className="text-xs text-muted-foreground">55-60 mph is optimal for fuel efficiency</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Leaf className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Minimize Idle Time</p>
                    <p className="text-xs text-muted-foreground">Turn off engine during stops {'>'}2 min</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Leaf className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Proper Tire Pressure</p>
                    <p className="text-xs text-muted-foreground">Check before each trip</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Distance</span>
                  <span className="font-medium">142 mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Driving Time</span>
                  <span className="font-medium">3h 12m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Avg. Speed</span>
                  <span className="font-medium">44 mph</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Fuel Used</span>
                  <span className="font-medium">12.6 gal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">CO₂ Emissions</span>
                  <span className="font-medium">128 kg</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIChat;
