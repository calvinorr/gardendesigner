import React from 'react';
import { MessageBar } from '@fluentui/react-components';
import GoogleMap from './GoogleMap';
import GoogleMapSimple from './GoogleMapSimple';

interface MapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center = { lat: 54.651427935687735, lng: -5.580687100975887 }, // User's property coordinates
  zoom = 18
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // Debug logging
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('Map center:', center);

  if (!apiKey) {
    return (
      <div className="map-container" style={{ padding: '2rem' }}>
        <MessageBar intent="error">
          <strong>Configuration Error:</strong> Google Maps API key not found.
          Please check your environment variables.
        </MessageBar>
      </div>
    );
  }

  return (
    <div className="map-container">
      <GoogleMap
        apiKey={apiKey!}
        center={center}
        zoom={zoom}
        height="500px"
      />
    </div>
  );
};

export default MapContainer;