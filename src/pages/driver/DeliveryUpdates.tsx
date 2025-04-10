import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useBlockchain } from '@/hooks/useBlockchain';
import { supabase } from '@/integrations/supabase/client';
import MapView from '@/components/dashboard/MapView';
import { Truck, Box, PackageCheck, ThermometerSnowflake, Droplets, ZapOff, AlertCircle } from 'lucide-react';

// Define the interfaces for our data structures
interface Shipment {
  id: string;
  title: string;
  description?: string;
  origin: string;
  destination: string;
  status: 'processing' | 'in-transit' | 'delivered' | 'delayed';
  transportType: string;
}

interface SensorData {
  id: string;
  shipment_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  shock_detected: boolean;
  latitude: number;
  longitude: number;
  battery_level: number;
  blockchain_tx_hash: string;
  status?: string; // Optional field for display purposes
  location?: string; // Optional field for display purposes
  notes?: string; // Optional field for display purposes
}

const DeliveryUpdates = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<Shipment | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestSensorData, setLatestSensorData] = useState<SensorData | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'processing' | 'in-transit' | 'delivered' | 'delayed'>('in-transit');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { updateShipmentStatus, verifyBlockchainRecord } = useBlockchain();

  // Simulate current location for the map
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Fetch shipments assigned to the driver
  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
      try {
        // In a real app, this would filter by assigned_driver_id
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const formattedShipments = data.map((shipment) => ({
          id: shipment.id,
          title: shipment.title,
          description: shipment.description,
          origin: shipment.origin,
          destination: shipment.destination,
          status: shipment.status as 'processing' | 'in-transit' | 'delivered' | 'delayed',
          transportType: shipment.transport_type
        }));
        
        setShipments(formattedShipments);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        toast.error('Failed to load shipments');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  // When a shipment is selected, fetch its details and sensor data
  useEffect(() => {
    if (!selectedShipment) return;

    const fetchShipmentDetails = async () => {
      setLoading(true);
      try {
        // Fetch shipment details
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('id', selectedShipment)
          .single();
          
        if (shipmentError) throw shipmentError;
        
        setShipmentDetails({
          id: shipmentData.id,
          title: shipmentData.title,
          description: shipmentData.description,
          origin: shipmentData.origin,
          destination: shipmentData.destination,
          status: shipmentData.status as 'processing' | 'in-transit' | 'delivered' | 'delayed',
          transportType: shipmentData.transport_type
        });
        
        // Fetch sensor data
        const { data: sensorDataResult, error: sensorError } = await supabase
          .from('sensor_data')
          .select('*')
          .eq('shipment_id', selectedShipment)
          .order('timestamp', { ascending: false });
          
        if (sensorError) throw sensorError;
        
        // Add default/mock values for display purposes
        const enrichedSensorData = sensorDataResult.map((data: any) => ({
          ...data,
          status: data.status || 'normal',
          location: data.location || `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
          notes: data.notes || 'No notes available'
        }));
        
        setSensorData(enrichedSensorData);
        
        if (enrichedSensorData.length > 0) {
          setLatestSensorData(enrichedSensorData[0]);
          setCurrentLocation({
            lat: enrichedSensorData[0].latitude,
            lng: enrichedSensorData[0].longitude
          });
        }
      } catch (error) {
        console.error('Error fetching shipment details:', error);
        toast.error('Failed to load shipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [selectedShipment]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedShipment || !updateStatus) {
      toast.error('Please select a shipment and status');
      return;
    }
    
    setLoading(true);
    try {
      // Update status in database
      const { error: updateError } = await supabase
        .from('shipments')
        .update({ status: updateStatus })
        .eq('id', selectedShipment);
        
      if (updateError) throw updateError;
      
      // Record update on blockchain
      const result = await updateShipmentStatus(selectedShipment, updateStatus);
      
      if (!result || !result.success) {
        throw new Error('Blockchain verification failed');
      }
      
      // Add sensor data with notes
      if (currentLocation) {
        const { error: sensorError } = await supabase
          .from('sensor_data')
          .insert({
            shipment_id: selectedShipment,
            temperature: Math.random() * 5 + 2, // 2-7°C
            humidity: Math.random() * 20 + 50, // 50-70%
            shock_detected: false,
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            battery_level: Math.random() * 30 + 70, // 70-100%
            notes: notes
          });
          
        if (sensorError) throw sensorError;
      }
      
      toast.success(`Shipment status updated to ${updateStatus}`);
      
      // Refresh shipment details
      if (shipmentDetails) {
        setShipmentDetails({
          ...shipmentDetails,
          status: updateStatus
        });
      }
      
      setNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Simulate location update (in a real app, this would use GPS)
  const updateLocation = () => {
    if (!currentLocation) return;
    
    // Simulate small movement
    const newLocation = {
      lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: currentLocation.lng + (Math.random() - 0.5) * 0.01
    };
    
    setCurrentLocation(newLocation);
    
    toast.info('Location updated');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-eco-dark mb-6">Delivery Updates</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipment selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Active Shipments</CardTitle>
              <CardDescription>Select a shipment to update</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedShipment || ''} onValueChange={setSelectedShipment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a shipment" />
                </SelectTrigger>
                <SelectContent>
                  {shipments.map(shipment => (
                    <SelectItem key={shipment.id} value={shipment.id}>
                      {shipment.title} - {shipment.origin} to {shipment.destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {shipmentDetails && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium">{shipmentDetails.title}</h3>
                  <p className="text-sm text-muted-foreground">{shipmentDetails.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-eco-purple">{shipmentDetails.transportType}</Badge>
                    <Badge className={
                      shipmentDetails.status === 'processing' ? 'bg-blue-500' :
                      shipmentDetails.status === 'in-transit' ? 'bg-yellow-500' :
                      shipmentDetails.status === 'delivered' ? 'bg-green-500' :
                      'bg-red-500'
                    }>
                      {shipmentDetails.status}
                    </Badge>
                  </div>
                  <div className="text-sm mt-2">
                    <div className="flex items-center gap-1">
                      <Box className="h-4 w-4" /> From: {shipmentDetails.origin}
                    </div>
                    <div className="flex items-center gap-1">
                      <PackageCheck className="h-4 w-4" /> To: {shipmentDetails.destination}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Map view */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Shipment Location</CardTitle>
              <CardDescription>Real-time tracking and sensor data</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {selectedShipment && shipmentDetails && (
                <MapView
                  originLocation={shipmentDetails.origin}
                  destinationLocation={shipmentDetails.destination}
                  currentLocation={currentLocation}
                  transportType={shipmentDetails.transportType}
                  sensorData={latestSensorData ? {
                    temperature: latestSensorData.temperature,
                    humidity: latestSensorData.humidity,
                    shockDetected: latestSensorData.shock_detected
                  } : undefined}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Update status */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>Change shipment status and add notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Select 
                    value={updateStatus} 
                    onValueChange={(value: 'processing' | 'in-transit' | 'delivered' | 'delayed') => setUpdateStatus(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Textarea
                    placeholder="Add delivery notes or issues..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Button 
                  className="w-full bg-eco-purple hover:bg-eco-purple/90" 
                  onClick={handleStatusUpdate}
                  disabled={loading || !selectedShipment || !updateStatus}
                >
                  Update Status
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={updateLocation}
                  disabled={!currentLocation}
                >
                  Refresh Location
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Sensor Data */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
              <CardDescription>Latest data from IoT sensors</CardDescription>
            </CardHeader>
            <CardContent>
              {latestSensorData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-100 p-4 rounded-md flex items-center">
                    <ThermometerSnowflake className="h-8 w-8 text-blue-500 mr-2" />
                    <div>
                      <div className="text-sm text-muted-foreground">Temperature</div>
                      <div className="text-lg font-medium">{latestSensorData.temperature.toFixed(1)}°C</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md flex items-center">
                    <Droplets className="h-8 w-8 text-blue-400 mr-2" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="text-lg font-medium">{latestSensorData.humidity.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-md flex items-center">
                    {latestSensorData.shock_detected ? (
                      <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                    ) : (
                      <ZapOff className="h-8 w-8 text-gray-500 mr-2" />
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground">Shock Detection</div>
                      <div className="text-lg font-medium">
                        {latestSensorData.shock_detected ? 'Detected' : 'None'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No sensor data available for this shipment
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
