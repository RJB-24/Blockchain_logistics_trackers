
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Package, ArrowRight, Truck, Ship, Train, Plane } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';

const transportTypes = [
  { value: 'truck', label: 'Truck', icon: <Truck className="h-4 w-4" /> },
  { value: 'ship', label: 'Ship', icon: <Ship className="h-4 w-4" /> },
  { value: 'rail', label: 'Rail', icon: <Train className="h-4 w-4" /> },
  { value: 'air', label: 'Air', icon: <Plane className="h-4 w-4" /> },
  { value: 'multi-modal', label: 'Multi-modal', icon: <Package className="h-4 w-4" /> }
];

interface ShipmentForm {
  title: string;
  description: string;
  origin: string;
  destination: string;
  productType: string;
  quantity: number;
  weight: number;
  transportType: string;
  departureDate: Date | null;
  estimatedArrival: Date | null;
  customerId: string;
  driverId: string | null;
}

const CreateShipment = () => {
  const navigate = useNavigate();
  const { registerShipment, isLoading: blockchainLoading } = useBlockchain();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ShipmentForm>({
    title: '',
    description: '',
    origin: '',
    destination: '',
    productType: '',
    quantity: 1,
    weight: 0,
    transportType: '',
    departureDate: null,
    estimatedArrival: null,
    customerId: '',
    driverId: null
  });
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);

  // In a real app, we would fetch customers and drivers on component mount
  useState(() => {
    // Simulate fetching customers and drivers
    setCustomers([
      { id: '1', name: 'Acme Corp' },
      { id: '2', name: 'Globex Industries' },
      { id: '3', name: 'Initech' },
    ]);
    
    setDrivers([
      { id: '1', name: 'John Driver' },
      { id: '2', name: 'Maria Transport' },
      { id: '3', name: 'Alex Freight' },
    ]);
  });

  const handleChange = (field: keyof ShipmentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCarbonFootprint = (): number => {
    // This is a simplified model - in reality, this would be much more complex
    const distance = 100; // km (would calculate from origin/destination)
    const weight = formData.weight || 0;
    
    let emissionFactor = 0;
    switch (formData.transportType) {
      case 'truck':
        emissionFactor = 0.1; // kg CO2 per ton-km
        break;
      case 'ship':
        emissionFactor = 0.02;
        break;
      case 'rail':
        emissionFactor = 0.03;
        break;
      case 'air':
        emissionFactor = 0.5;
        break;
      case 'multi-modal':
        emissionFactor = 0.15;
        break;
      default:
        emissionFactor = 0.1;
    }
    
    return Math.round(distance * (weight / 1000) * emissionFactor * 100) / 100;
  };

  const generateTrackingId = (): string => {
    // Generate a random tracking ID in format ECO-XXXXX-XXXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ECO-';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.origin || !formData.destination || !formData.transportType || !formData.customerId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Calculate carbon footprint
      const carbonFootprint = calculateCarbonFootprint();
      
      // Generate tracking ID
      const trackingId = generateTrackingId();
      
      // Register the shipment on blockchain first (if integrated)
      const blockchainData = {
        transportType: formData.transportType,
        origin: formData.origin,
        destination: formData.destination,
        carbonFootprint
      };
      
      const blockchainResult = await registerShipment(blockchainData);
      
      // Create the shipment in the database
      const { data, error } = await supabase
        .from('shipments')
        .insert({
          title: formData.title,
          description: formData.description,
          origin: formData.origin,
          destination: formData.destination,
          product_type: formData.productType,
          quantity: formData.quantity,
          weight: formData.weight,
          transport_type: formData.transportType,
          planned_departure_date: formData.departureDate,
          estimated_arrival_date: formData.estimatedArrival,
          customer_id: formData.customerId,
          assigned_driver_id: formData.driverId,
          status: 'processing',
          carbon_footprint: carbonFootprint,
          blockchain_tx_hash: blockchainResult?.transactionHash || null,
          tracking_id: trackingId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Shipment created successfully');
      navigate(`/shipment/${data.id}`);
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Create New Shipment</h1>
            <p className="text-muted-foreground">Set up a new shipment with customer and delivery details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-eco-purple" />
                  Shipment Details
                </CardTitle>
                <CardDescription>
                  Basic information about the shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-1">
                      Shipment Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g., Office Supplies for Acme Corp"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Add details about the shipment contents..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="origin" className="block text-sm font-medium mb-1">
                        Origin <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="origin"
                        value={formData.origin}
                        onChange={(e) => handleChange('origin', e.target.value)}
                        placeholder="e.g., New York, NY"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="destination" className="block text-sm font-medium mb-1">
                        Destination <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="destination"
                        value={formData.destination}
                        onChange={(e) => handleChange('destination', e.target.value)}
                        placeholder="e.g., Los Angeles, CA"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="transportType" className="block text-sm font-medium mb-1">
                      Transport Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.transportType}
                      onValueChange={(value) => handleChange('transportType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a transport type" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center">
                              {type.icon}
                              <span className="ml-2">{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="productType" className="block text-sm font-medium mb-1">
                        Product Type
                      </label>
                      <Input
                        id="productType"
                        value={formData.productType}
                        onChange={(e) => handleChange('productType', e.target.value)}
                        placeholder="e.g., Electronics"
                      />
                    </div>
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                        Quantity
                      </label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium mb-1">
                        Weight (kg)
                      </label>
                      <Input
                        id="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Planned Departure Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.departureDate ? (
                              format(formData.departureDate, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.departureDate || undefined}
                            onSelect={(date) => handleChange('departureDate', date)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Estimated Arrival Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.estimatedArrival ? (
                              format(formData.estimatedArrival, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.estimatedArrival || undefined}
                            onSelect={(date) => handleChange('estimatedArrival', date)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="mr-2 h-5 w-5 text-eco-purple" />
                  Assignment
                </CardTitle>
                <CardDescription>
                  Assign customer and driver
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="customerId" className="block text-sm font-medium mb-1">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) => handleChange('customerId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="driverId" className="block text-sm font-medium mb-1">
                      Assign Driver (Optional)
                    </label>
                    <Select
                      value={formData.driverId || ''}
                      onValueChange={(value) => handleChange('driverId', value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not assigned yet</SelectItem>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-eco-purple hover:bg-eco-purple/90"
                      disabled={loading || blockchainLoading}
                    >
                      {loading || blockchainLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Shipment...
                        </>
                      ) : (
                        'Create Shipment'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateShipment;
