
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/hooks/useBlockchain';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Truck, Package, CalendarIcon, Leaf } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface ShipmentFormData {
  title: string;
  description: string;
  origin: string;
  destination: string;
  product_type: string;
  quantity: number;
  weight: number;
  transport_type: 'truck' | 'rail' | 'ship' | 'air' | 'multi-modal';
  planned_departure_date: string;
  estimated_arrival_date: string;
  assigned_driver_id: string;
  customer_id: string;
}

const CreateShipment = () => {
  const [formData, setFormData] = useState<ShipmentFormData>({
    title: '',
    description: '',
    origin: '',
    destination: '',
    product_type: '',
    quantity: 1,
    weight: 0,
    transport_type: 'truck',
    planned_departure_date: '',
    estimated_arrival_date: '',
    assigned_driver_id: '',
    customer_id: '',
  });
  
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(undefined);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [drivers, setDrivers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  
  const navigate = useNavigate();
  const { verifyOnBlockchain } = useBlockchain();
  const { user } = useAuth();

  // Load customers and drivers on component mount
  useState(() => {
    fetchUsers();
  });

  const fetchUsers = async () => {
    try {
      // Fetch customers
      setCustomersLoading(true);
      const { data: customerData, error: customerError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'customer');
      
      if (customerError) throw customerError;
      
      const customerIds = customerData.map(item => item.user_id);
      
      if (customerIds.length > 0) {
        const { data: customerProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', customerIds);
        
        if (profileError) throw profileError;
        
        setCustomers(customerProfiles || []);
      }
      
      setCustomersLoading(false);
      
      // Fetch drivers
      setDriversLoading(true);
      const { data: driverData, error: driverError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'driver');
      
      if (driverError) throw driverError;
      
      const driverIds = driverData.map(item => item.user_id);
      
      if (driverIds.length > 0) {
        const { data: driverProfiles, error: driverProfileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', driverIds);
        
        if (driverProfileError) throw driverProfileError;
        
        setDrivers(driverProfiles || []);
      }
      
      setDriversLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
      setCustomersLoading(false);
      setDriversLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCarbonFootprint = (): number => {
    // This is a simplified calculation for demo purposes
    // In a real application, this would use more complex algorithms based on:
    // - Distance between origin and destination
    // - Transport type (truck, ship, etc.)
    // - Weight of the shipment
    // - Other factors like fuel efficiency
    
    const baseEmissions = {
      truck: 62, // g CO2 per ton-km
      rail: 22,  // g CO2 per ton-km
      ship: 8,   // g CO2 per ton-km
      air: 602,  // g CO2 per ton-km
      'multi-modal': 40 // g CO2 per ton-km (average)
    };
    
    // Simplified distance estimate (would use Google Maps Distance Matrix API in production)
    const distance = 500; // km
    
    // Calculate emissions in kg
    const emissionFactor = baseEmissions[formData.transport_type as keyof typeof baseEmissions];
    const weight = formData.weight / 1000; // Convert to tons
    const emissions = (emissionFactor * weight * distance) / 1000; // Convert g to kg
    
    return Math.round(emissions * 100) / 100; // Round to 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departureDate || !arrivalDate) {
      toast.error('Please select departure and arrival dates');
      return;
    }
    
    if (!formData.assigned_driver_id || !formData.customer_id) {
      toast.error('Please select both a driver and a customer');
      return;
    }
    
    try {
      setLoading(true);
      
      // Generate a tracking ID
      const trackingId = `ECO-${nanoid(8).toUpperCase()}`;
      
      // Calculate carbon footprint
      const carbonFootprint = calculateCarbonFootprint();
      
      // Create the shipment
      const newShipment = {
        title: formData.title,
        description: formData.description,
        origin: formData.origin,
        destination: formData.destination,
        status: 'processing',
        planned_departure_date: departureDate.toISOString(),
        estimated_arrival_date: arrivalDate.toISOString(),
        product_type: formData.product_type,
        quantity: formData.quantity,
        weight: formData.weight,
        carbon_footprint: carbonFootprint,
        transport_type: formData.transport_type,
        assigned_driver_id: formData.assigned_driver_id,
        customer_id: formData.customer_id,
        tracking_id: trackingId
      };
      
      const { data: shipmentData, error } = await supabase
        .from('shipments')
        .insert([newShipment])
        .select()
        .single();
      
      if (error) throw error;
      
      // Record on blockchain
      try {
        const blockchainData = {
          shipmentId: shipmentData.id,
          trackingId,
          origin: formData.origin,
          destination: formData.destination,
          carbonFootprint
        };
        
        const txHash = await verifyOnBlockchain(blockchainData);
        
        // Update the shipment with the blockchain tx hash
        if (txHash) {
          await supabase
            .from('shipments')
            .update({ blockchain_tx_hash: txHash })
            .eq('id', shipmentData.id);
        }
      } catch (blockchainError) {
        console.error('Blockchain verification failed, but shipment was created:', blockchainError);
      }
      
      toast.success('Shipment created successfully');
      navigate('/manager');
    } catch (err) {
      console.error('Error creating shipment:', err);
      toast.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-eco-dark">Create New Shipment</h1>
          <p className="text-muted-foreground">Set up a new shipment with carbon tracking</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Shipment Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter a descriptive title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product_type">Product Type</Label>
                      <Input
                        id="product_type"
                        name="product_type"
                        placeholder="e.g. Electronics, Food, etc."
                        value={formData.product_type}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide additional details about the shipment"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin</Label>
                      <Input
                        id="origin"
                        name="origin"
                        placeholder="City, Country"
                        value={formData.origin}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        name="destination"
                        placeholder="City, Country"
                        value={formData.destination}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        placeholder="Number of items"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Total weight in kg"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="transport_type">Transport Type</Label>
                      <Select
                        value={formData.transport_type}
                        onValueChange={(value) => handleSelectChange('transport_type', value)}
                      >
                        <SelectTrigger id="transport_type">
                          <SelectValue placeholder="Select transport type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="rail">Rail</SelectItem>
                          <SelectItem value="ship">Ship</SelectItem>
                          <SelectItem value="air">Air</SelectItem>
                          <SelectItem value="multi-modal">Multi-modal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="planned_departure_date">Planned Departure Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {departureDate ? format(departureDate, 'PPP') : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={departureDate}
                            onSelect={setDepartureDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estimated_arrival_date">Estimated Arrival Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {arrivalDate ? format(arrivalDate, 'PPP') : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={arrivalDate}
                            onSelect={setArrivalDate}
                            initialFocus
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
                  <Truck className="mr-2 h-5 w-5 text-eco-purple" />
                  Assignment & Summary
                </CardTitle>
                <CardDescription>
                  Assign to driver and customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="assigned_driver_id">Assigned Driver</Label>
                    <Select
                      value={formData.assigned_driver_id}
                      onValueChange={(value) => handleSelectChange('assigned_driver_id', value)}
                    >
                      <SelectTrigger id="assigned_driver_id">
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {driversLoading ? (
                          <SelectItem value="" disabled>Loading drivers...</SelectItem>
                        ) : drivers.length === 0 ? (
                          <SelectItem value="" disabled>No drivers available</SelectItem>
                        ) : (
                          drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customer_id">Customer</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => handleSelectChange('customer_id', value)}
                    >
                      <SelectTrigger id="customer_id">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersLoading ? (
                          <SelectItem value="" disabled>Loading customers...</SelectItem>
                        ) : customers.length === 0 ? (
                          <SelectItem value="" disabled>No customers available</SelectItem>
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.full_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Estimated Carbon Footprint</h3>
                        <div className="flex items-center mt-2">
                          <Leaf className="h-5 w-5 text-green-500 mr-2" />
                          <span className="text-xl font-bold">
                            {formData.weight > 0 && formData.transport_type ? 
                              `${calculateCarbonFootprint()} kg CO₂` : 
                              '0 kg CO₂'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on weight, distance, and transport method
                        </p>
                      </div>
                      
                      {(formData.transport_type === 'truck' || formData.transport_type === 'air') && (
                        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                          <p className="text-sm text-yellow-800 flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>
                              Consider using rail or ship transport to reduce carbon emissions by up to 90%.
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-eco-purple hover:bg-eco-purple/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Creating Shipment...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        Create Shipment
                      </div>
                    )}
                  </Button>
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
