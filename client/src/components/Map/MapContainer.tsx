import React from 'react';
import { MessageBar } from '@fluentui/react-components';
import GoogleMap from './GoogleMap';

interface MapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco - user can change later
  zoom = 15
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

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
        apiKey={apiKey}
        center={center}
        zoom={zoom}
        height="100%"
      />
    </div>
  );
};

export default MapContainer;