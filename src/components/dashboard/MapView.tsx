
import { useState, useEffect } from 'react';
import { MapPin, Truck } from 'lucide-react';

// Mock data representing shipment locations
const shipmentLocations = [
  { id: 'SH001', lat: 150, long: 100, status: 'in-transit', name: 'Medical Supplies to NYC' },
  { id: 'SH002', lat: 250, long: 200, status: 'in-transit', name: 'Electronics Batch #42' },
  { id: 'SH003', lat: 180, long: 240, status: 'delayed', name: 'Food Products to Atlanta' },
];

interface Marker {
  id: string;
  x: number;
  y: number;
  status: 'in-transit' | 'delayed' | 'delivered';
  name: string;
}

const MapView = () => {
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  
  // Convert mock locations to markers
  useEffect(() => {
    const newMarkers = shipmentLocations.map(loc => ({
      id: loc.id,
      x: loc.lat,
      y: loc.long,
      status: loc.status as 'in-transit' | 'delayed' | 'delivered',
      name: loc.name
    }));
    
    setMarkers(newMarkers);
  }, []);

  // Handle marker click
  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(selectedMarker?.id === marker.id ? null : marker);
  };

  // Simulate marker movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkers(prev => prev.map(marker => {
        if (marker.status === 'in-transit') {
          return {
            ...marker,
            x: marker.x + (Math.random() * 2 - 1) * 3,
            y: marker.y + (Math.random() * 2 - 1) * 3
          };
        }
        return marker;
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-eco-light/30 rounded-lg overflow-hidden h-[400px] border border-eco-light">
      {/* This is a placeholder for the actual map */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Map grid lines */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px' 
        }}></div>
        
        {/* Map markers */}
        {markers.map(marker => (
          <div 
            key={marker.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-500"
            style={{ left: marker.x, top: marker.y }}
            onClick={() => handleMarkerClick(marker)}
          >
            {marker.status === 'in-transit' ? (
              <div className="relative">
                <div className="absolute -inset-2 bg-eco-purple/20 rounded-full animate-pulse-slow"></div>
                <Truck size={24} className="text-eco-purple" />
              </div>
            ) : (
              <MapPin size={24} className="text-red-500" />
            )}
            
            {/* Info box */}
            {selectedMarker?.id === marker.id && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-48 p-2 bg-white rounded-md shadow-lg z-10 text-xs">
                <p className="font-bold text-eco-gray">{marker.name}</p>
                <p className="text-eco-gray">ID: {marker.id}</p>
                <p className="capitalize text-eco-gray">Status: {marker.status.replace('-', ' ')}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-eco-dark/80 to-transparent">
        <p className="text-white text-sm font-medium">Interactive Map (Placeholder)</p>
        <p className="text-white/70 text-xs">
          In production, this would integrate with Google Maps or MapBox API
        </p>
      </div>
    </div>
  );
};

export default MapView;
