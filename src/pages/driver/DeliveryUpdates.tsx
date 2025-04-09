
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useBlockchain } from '@/hooks/useBlockchain';
import { 
  ClipboardCheck, 
  Truck, 
  PackageCheck, 
  PackageX, 
  Clock, 
  LocateFixed,
  Camera,
  BarChart,
  ThermometerSun,
  RefreshCw
} from 'lucide-react';

interface Shipment {
  id: string;
  title: string;
  origin: string;
  destination: string;
  status: string;
  tracking_id: string;
  planned_departure_date: string | null;
  estimated_arrival_date: string | null;
  actual_arrival_date: string | null;
  transport_type: string;
  blockchain_tx_hash: string | null;
}

interface SensorData {
  temperature: number | null;
  humidity: number | null;
  shock_detected: boolean | null;
  latitude: number | null;
  longitude: number | null;
  battery_level: number | null;
}

const DeliveryUpdates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateShipmentStatus, isLoading: blockchainLoading } = useBlockchain();
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState<SensorData>({
    temperature: null,
    humidity: null,
    shock_detected: false,
    latitude: null,
    longitude: null,
    battery_level: null
  });
  
  // Dialog states
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingSensor, setUpdatingSensor] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAssignedShipments();
    }
  }, [user]);

  const fetchAssignedShipments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('assigned_driver_id', user?.id)
        .order('estimated_arrival_date', { ascending: true });
      
      if (error) throw error;
      
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching assigned shipments:', error);
      toast.error('Failed to load assigned shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedShipment || !newStatus) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update status on blockchain first (if integrated)
      const blockchainResult = await updateShipmentStatus(selectedShipment.id, newStatus);
      
      // Then update the database
      const { error } = await supabase
        .from('shipments')
        .update({
          status: newStatus,
          actual_arrival_date: newStatus === 'delivered' ? new Date().toISOString() : null,
          blockchain_tx_hash: blockchainResult?.transactionHash || selectedShipment.blockchain_tx_hash
        })
        .eq('id', selectedShipment.id);
      
      if (error) throw error;
      
      // Update local state
      setShipments(shipments.map(shipment => 
        shipment.id === selectedShipment.id 
          ? { 
              ...shipment, 
              status: newStatus,
              actual_arrival_date: newStatus === 'delivered' ? new Date().toISOString() : null,
              blockchain_tx_hash: blockchainResult?.transactionHash || shipment.blockchain_tx_hash
            } 
          : shipment
      ));
      
      toast.success(`Shipment status updated to ${newStatus}`);
      setUpdateDialogOpen(false);
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast.error('Failed to update shipment status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSensorUpdate = async () => {
    if (!selectedShipment) return;
    
    try {
      setUpdatingSensor(true);
      
      // Register sensor data on blockchain
      const blockchainResult = await updateShipmentStatus(
        selectedShipment.id, 
        selectedShipment.status,
        { sensorData: JSON.stringify(sensorData) }
      );
      
      // Record sensor data in database
      const { error } = await supabase
        .from('sensor_data')
        .insert({
          shipment_id: selectedShipment.id,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          shock_detected: sensorData.shock_detected,
          latitude: sensorData.latitude,
          longitude: sensorData.longitude,
          battery_level: sensorData.battery_level,
          blockchain_tx_hash: blockchainResult?.transactionHash || null
        });
      
      if (error) throw error;
      
      toast.success('Sensor data recorded successfully');
      setSensorDialogOpen(false);
    } catch (error) {
      console.error('Error recording sensor data:', error);
      toast.error('Failed to record sensor data');
    } finally {
      setUpdatingSensor(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'in-transit':
        return <Badge className="bg-amber-500">In Transit</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'delayed':
        return <Badge className="bg-red-500">Delayed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openUpdateDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewStatus(shipment.status);
    setUpdateDialogOpen(true);
  };

  const openSensorDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    // Reset sensor data
    setSensorData({
      temperature: 20,
      humidity: 50,
      shock_detected: false,
      latitude: 40.7128,
      longitude: -74.0060,
      battery_level: 85
    });
    setSensorDialogOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-eco-dark">Delivery Updates</h1>
            <p className="text-muted-foreground">Manage and update your assigned shipments</p>
          </div>
          <Button 
            className="bg-eco-purple hover:bg-eco-purple/90"
            onClick={fetchAssignedShipments}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5 text-eco-purple" />
              Assigned Shipments
            </CardTitle>
            <CardDescription>
              Update delivery status and record sensor data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-eco-purple" />
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No shipments assigned to you yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Tracking ID</TableHead>
                      <TableHead>Shipment</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.tracking_id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{shipment.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {shipment.transport_type.charAt(0).toUpperCase() + shipment.transport_type.slice(1)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <span className="truncate max-w-[100px]">{shipment.origin}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[100px]">{shipment.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>
                          {formatDate(shipment.estimated_arrival_date)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openUpdateDialog(shipment)}
                            >
                              <ClipboardCheck className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openSensorDialog(shipment)}
                              className="text-eco-purple border-eco-purple/25 hover:bg-eco-purple/10"
                            >
                              <BarChart className="h-4 w-4 mr-1" />
                              Sensors
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/shipment/${shipment.id}`)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shipment Status</DialogTitle>
            <DialogDescription>
              Update the status for shipment {selectedShipment?.tracking_id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value="in-transit">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-amber-500" />
                      In Transit
                    </div>
                  </SelectItem>
                  <SelectItem value="delivered">
                    <div className="flex items-center">
                      <PackageCheck className="h-4 w-4 mr-2 text-green-500" />
                      Delivered
                    </div>
                  </SelectItem>
                  <SelectItem value="delayed">
                    <div className="flex items-center">
                      <PackageX className="h-4 w-4 mr-2 text-red-500" />
                      Delayed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newStatus === 'delivered' && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <PackageCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">Delivery Confirmation</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Marking as delivered will record the current timestamp as the actual delivery date.
                      This action will be recorded on the blockchain for verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {newStatus === 'delayed' && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <PackageX className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800">Delay Notification</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Marking as delayed will notify the customer and manager about the delay.
                      Please consider adding notes about the reason for the delay.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-eco-purple hover:bg-eco-purple/90"
              onClick={handleStatusUpdate}
              disabled={updatingStatus || blockchainLoading}
            >
              {updatingStatus || blockchainLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sensor Data Dialog */}
      <Dialog open={sensorDialogOpen} onOpenChange={setSensorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Sensor Data</DialogTitle>
            <DialogDescription>
              Update IoT sensor readings for shipment {selectedShipment?.tracking_id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="temperature" className="text-sm font-medium flex items-center">
                  <ThermometerSun className="h-4 w-4 mr-1 text-amber-500" />
                  Temperature (°C)
                </label>
                <Input
                  id="temperature"
                  type="number"
                  value={sensorData.temperature || ''}
                  onChange={(e) => setSensorData({...sensorData, temperature: parseFloat(e.target.value)})}
                  placeholder="e.g., 22.5"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="humidity" className="text-sm font-medium flex items-center">
                  <Cloud className="h-4 w-4 mr-1 text-blue-500" />
                  Humidity (%)
                </label>
                <Input
                  id="humidity"
                  type="number"
                  value={sensorData.humidity || ''}
                  onChange={(e) => setSensorData({...sensorData, humidity: parseFloat(e.target.value)})}
                  placeholder="e.g., 45"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="latitude" className="text-sm font-medium flex items-center">
                  <LocateFixed className="h-4 w-4 mr-1 text-eco-purple" />
                  Latitude
                </label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={sensorData.latitude || ''}
                  onChange={(e) => setSensorData({...sensorData, latitude: parseFloat(e.target.value)})}
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className="text-sm font-medium flex items-center">
                  <LocateFixed className="h-4 w-4 mr-1 text-eco-purple" />
                  Longitude
                </label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={sensorData.longitude || ''}
                  onChange={(e) => setSensorData({...sensorData, longitude: parseFloat(e.target.value)})}
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="battery" className="text-sm font-medium flex items-center">
                  <Battery className="h-4 w-4 mr-1 text-green-500" />
                  Battery Level (%)
                </label>
                <Input
                  id="battery"
                  type="number"
                  max="100"
                  min="0"
                  value={sensorData.battery_level || ''}
                  onChange={(e) => setSensorData({...sensorData, battery_level: parseFloat(e.target.value)})}
                  placeholder="e.g., 85"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <label className="text-sm font-medium flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-eco-purple focus:ring-eco-purple/25 mr-2"
                    checked={sensorData.shock_detected || false}
                    onChange={(e) => setSensorData({...sensorData, shock_detected: e.target.checked})}
                  />
                  <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                  Shock Detected
                </label>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Mock getting current GPS location
                  toast.info('Getting GPS coordinates...');
                  setTimeout(() => {
                    setSensorData({
                      ...sensorData,
                      latitude: 40.7128 + (Math.random() * 0.02 - 0.01),
                      longitude: -74.0060 + (Math.random() * 0.02 - 0.01)
                    });
                    toast.success('GPS location updated');
                  }, 1000);
                }}
              >
                <LocateFixed className="mr-2 h-4 w-4" />
                Get Current GPS Location
              </Button>
            </div>
            
            <div className="mt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast.info('Scanning QR code...');
                  setTimeout(() => {
                    toast.success('Package QR code scanned successfully');
                  }, 1000);
                }}
              >
                <Camera className="mr-2 h-4 w-4" />
                Scan Package QR Code
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setSensorDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-eco-purple hover:bg-eco-purple/90"
              onClick={handleSensorUpdate}
              disabled={updatingSensor || blockchainLoading}
            >
              {updatingSensor || blockchainLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Sensor Data'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Add missing components
const ArrowRight = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Cloud = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 7A5 5 0 0 0 7 7m0 0a3 3 0 1 0-3 5h13a3 3 0 0 0 0-6h-1" />
  </svg>
);

const Battery = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
    <line x1="22" x2="22" y1="11" y2="13" />
  </svg>
);

const AlertTriangle = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export default DeliveryUpdates;
