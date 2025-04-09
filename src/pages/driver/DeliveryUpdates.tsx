
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/hooks/useBlockchain';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CheckCircle2, PackageCheck, AlertTriangle, QrCode, Truck, MapPin, Camera, Package, Calendar, Clock } from 'lucide-react';

// Define interface for shipment data
interface Shipment {
  id: string;
  title: string;
  description: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'delayed';
  tracking_id: string;
  origin: string;
  destination: string;
  assigned_driver_id: string;
  customer_id: string;
  planned_departure_date: string;
  estimated_arrival_date: string;
  actual_arrival_date: string | null;
  transport_type: string;
  product_type: string;
  quantity: number;
  weight: number;
  carbon_footprint: number;
}

// Define interface for update data
interface DeliveryUpdate {
  id: string;
  shipment_id: string;
  status: string;
  location: string;
  notes: string;
  created_at: string;
  temperature?: number;
  humidity?: number;
  blockchain_tx_hash?: string;
}

// Interface for blockchain data
interface DeliveryBlockchainData {
  shipmentId: string;
  status: string;
  location: string;
  driverId: string;
  timestamp: string;
}

const DeliveryUpdates = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-transit' | 'delivered'>('all');
  const [updates, setUpdates] = useState<DeliveryUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  
  // Form state for new update
  const [updateStatus, setUpdateStatus] = useState('in-transit');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateTemperature, setUpdateTemperature] = useState<number | undefined>(undefined);
  const [updateHumidity, setUpdateHumidity] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [qrScannerActive, setQrScannerActive] = useState(false);
  
  const { user } = useAuth();
  const { verifyOnBlockchain } = useBlockchain();

  useEffect(() => {
    fetchAssignedShipments();
  }, [filter]);

  const fetchAssignedShipments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('shipments')
        .select('*')
        .eq('assigned_driver_id', user.id);
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query.order('estimated_arrival_date', { ascending: true });
      
      if (error) throw error;
      
      setShipments(data || []);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentUpdates = async (shipmentId: string) => {
    try {
      setUpdatesLoading(true);
      
      const { data, error } = await supabase
        .from('sensor_data')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      setUpdates(data || []);
    } catch (err) {
      console.error('Error fetching shipment updates:', err);
      toast.error('Failed to load shipment updates');
    } finally {
      setUpdatesLoading(false);
    }
  };

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    fetchShipmentUpdates(shipment.id);
    // Reset form fields
    setUpdateStatus(shipment.status);
    setUpdateLocation('');
    setUpdateNotes('');
    setUpdateTemperature(undefined);
    setUpdateHumidity(undefined);
  };

  const handleQrCodeScan = (data: string) => {
    // In a real app, this would parse the QR code data
    // For demo purposes, we'll just find a shipment with this tracking ID
    const shipment = shipments.find(s => s.tracking_id === data);
    
    if (shipment) {
      handleSelectShipment(shipment);
      setQrScannerActive(false);
      toast.success(`Found shipment: ${shipment.title}`);
    } else {
      toast.error('No matching shipment found');
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedShipment || !user) return;
    
    if (!updateLocation) {
      toast.error('Please enter the current location');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the update record
      const newUpdate = {
        shipment_id: selectedShipment.id,
        status: updateStatus,
        location: updateLocation,
        notes: updateNotes,
        temperature: updateTemperature,
        humidity: updateHumidity
      };
      
      const { data, error } = await supabase
        .from('sensor_data')
        .insert(newUpdate);
      
      if (error) throw error;
      
      // Update the shipment status if changed
      if (updateStatus !== selectedShipment.status) {
        const shipmentUpdate: Partial<Shipment> = {
          status: updateStatus as Shipment['status']
        };
        
        // If status is delivered, set actual arrival date
        if (updateStatus === 'delivered') {
          shipmentUpdate.actual_arrival_date = new Date().toISOString();
        }
        
        const { error: shipmentError } = await supabase
          .from('shipments')
          .update(shipmentUpdate)
          .eq('id', selectedShipment.id);
        
        if (shipmentError) throw shipmentError;
      }
      
      // Verify on blockchain
      const blockchainData: DeliveryBlockchainData = {
        shipmentId: selectedShipment.id,
        status: updateStatus,
        location: updateLocation,
        driverId: user.id,
        timestamp: new Date().toISOString()
      };
      
      try {
        const txHash = await verifyOnBlockchain(blockchainData);
        
        // Update the record with the blockchain transaction hash
        if (txHash) {
          await supabase
            .from('sensor_data')
            .update({ blockchain_tx_hash: txHash })
            .eq('shipment_id', selectedShipment.id)
            .order('timestamp', { ascending: false })
            .limit(1);
        }
      } catch (blockchainError) {
        console.error('Blockchain verification failed, but update was recorded:', blockchainError);
      }
      
      // Refresh the updates list and selected shipment
      fetchShipmentUpdates(selectedShipment.id);
      fetchAssignedShipments();
      
      // Reset form
      setUpdateLocation('');
      setUpdateNotes('');
      setUpdateTemperature(undefined);
      setUpdateHumidity(undefined);
      
      toast.success('Delivery update recorded successfully');
      setUpdateDialogOpen(false);
      
    } catch (err) {
      console.error('Error submitting update:', err);
      toast.error('Failed to record delivery update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'in-transit':
        return <Badge className="bg-blue-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'delayed':
        return <Badge className="bg-red-500">Delayed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Delivery Updates</h1>
            <p className="text-muted-foreground">Record location and status for your assigned shipments</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setQrScannerActive(true)} 
              className="bg-eco-purple hover:bg-eco-purple/90"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
          </div>
        </div>

        {qrScannerActive && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Scan a shipment's QR code to quickly find it</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="border-2 border-dashed border-eco-purple p-8 mb-4 rounded-lg">
                    <Camera className="h-24 w-24 text-eco-purple" />
                    <p className="text-center mt-2 text-sm text-muted-foreground">
                      QR scanner would activate here in production
                    </p>
                  </div>
                  
                  <div className="space-y-4 w-full max-w-md">
                    <div>
                      <Label htmlFor="tracking-id">Enter Tracking ID Manually</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          id="tracking-id" 
                          placeholder="e.g. ECO-12345" 
                        />
                        <Button 
                          onClick={() => {
                            const input = document.getElementById('tracking-id') as HTMLInputElement;
                            if (input.value) {
                              handleQrCodeScan(input.value);
                            }
                          }}
                        >
                          Find
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setQrScannerActive(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Assigned Shipments</CardTitle>
              <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="in-transit" className="flex-1">In Transit</TabsTrigger>
                  <TabsTrigger value="delivered" className="flex-1">Delivered</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-eco-purple border-t-transparent rounded-full"></div>
                </div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No shipments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shipments.map((shipment) => (
                    <div 
                      key={shipment.id} 
                      className={`p-4 border rounded-lg cursor-pointer hover:border-eco-purple transition-colors ${
                        selectedShipment?.id === shipment.id ? 'border-eco-purple bg-eco-purple/5' : ''
                      }`}
                      onClick={() => handleSelectShipment(shipment)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{shipment.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {shipment.tracking_id}
                          </p>
                        </div>
                        {getStatusBadge(shipment.status)}
                      </div>
                      
                      <div className="mt-2 text-sm flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{shipment.origin} → {shipment.destination}</span>
                      </div>
                      
                      <div className="mt-2 text-xs text-muted-foreground">
                        ETA: {new Date(shipment.estimated_arrival_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedShipment ? 
                  `Shipment: ${selectedShipment.title}` : 
                  'Delivery Details'
                }
              </CardTitle>
              <CardDescription>
                {selectedShipment ? 
                  `Tracking ID: ${selectedShipment.tracking_id}` : 
                  'Select a shipment to view details'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedShipment ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Truck className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a shipment from the list to view details</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Shipment Details</h3>
                      <div className="space-y-2">
                        <div className="flex">
                          <span className="w-32 text-sm text-muted-foreground">Status:</span>
                          <span>{getStatusBadge(selectedShipment.status)}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 text-sm text-muted-foreground">From:</span>
                          <span>{selectedShipment.origin}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 text-sm text-muted-foreground">To:</span>
                          <span>{selectedShipment.destination}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 text-sm text-muted-foreground">Product:</span>
                          <span>{selectedShipment.product_type}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 text-sm text-muted-foreground">Quantity:</span>
                          <span>{selectedShipment.quantity} units</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 text-sm text-muted-foreground">Weight:</span>
                          <span>{selectedShipment.weight} kg</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Delivery Schedule</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Departure Date:</span>
                          <span className="ml-2">
                            {new Date(selectedShipment.planned_departure_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Expected Arrival:</span>
                          <span className="ml-2">
                            {new Date(selectedShipment.estimated_arrival_date).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedShipment.actual_arrival_date && (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-sm text-muted-foreground">Actual Arrival:</span>
                            <span className="ml-2">
                              {new Date(selectedShipment.actual_arrival_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6">
                        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full bg-eco-purple hover:bg-eco-purple/90"
                              disabled={selectedShipment.status === 'delivered'}
                            >
                              <PackageCheck className="mr-2 h-4 w-4" />
                              {selectedShipment.status === 'delivered' ? 'Delivered' : 'Update Status'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Delivery Status</DialogTitle>
                              <DialogDescription>
                                Record the current status and location of this shipment
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label htmlFor="status">Current Status</Label>
                                  <select
                                    id="status"
                                    value={updateStatus}
                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  >
                                    <option value="in-transit">In Transit</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="delayed">Delayed</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <Label htmlFor="location">Current Location</Label>
                                  <Input
                                    id="location"
                                    placeholder="e.g. Chicago, IL"
                                    value={updateLocation}
                                    onChange={(e) => setUpdateLocation(e.target.value)}
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Any additional information about this update"
                                    value={updateNotes}
                                    onChange={(e) => setUpdateNotes(e.target.value)}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="temperature">Temperature (°C)</Label>
                                    <Input
                                      id="temperature"
                                      type="number"
                                      placeholder="e.g. 22"
                                      value={updateTemperature?.toString() || ''}
                                      onChange={(e) => setUpdateTemperature(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="humidity">Humidity (%)</Label>
                                    <Input
                                      id="humidity"
                                      type="number"
                                      placeholder="e.g. 60"
                                      value={updateHumidity?.toString() || ''}
                                      onChange={(e) => setUpdateHumidity(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSubmitUpdate}
                                disabled={isSubmitting || !updateLocation}
                                className="bg-eco-green hover:bg-eco-green/90"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Submit Update
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-4">Delivery Updates</h3>
                    {updatesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-eco-purple border-t-transparent rounded-full"></div>
                      </div>
                    ) : updates.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No updates recorded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {updates.map((update, index) => (
                          <div key={update.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  {getStatusBadge(update.status)}
                                  {update.blockchain_tx_hash && (
                                    <Badge variant="outline" className="ml-2 border-eco-purple text-eco-purple">
                                      Blockchain Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-2 text-sm">
                                  <span className="text-muted-foreground">Location:</span> {update.location}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(update.created_at)}
                              </p>
                            </div>
                            
                            {update.notes && (
                              <p className="mt-2 text-sm">{update.notes}</p>
                            )}
                            
                            {(update.temperature !== undefined || update.humidity !== undefined) && (
                              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                {update.temperature !== undefined && (
                                  <span>Temperature: {update.temperature}°C</span>
                                )}
                                {update.humidity !== undefined && (
                                  <span>Humidity: {update.humidity}%</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeliveryUpdates;
