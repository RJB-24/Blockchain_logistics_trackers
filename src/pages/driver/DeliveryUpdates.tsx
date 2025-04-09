
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/hooks/useBlockchain';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, Clock, Package, CheckCircle, X, MapPin, AlertTriangle } from 'lucide-react';

// Define interfaces
interface Shipment {
  id: string;
  title: string;
  tracking_id: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'delayed';
  origin: string;
  destination: string;
  customer_id: string;
  carbon_footprint: number;
  planned_departure_date: string;
  estimated_arrival_date: string;
  actual_arrival_date: string | null;
  transport_type: string;
  product_type: string;
  quantity: number;
  weight: number;
  blockchain_tx_hash?: string;
  assigned_driver_id?: string;
  description?: string;
  created_at?: string;
}

interface DeliveryUpdate {
  id: string;
  shipment_id: string;
  timestamp: string;
  status: string;
  location: string;
  notes: string | null;
  created_at: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  humidity?: number;
  battery_level?: number;
  shock_detected?: boolean;
  blockchain_tx_hash?: string;
}

const DeliveryUpdates = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [updates, setUpdates] = useState<DeliveryUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState<'processing' | 'in-transit' | 'delivered' | 'delayed'>('in-transit');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateShipmentStatus } = useBlockchain();

  useEffect(() => {
    fetchDriverShipments();
  }, [user?.id]);

  const fetchDriverShipments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('assigned_driver_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Type cast the status field to match our Shipment interface
        const typedShipments: Shipment[] = data.map(shipment => ({
          ...shipment,
          status: shipment.status as 'processing' | 'in-transit' | 'delivered' | 'delayed'
        }));
        
        setShipments(typedShipments);
        
        // Select the first shipment automatically if available
        if (typedShipments.length > 0) {
          setSelectedShipment(typedShipments[0]);
          await fetchShipmentUpdates(typedShipments[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentUpdates = async (shipmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Convert sensor_data to DeliveryUpdate format
        const formattedUpdates: DeliveryUpdate[] = data.map(item => ({
          id: item.id,
          shipment_id: item.shipment_id,
          timestamp: item.timestamp,
          status: item.status || 'unknown',
          location: item.location || 'Unknown location',
          notes: item.notes || null,
          created_at: item.timestamp,
          latitude: item.latitude,
          longitude: item.longitude,
          temperature: item.temperature,
          humidity: item.humidity,
          battery_level: item.battery_level,
          shock_detected: item.shock_detected || false,
          blockchain_tx_hash: item.blockchain_tx_hash
        }));
        
        setUpdates(formattedUpdates);
      }
    } catch (err) {
      console.error('Error fetching shipment updates:', err);
      toast.error('Failed to load shipment updates');
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedShipment) return;
    
    setSubmitting(true);
    
    try {
      // Create a new update
      const { data: newUpdate, error } = await supabase
        .from('sensor_data')
        .insert({
          shipment_id: selectedShipment.id,
          timestamp: new Date().toISOString(),
          status: updateStatus,
          location: updateLocation,
          notes: updateNotes,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update shipment status on blockchain
      try {
        await updateShipmentStatus(selectedShipment.id, updateStatus);
      } catch (blockchainError) {
        console.error('Blockchain update failed, but update was submitted:', blockchainError);
      }
      
      // Optimistically update the UI
      setUpdates(prevUpdates => [
        {
          id: newUpdate.id,
          shipment_id: selectedShipment.id,
          timestamp: newUpdate.timestamp,
          status: updateStatus,
          location: updateLocation,
          notes: updateNotes,
          created_at: newUpdate.timestamp,
        },
        ...prevUpdates
      ]);
      
      // Clear the form
      setUpdateLocation('');
      setUpdateNotes('');
      
      toast.success('Shipment update submitted');
    } catch (err: any) {
      console.error('Error submitting update:', err);
      toast.error('Failed to submit update', {
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
          <h1 className="text-2xl font-bold text-eco-dark">Delivery Updates</h1>
          <p className="text-muted-foreground">Manage and track your assigned deliveries</p>
        </div>
        
        {loading ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ) : shipments.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={20} />
                <p>No shipments assigned to you yet.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Shipment</CardTitle>
                <CardDescription>Choose a shipment to view and update its status</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-2">
                    {shipments.map((shipment) => (
                      <Button
                        key={shipment.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setSelectedShipment(shipment);
                          fetchShipmentUpdates(shipment.id);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{shipment.title}</span>
                          {selectedShipment?.id === shipment.id && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              {selectedShipment ? (
                <>
                  <CardHeader>
                    <CardTitle>{selectedShipment.title}</CardTitle>
                    <CardDescription>
                      Tracking ID: {selectedShipment.tracking_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Origin</p>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{selectedShipment.origin}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Destination</p>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{selectedShipment.destination}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Product Type</p>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{selectedShipment.product_type}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Quantity</p>
                        <span>{selectedShipment.quantity}</span>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Weight</p>
                        <span>{selectedShipment.weight} kg</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p>{selectedShipment.description || 'No description provided.'}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Submit Update</h3>
                      
                      <div>
                        <Label htmlFor="update-location">Location</Label>
                        <Input
                          id="update-location"
                          placeholder="e.g. Chicago, IL"
                          value={updateLocation}
                          onChange={(e) => setUpdateLocation(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="update-notes">Notes</Label>
                        <Textarea
                          id="update-notes"
                          placeholder="e.g. Delayed due to weather conditions"
                          value={updateNotes}
                          onChange={(e) => setUpdateNotes(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="update-status">Status</Label>
                        <select
                          id="update-status"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value as 'processing' | 'in-transit' | 'delivered' | 'delayed')}
                        >
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="delayed">Delayed</option>
                          <option value="processing">Processing</option>
                        </select>
                      </div>
                      
                      <Button
                        onClick={handleSubmitUpdate}
                        disabled={submitting}
                        className="w-full bg-eco-purple hover:bg-eco-purple/90"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                            Submitting...
                          </div>
                        ) : (
                          'Submit Update'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="h-5 w-5" />
                    <p>Select a shipment to view details and submit updates.</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
        
        {selectedShipment && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Latest updates for this shipment</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                {updates.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Clock className="h-5 w-5 mx-auto mb-2" />
                    No updates yet.
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    {updates.map((update) => (
                      <div key={update.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {update.status === 'delivered' ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <Truck className="h-4 w-4 text-muted-foreground mr-1" />
                            )}
                            <span className="font-medium">{update.location}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(update.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {update.notes && (
                          <p className="mt-2 text-sm">{update.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeliveryUpdates;
