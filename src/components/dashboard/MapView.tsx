
import React, { useEffect, useState } from 'react';
import { MapPin, Truck, Ship, Train, Plane, AlertTriangle, Leaf } from 'lucide-react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RoutePoint {
  lat: number;
  lng: number;
  type?: 'origin' | 'destination' | 'waypoint';
  name?: string;
}

interface MapViewProps {
  originLocation?: string;
  destinationLocation?: string;
  currentLocation?: { lat: number; lng: number } | null;
  routeData?: RoutePoint[];
  transportType?: string;
  sensorData?: {
    temperature?: number | null;
    humidity?: number | null;
    shockDetected?: boolean;
  };
  showBlockchainVerification?: boolean;
  shipmentId?: string;
  transactionHash?: string;
  carbonFootprint?: number;
  multiModalRoute?: {
    segments: {
      mode: 'truck' | 'ship' | 'rail' | 'air';
      startLocation: string;
      endLocation: string;
      distance: number;
      carbonFootprint: number;
    }[];
  };
  onVerifyClick?: () => void;
  onOptimizeClick?: () => void;
}

// This is a mock implementation of a map component
// In a real application, this would use a library like Google Maps, Mapbox, or Leaflet
const MapView: React.FC<MapViewProps> = ({ 
  originLocation, 
  destinationLocation, 
  currentLocation,
  routeData,
  transportType = 'truck',
  sensorData,
  showBlockchainVerification = false,
  shipmentId,
  transactionHash,
  carbonFootprint,
  multiModalRoute,
  onVerifyClick,
  onOptimizeClick
}) => {
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'unverified' | 'verifying' | 'failed'>('unverified');
  const [sustainabilityTip, setSustainabilityTip] = useState<string | null>(null);
  const { verifyBlockchainRecord } = useBlockchain();

  // Simulate weather data fetching
  useEffect(() => {
    if (currentLocation) {
      // This would be a real API call in production
      const hasAlert = Math.random() > 0.7;
      if (hasAlert) {
        const alerts = [
          "Heavy rain in the area might cause delays",
          "Storm warning along the route",
          "High winds may affect shipping"
        ];
        setWeatherAlert(alerts[Math.floor(Math.random() * alerts.length)]);
      } else {
        setWeatherAlert(null);
      }
    }
  }, [currentLocation]);

  // Get transport icon based on type
  const TransportIcon = () => {
    switch (transportType?.toLowerCase()) {
      case 'ship':
        return <Ship className="text-blue-500" size={24} />;
      case 'rail':
      case 'train':
        return <Train className="text-purple-500" size={24} />;
      case 'air':
      case 'plane':
        return <Plane className="text-sky-500" size={24} />;
      case 'truck':
      default:
        return <Truck className="text-eco-purple" size={24} />;
    }
  };

  // Generate random sustainability tips
  useEffect(() => {
    const tips = [
      "Switching from air to rail transport can reduce carbon emissions by up to 90%.",
      "Consolidating shipments can reduce both costs and environmental impact.",
      "Rail transport is one of the most eco-friendly options for long-distance freight.",
      "Real-time route optimization can reduce fuel consumption by up to 15%.",
      "Using electric vehicles for last-mile delivery can eliminate local emissions."
    ];
    
    setSustainabilityTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  // Verify blockchain record when component mounts or transactionHash changes
  useEffect(() => {
    if (showBlockchainVerification && transactionHash) {
      verifyTransaction();
    }
  }, [showBlockchainVerification, transactionHash]);

  // Function to verify transaction on blockchain
  const verifyTransaction = async () => {
    if (!transactionHash) return;
    
    setVerificationStatus('verifying');
    try {
      const result = await verifyBlockchainRecord(transactionHash);
      if (result && result.verified) {
        setVerificationStatus('verified');
      } else {
        setVerificationStatus('failed');
      }
    } catch (error) {
      console.error("Error verifying blockchain record:", error);
      setVerificationStatus('failed');
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-100 flex flex-col">
      {/* Mock map with grid lines to simulate a map */}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-gray-200"></div>
          ))}
        </div>
        
        {/* Origin marker */}
        {originLocation && (
          <div className="absolute left-[15%] top-[70%] flex flex-col items-center">
            <MapPin className="text-green-500" size={20} />
            <div className="text-xs bg-white px-1 rounded shadow mt-1">
              {originLocation}
            </div>
          </div>
        )}
        
        {/* Destination marker */}
        {destinationLocation && (
          <div className="absolute right-[15%] top-[25%] flex flex-col items-center">
            <MapPin className="text-red-500" size={20} />
            <div className="text-xs bg-white px-1 rounded shadow mt-1">
              {destinationLocation}
            </div>
          </div>
        )}
        
        {/* Current location marker */}
        {currentLocation && (
          <div className="absolute left-[40%] top-[45%] flex flex-col items-center animate-pulse">
            <div className="relative">
              <TransportIcon />
              {sensorData?.shockDetected && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></span>
              )}
            </div>
            <div className="text-xs bg-white px-1 rounded shadow mt-1">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </div>
          </div>
        )}
        
        {/* Route line - simulation */}
        {originLocation && destinationLocation && !multiModalRoute && (
          <div className="absolute left-[20%] right-[20%] top-1/2 h-0.5 bg-eco-purple">
            <div className="absolute left-0 top-0 h-2 w-2 -mt-1 bg-eco-purple rounded-full"></div>
            <div className="absolute right-0 top-0 h-2 w-2 -mt-1 bg-eco-purple rounded-full"></div>
          </div>
        )}
        
        {/* Multi-modal route visualization */}
        {multiModalRoute && multiModalRoute.segments.map((segment, index) => {
          // Calculate positions (simplified for mock)
          const left = 20 + (index * 60 / multiModalRoute.segments.length) + '%';
          const right = 80 - ((multiModalRoute.segments.length - index - 1) * 60 / multiModalRoute.segments.length) + '%';
          const top = 40 + (index % 2 ? 10 : -10) + '%';
          
          const segmentColor = 
            segment.mode === 'truck' ? 'bg-eco-purple' :
            segment.mode === 'ship' ? 'bg-blue-500' :
            segment.mode === 'rail' ? 'bg-purple-500' :
            'bg-sky-500';
            
          return (
            <div 
              key={index} 
              className={`absolute h-0.5 ${segmentColor}`}
              style={{ left, right, top }}
            >
              <div className="absolute left-0 top-0 h-2 w-2 -mt-1 rounded-full" style={{ backgroundColor: 'inherit' }}></div>
              <div className="absolute right-0 top-0 h-2 w-2 -mt-1 rounded-full" style={{ backgroundColor: 'inherit' }}></div>
              <div 
                className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs bg-white px-1 py-0.5 rounded shadow"
              >
                {segment.mode.toUpperCase()} • {segment.distance}km • {segment.carbonFootprint.toFixed(1)}kg CO₂
              </div>
            </div>
          );
        })}
        
        {/* Route waypoints */}
        {routeData && routeData.map((point, index) => {
          // Calculate position based on index (simplified for mock)
          const left = 20 + (index * 60 / routeData.length) + '%';
          const top = 50 + (index % 2 ? 10 : -10) + '%';
          
          return (
            <div 
              key={index} 
              className="absolute flex flex-col items-center"
              style={{ left, top }}
            >
              <MapPin 
                className={point.type === 'origin' ? 'text-green-500' : 
                           point.type === 'destination' ? 'text-red-500' : 
                           'text-yellow-500'} 
                size={16} 
              />
              {point.name && (
                <div className="text-xs bg-white px-1 rounded shadow mt-1">
                  {point.name}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Carbon footprint indicator */}
        {carbonFootprint !== undefined && (
          <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md flex items-center">
            <Leaf className="text-green-500 mr-1" size={16} />
            <span className="text-xs font-medium">{carbonFootprint.toFixed(1)} kg CO₂</span>
          </div>
        )}
        
        {/* Blockchain verification badge */}
        {showBlockchainVerification && transactionHash && (
          <div className="absolute top-4 left-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    className={
                      verificationStatus === 'verified' ? 'bg-green-500' :
                      verificationStatus === 'verifying' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }
                  >
                    {verificationStatus === 'verified' ? 'Verified on Blockchain' : 
                     verificationStatus === 'verifying' ? 'Verifying...' : 
                     'Not Verified'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs w-[200px]">
                    {verificationStatus === 'verified' 
                      ? `This shipment data is verified on blockchain with transaction hash: ${transactionHash.substring(0, 10)}...` 
                      : 'Click to verify this shipment data on the blockchain'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      {/* Information panel */}
      <div className="bg-white p-4 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-2">Shipment Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1"><strong>Origin:</strong> {originLocation || 'Not specified'}</p>
            <p className="mb-1"><strong>Destination:</strong> {destinationLocation || 'Not specified'}</p>
            {currentLocation ? (
              <p className="mb-1">
                <strong>Current Location:</strong> {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </p>
            ) : (
              <p className="mb-1"><strong>Current Location:</strong> Not available</p>
            )}
          </div>
          
          {sensorData && (
            <div>
              <h4 className="font-medium text-sm mb-1">Sensor Readings:</h4>
              {sensorData.temperature !== null && sensorData.temperature !== undefined && (
                <p className="text-sm"><strong>Temperature:</strong> {sensorData.temperature}°C</p>
              )}
              {sensorData.humidity !== null && sensorData.humidity !== undefined && (
                <p className="text-sm"><strong>Humidity:</strong> {sensorData.humidity}%</p>
              )}
              {sensorData.shockDetected && (
                <p className="text-sm text-red-500"><strong>Alert:</strong> Shock detected!</p>
              )}
            </div>
          )}
        </div>
        
        {weatherAlert && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
            <strong>Weather Alert:</strong> {weatherAlert}
          </div>
        )}
        
        {sustainabilityTip && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm flex items-start">
            <Leaf className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <p><strong>Sustainability Tip:</strong> {sustainabilityTip}</p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {onVerifyClick && (
            <Button variant="outline" size="sm" onClick={onVerifyClick} className="text-xs">
              Verify on Blockchain
            </Button>
          )}
          
          {onOptimizeClick && (
            <Button variant="outline" size="sm" onClick={onOptimizeClick} className="text-xs">
              Optimize Route
            </Button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          This is a placeholder for an interactive map.<br />
          In a production environment, this would display an actual map with real-time tracking.
        </p>
      </div>
    </div>
  );
};

export default MapView;
