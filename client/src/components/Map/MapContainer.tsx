import React from 'react';
import { MessageBar } from '@fluentui/react-components';
import GoogleMap from './GoogleMap';

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
      <div style={{
        marginBottom: '1rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h2 style={{
          margin: '0 0 0.25rem 0',
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#2d8659'
        }}>
          Property Map
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#666',
          opacity: 0.8
        }}>
          Satellite view • Northern Ireland • 1 acre property
        </p>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <GoogleMap
          apiKey={apiKey!}
          center={center}
          zoom={zoom}
          height="100%"
        />
      </div>
    </div>
  );
};

export default MapContainer;