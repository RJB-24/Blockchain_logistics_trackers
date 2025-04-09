
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShipmentStatusCardProps {
  shipment: {
    id: string;
    title: string;
    origin: string;
    destination: string;
    status: 'processing' | 'in-transit' | 'delivered' | 'delayed';
    eta?: string;
    carbonFootprint?: number;
  };
  className?: string;
}

const statusConfig = {
  'processing': {
    icon: Package,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    label: 'Processing'
  },
  'in-transit': {
    icon: Truck,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    label: 'In Transit'
  },
  'delivered': {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100',
    label: 'Delivered'
  },
  'delayed': {
    icon: Clock,
    color: 'text-red-500',
    bg: 'bg-red-100',
    label: 'Delayed'
  }
};

const ShipmentStatusCard = ({ shipment, className }: ShipmentStatusCardProps) => {
  const statusInfo = statusConfig[shipment.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className={cn("eco-card", className)}>
      <div className="p-4 border-b border-eco-light/30">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{shipment.title}</h3>
          <div className={cn(
            "flex items-center px-2 py-1 rounded-full text-xs font-medium",
            statusInfo.bg, statusInfo.color
          )}>
            <StatusIcon size={14} className="mr-1" />
            {statusInfo.label}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">ID: {shipment.id}</p>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-sm font-medium">{shipment.origin}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">To</p>
            <p className="text-sm font-medium">{shipment.destination}</p>
          </div>
        </div>
        
        {shipment.eta && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Estimated Arrival</p>
            <p className="text-sm font-medium">{shipment.eta}</p>
          </div>
        )}
        
        {shipment.carbonFootprint !== undefined && (
          <div className="mt-2 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full",
                  shipment.carbonFootprint <= 30 ? "bg-green-500" : 
                  shipment.carbonFootprint <= 60 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(100, shipment.carbonFootprint)}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs font-medium">
              {shipment.carbonFootprint}% CO₂
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentStatusCard;
