
import React, { useEffect, useState } from 'react';
import { MapPin, Truck, Ship, Train } from 'lucide-react';

interface MapViewProps {
  originLocation?: string;
  destinationLocation?: string;
  currentLocation?: { lat: number; lng: number } | null;
  routeData?: { lat: number; lng: number }[];
  transportType?: string;
  sensorData?: {
    temperature?: number | null;
    humidity?: number | null;
    shockDetected?: boolean;
  };
}

// This is a mock implementation of a map component
// In a real application, this would use a library like Google Maps, Mapbox, or Leaflet
const MapView: React.FC<MapViewProps> = ({ 
  originLocation, 
  destinationLocation, 
  currentLocation,
  routeData,
  transportType = 'truck',
  sensorData
}) => {
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);

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
      case 'truck':
      default:
        return <Truck className="text-eco-purple" size={24} />;
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
        {originLocation && destinationLocation && (
          <div className="absolute left-[20%] right-[20%] top-1/2 h-0.5 bg-eco-purple">
            <div className="absolute left-0 top-0 h-2 w-2 -mt-1 bg-eco-purple rounded-full"></div>
            <div className="absolute right-0 top-0 h-2 w-2 -mt-1 bg-eco-purple rounded-full"></div>
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
        
        <p className="text-sm text-muted-foreground mt-4">
          This is a placeholder for an interactive map.<br />
          In a production environment, this would display an actual map with real-time tracking.
        </p>
      </div>
    </div>
  );
};

export default MapView;
