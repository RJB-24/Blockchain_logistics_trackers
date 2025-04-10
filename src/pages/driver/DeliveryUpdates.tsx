
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useBlockchain } from '@/hooks/blockchain';
import { Package, TruckIcon, Ship, Train, PlaneIcon, Timer, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

// Create a proper shipment type
type ShipmentStatus = 'processing' | 'in-transit' | 'delivered' | 'delayed';

interface Shipment {
  id: string;
  title: string;
  description: string;
  origin: string;
  destination: string;
  status: ShipmentStatus; // Now properly typed
  transportType: string;
}

const getStatusIcon = (status: ShipmentStatus) => {
  switch (status) {
    case 'processing':
      return <Timer className="h-5 w-5 text-blue-500" />;
    case 'in-transit':
      return <TruckIcon className="h-5 w-5 text-green-500" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'delayed':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
};

const getTransportIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'truck':
      return <TruckIcon className="h-5 w-5 text-slate-700" />;
    case 'ship':
      return <Ship className="h-5 w-5 text-blue-700" />;
    case 'rail':
      return <Train className="h-5 w-5 text-purple-700" />;
    case 'air':
      return <PlaneIcon className="h-5 w-5 text-sky-700" />;
    default:
      return <Package className="h-5 w-5 text-slate-700" />;
  }
};

const getStatusColor = (status: ShipmentStatus) => {
  switch (status) {
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'in-transit':
      return 'bg-green-100 text-green-800';
    case 'delivered':
      return 'bg-green-600 text-white';
    case 'delayed':
      return 'bg-amber-100 text-amber-800';
  }
};

const DeliveryUpdates = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const { updateShipmentStatus } = useBlockchain();

  // Simulate fetching shipments data
  useEffect(() => {
    // In a real app, this would fetch data from an API
    setTimeout(() => {
      const mockShipments: Shipment[] = [
        {
          id: 'SH-2025-001',
          title: 'Medical Supplies to Toronto',
          description: '250 units of medical equipment',
          origin: 'New York, USA',
          destination: 'Toronto, Canada',
          status: 'in-transit',
          transportType: 'truck'
        },
        {
          id: 'SH-2025-002',
          title: 'Electronics Shipment',
          description: '500 laptop computers',
          origin: 'Shanghai, China',
          destination: 'Los Angeles, USA',
          status: 'processing',
          transportType: 'ship'
        },
        {
          id: 'SH-2025-003',
          title: 'Fresh Produce Delivery',
          description: '2 tons of fresh vegetables',
          origin: 'Mexico City, Mexico',
          destination: 'Houston, USA',
          status: 'delayed',
          transportType: 'truck'
        },
        {
          id: 'SH-2025-004',
          title: 'Automobile Parts',
          description: 'Spare parts for assembly line',
          origin: 'Detroit, USA',
          destination: 'Chicago, USA',
          status: 'delivered',
          transportType: 'rail'
        },
        {
          id: 'SH-2025-005',
          title: 'Emergency Medical Supplies',
          description: 'Vaccines and medical equipment',
          origin: 'Paris, France',
          destination: 'Abuja, Nigeria',
          status: 'in-transit',
          transportType: 'air'
        }
      ];
      
      setShipments(mockShipments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleUpdateStatus = async (shipmentId: string, newStatus: ShipmentStatus) => {
    setUpdatingStatus(shipmentId);
    
    try {
      // Update status on blockchain
      const result = await updateShipmentStatus(shipmentId, newStatus);
      
      if (result && result.success) {
        // Update local state
        setShipments(prev => 
          prev.map(shipment => 
            shipment.id === shipmentId 
              ? { ...shipment, status: newStatus } 
              : shipment
          )
        );
        
        toast.success(`Shipment ${shipmentId} status updated to ${newStatus}`);
      } else {
        throw new Error('Failed to update status on blockchain');
      }
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast.error('Failed to update shipment status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Delivery Updates</h1>
            <p className="text-muted-foreground">Manage and update shipment statuses</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {shipments.map((shipment) => (
              <Card key={shipment.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {getTransportIcon(shipment.transportType)}
                        <span className="ml-2">{shipment.title}</span>
                      </CardTitle>
                      <CardDescription>{shipment.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(shipment.status)}>
                      {getStatusIcon(shipment.status)}
                      <span className="ml-1 capitalize">{shipment.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Origin</p>
                      <p className="font-medium">{shipment.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium">{shipment.destination}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, 'processing')}
                      disabled={shipment.status === 'processing' || updatingStatus === shipment.id}
                    >
                      <Timer className="h-4 w-4 mr-1" />
                      Processing
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, 'in-transit')}
                      disabled={shipment.status === 'in-transit' || updatingStatus === shipment.id}
                    >
                      <TruckIcon className="h-4 w-4 mr-1" />
                      In Transit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, 'delivered')}
                      disabled={shipment.status === 'delivered' || updatingStatus === shipment.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Delivered
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateStatus(shipment.id, 'delayed')}
                      disabled={shipment.status === 'delayed' || updatingStatus === shipment.id}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Delayed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeliveryUpdates;
