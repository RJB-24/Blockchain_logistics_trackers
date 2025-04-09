
import React from 'react';

interface MapViewProps {
  originLocation?: string;
  destinationLocation?: string;
  currentLocation?: { lat: number; lng: number } | null;
}

// This is a mock implementation of a map component
// In a real application, this would use a library like Google Maps, Mapbox, or Leaflet
const MapView: React.FC<MapViewProps> = ({ 
  originLocation, 
  destinationLocation, 
  currentLocation 
}) => {
  return (
    <div className="relative h-full w-full bg-gray-100 flex items-center justify-center">
      <div className="text-center p-4">
        <h3 className="text-lg font-medium mb-2">Map View</h3>
        <p className="mb-1"><strong>Origin:</strong> {originLocation || 'Not specified'}</p>
        <p className="mb-1"><strong>Destination:</strong> {destinationLocation || 'Not specified'}</p>
        {currentLocation ? (
          <p className="mb-1">
            <strong>Current Location:</strong> {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </p>
        ) : (
          <p className="mb-1"><strong>Current Location:</strong> Not available</p>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          This is a placeholder for an interactive map.<br />
          In a production environment, this would display an actual map.
        </p>
      </div>
    </div>
  );
};

export default MapView;
