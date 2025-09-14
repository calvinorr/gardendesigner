import React, { useEffect, useRef, useState } from 'react';
import { Spinner, Text, MessageBar } from '@fluentui/react-components';
import { googleMapsLoader } from '../../services/googleMapsLoader';

// Extend window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 54.651427935687735, lng: -5.580687100975887 }, // User's property center
  zoom = 18, // Higher zoom for 1-acre property detail
  height = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 GoogleMap useEffect starting');

    if (!apiKey) {
      console.error('❌ No API key provided');
      setError('Google Maps API key is required');
      setLoading(false);
      return;
    }

    const initializeMap = async () => {
      try {
        console.log('🔄 Starting map initialization...');

        // Wait for DOM element
        let attempts = 0;
        while (!mapRef.current && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!mapRef.current) {
          throw new Error('Map element not available after 5 seconds');
        }

        console.log('✅ Map element found:', {
          offsetWidth: mapRef.current.offsetWidth,
          offsetHeight: mapRef.current.offsetHeight
        });

        // Load Google Maps API using centralized loader
        await googleMapsLoader.load(apiKey);
        console.log('✅ Google Maps API loaded');

        // Verify element still exists
        if (!mapRef.current) {
          throw new Error('Map element lost during API load');
        }

        // Create map
        console.log('🗺️ Creating map instance...');
        const map = new google.maps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          mapTypeId: 'satellite',
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER,
          },
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'auto',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        console.log('✅ Map created successfully');

        // Add marker
        new google.maps.Marker({
          position: center,
          map: map,
          title: 'Property Center - 1 Acre Garden',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4caf50',
            fillOpacity: 1,
            strokeColor: '#2d8659',
            strokeWeight: 3,
            scale: 10,
          },
        });

        console.log('✅ Marker added');

        mapInstanceRef.current = map;
        setLoading(false);
        console.log('🎉 Map initialization complete!');

      } catch (err) {
        console.error('❌ Map initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      mapInstanceRef.current = null;
    };
  }, [apiKey, center, zoom, height]);

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
        width: '100%',
        height: height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5'
      }}>
        <Spinner size="large" />
        <Text>Loading Google Maps...</Text>
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: height,
        border: '1px solid #e0e0e0',
        borderRadius: '4px'
      }}
    />
  );
};

export default GoogleMap;