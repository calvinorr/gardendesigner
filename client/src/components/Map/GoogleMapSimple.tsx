import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapSimpleProps {
  apiKey: string;
}

export const GoogleMapSimple: React.FC<GoogleMapSimpleProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    console.log('🚀 Simple Google Map starting');

    if (!apiKey) {
      setStatus('Error: No API key');
      return;
    }

    const initMap = async () => {
      try {
        setStatus('Loading Google Maps API...');

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['maps']
        });

        await loader.load();
        setStatus('API loaded, creating map...');

        if (!mapRef.current) {
          setStatus('Error: Map container not found');
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 54.651427935687735, lng: -5.580687100975887 },
          zoom: 18,
          mapTypeId: 'satellite'
        });

        new google.maps.Marker({
          position: { lat: 54.651427935687735, lng: -5.580687100975887 },
          map: map,
          title: 'Property Center'
        });

        setStatus('Map loaded successfully!');
        console.log('✅ Map loaded successfully');

      } catch (error) {
        console.error('❌ Map error:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    initMap();
  }, [apiKey]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Simple Google Map Test</h3>
      <p>Status: {status}</p>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f0f0f0'
        }}
      />
    </div>
  );
};

export default GoogleMapSimple;