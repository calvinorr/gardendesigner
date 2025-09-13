import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Spinner, Text, MessageBar } from '@fluentui/react-components';

interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 15,
  height = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['maps']
        });

        await loader.load();

        // Create the map
        const map = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          mapTypeId: 'satellite', // Use satellite view for garden mapping
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
          },
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Add a test marker
        new google.maps.Marker({
          position: center,
          map: map,
          title: 'Test Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4caf50',
            fillOpacity: 1,
            strokeColor: '#2d8659',
            strokeWeight: 2,
            scale: 8,
          },
        });

        mapInstanceRef.current = map;
        setLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setLoading(false);
      }
    };

    if (apiKey) {
      initializeMap();
    } else {
      setError('Google Maps API key is required');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      mapInstanceRef.current = null;
    };
  }, [apiKey, center, zoom]);

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <MessageBar intent="error">
          <strong>Map Error:</strong> {error}
        </MessageBar>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <Spinner size="large" />
        <Text>Loading Google Maps...</Text>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height,
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}
    />
  );
};

export default GoogleMap;