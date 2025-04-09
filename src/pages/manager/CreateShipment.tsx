import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/hooks/useBlockchain';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Package, AlertTriangle, Truck, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface ShipmentFormData {
  title: string;
  description: string;
  transport_type: string;
  product_type: string;
  quantity: number;
  weight: number;
  origin: string;
  destination: string;
  planned_departure_date: Date | null;
  estimated_arrival_date: Date | null;
  customer_id: string;
  driver_id: string;
}

interface User {
  id: string;
  full_name: string;
  role: string;
}

const CreateShipment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { registerShipment } = useBlockchain();

  const [formData, setFormData] = useState<ShipmentFormData>({
    title: '',
    description: '',
    transport_type: 'truck',
    product_type: '',
    quantity: 1,
    weight: 0,
    origin: '',
    destination: '',
    planned_departure_date: null,
    estimated_arrival_date: null,
    customer_id: '',
    driver_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();

  // Fetch customers and drivers on component mount
  useState(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch customers
      const { data: customerData, error: customerError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'customer');
      
      if (customerError) throw customerError;
      
      setCustomers(customerData || []);
      
      // Fetch drivers
      const { data: driverData, error: driverError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'driver');
      
      if (driverError) throw driverError;
      
      setDrivers(driverData || []);
      
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: date
    }));
  };

  const calculateDistance = (origin: string, destination: string): number => {
    // This is a placeholder for a real distance calculation service
    // In a real application, you would use a map API to calculate the distance
    return Math.floor(Math.random() * 1000) + 500; // Random distance between 500 and 1500 km
  };

  const calculateCarbonFootprint = (transportType: string, distanceKm: number): number => {
    // Carbon emission factors (kg CO2/km)
    const emissionFactors: Record<string, number> = {
      truck: 0.15,
      train: 0.08,
      ship: 0.05,
      air: 0.50
    };
    
    const factor = emissionFactors[transportType] || emissionFactors.truck;
    return Math.round(factor * distanceKm * 100) / 100; // Rounded to 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.origin || !formData.destination || 
        !formData.transport_type || !formData.product_type ||
        !formData.customer_id || !formData.driver_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Generate tracking ID
      const trackingId = `ECO-${nanoid(6).toUpperCase()}`;
      
      // Calculate carbon footprint based on transport type and estimated distance
      const distance = calculateDistance(formData.origin, formData.destination);
      const carbonFootprint = calculateCarbonFootprint(formData.transport_type, distance);
      
      // Prepare shipment data
      const shipmentData = {
        title: formData.title,
        description: formData.description,
        tracking_id: trackingId,
        transport_type: formData.transport_type,
        product_type: formData.product_type,
        quantity: formData.quantity,
        weight: formData.weight,
        origin: formData.origin,
        destination: formData.destination,
        planned_departure_date: formData.planned_departure_date ? formData.planned_departure_date.toISOString() : null,
        estimated_arrival_date: formData.estimated_arrival_date ? formData.estimated_arrival_date.toISOString() : null,
        customer_id: formData.customer_id,
        assigned_driver_id: formData.driver_id,
        status: 'processing',
        carbon_footprint: carbonFootprint
      };
      
      // Insert shipment into database
      const { data, error } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Register on blockchain
      if (data) {
        try {
          const result = await registerShipment({
            id: data.id,
            transportType: data.transport_type,
            origin: data.origin,
            destination: data.destination,
            carbonFootprint: data.carbon_footprint
          });
          
          if (result && result.transactionHash) {
            // Update shipment with blockchain hash
            await supabase
              .from('shipments')
              .update({ blockchain_tx_hash: result.transactionHash })
              .eq('id', data.id);
          }
        } catch (blockchainErr) {
          console.error('Blockchain registration failed, but shipment was created:', blockchainErr);
        }
      }
      
      toast.success('Shipment created successfully', {
        description: `Tracking ID: ${trackingId}`
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        transport_type: 'truck',
        product_type: '',
        quantity: 1,
        weight: 0,
        origin: '',
        destination: '',
        planned_departure_date: null,
        estimated_arrival_date: null,
        customer_id: '',
        driver_id: ''
      });
      
      // Navigate to manager dashboard
      setTimeout(() => {
        navigate('/manager');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating shipment:', err);
      toast.error('Failed to create shipment', {
        description: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Shipment</h1>
          <p className="text-muted-foreground">Create a new shipment and assign it to a driver</p>
        </div>
        
        {loading && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={20} />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
            <CardDescription>Enter the details for the new shipment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Shipment Title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Shipment Description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transport_type">Transport Type</Label>
                  <Select onValueChange={(value) => handleSelectChange('transport_type', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select transport type" defaultValue={formData.transport_type} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">
                        <Truck className="mr-2 h-4 w-4" />
                        Truck
                      </SelectItem>
                      <SelectItem value="train">
                        <Train className="mr-2 h-4 w-4" />
                        Train
                      </SelectItem>
                      <SelectItem value="ship">
                        <Ship className="mr-2 h-4 w-4" />
                        Ship
                      </SelectItem>
                      <SelectItem value="air">
                        <Package className="mr-2 h-4 w-4" />
                        Air
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="product_type">Product Type</Label>
                  <Input
                    type="text"
                    id="product_type"
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    placeholder="Product Type"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Quantity"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight (kg)"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    type="text"
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="Origin"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Destination"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Planned Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.planned_departure_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.planned_departure_date ? (
                          format(formData.planned_departure_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={(date) => {
                          setDepartureDate(date);
                          handleDateChange('planned_departure_date', date);
                        }}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Estimated Arrival Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.estimated_arrival_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.estimated_arrival_date ? (
                          format(formData.estimated_arrival_date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={arrivalDate}
                        onSelect={(date) => {
                          setArrivalDate(date);
                          handleDateChange('estimated_arrival_date', date);
                        }}
                        disabled={(date) =>
                          date < new Date() || (departureDate && date < departureDate)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_id">Customer</Label>
                  <Select onValueChange={(value) => handleSelectChange('customer_id', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="driver_id">Driver</Label>
                  <Select onValueChange={(value) => handleSelectChange('driver_id', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={() => navigate('/manager')}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Creating Shipment...
                    </div>
                  ) : (
                    'Create Shipment'
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateShipment;
