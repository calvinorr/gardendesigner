import React, { useEffect, useRef, useState } from 'react';
import { Spinner, Text, MessageBar } from '@fluentui/react-components';
import { Loader } from '@googlemaps/js-api-loader';

// Extend window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapWithDrawingProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onShapeCreated?: (shape: google.maps.drawing.OverlayType, overlay: google.maps.MVCObject) => void;
  onShapeDeleted?: (overlay: google.maps.MVCObject) => void;
  enableDrawingTools?: boolean;
}

export const GoogleMapWithDrawing: React.FC<GoogleMapWithDrawingProps> = ({
  apiKey,
  center = { lat: 54.651427935687735, lng: -5.580687100975887 }, // User's property center
  zoom = 18, // Higher zoom for 1-acre property detail
  height = '100%',
  onShapeCreated,
  onShapeDeleted,
  enableDrawingTools = true
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 GoogleMapWithDrawing useEffect starting');

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

        console.log('✅ Map element found');

        // Load Google Maps API with drawing and geometry libraries
        console.log('📡 Loading Google Maps API with drawing tools...');
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['maps', 'drawing', 'geometry']
        });

        await loader.load();
        console.log('✅ Google Maps API loaded with drawing support');

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

        // Add property marker
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

        // Initialize Drawing Manager (conditional)
        if (enableDrawingTools) {
          console.log('🎨 Initializing Drawing Manager...');
          const drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: null, // Start in hand mode
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.LEFT_TOP,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.RECTANGLE,
                google.maps.drawing.OverlayType.CIRCLE
              ]
            },
            polygonOptions: {
              fillColor: '#4caf50',
              fillOpacity: 0.3,
              strokeColor: '#2d8659',
              strokeWeight: 2,
              clickable: true,
              editable: true,
              zIndex: 1
            },
            rectangleOptions: {
              fillColor: '#2196f3',
              fillOpacity: 0.3,
              strokeColor: '#1976d2',
              strokeWeight: 2,
              clickable: true,
              editable: true,
              zIndex: 1
            },
            circleOptions: {
              fillColor: '#ff9800',
              fillOpacity: 0.3,
              strokeColor: '#f57c00',
              strokeWeight: 2,
              clickable: true,
              editable: true,
              zIndex: 1
            }
          });

          drawingManager.setMap(map);
          drawingManagerRef.current = drawingManager;

          // Add event listeners for drawing events
          drawingManager.addListener('overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
            console.log('🎨 Shape created:', event.type);

            // Add delete functionality to the shape (right-click to delete)
            if (event.overlay && typeof event.overlay.addListener === 'function') {
              event.overlay.addListener('rightclick', () => {
                event.overlay.setMap(null);
                if (onShapeDeleted) {
                  onShapeDeleted(event.overlay);
                }
                console.log('🗑️ Shape deleted via right-click');
              });
            }

            // Notify parent component of shape creation
            if (onShapeCreated) {
              onShapeCreated(event.type, event.overlay);
            }
          });

          drawingManager.addListener('drawingmode_changed', () => {
            const mode = drawingManager.getDrawingMode();
            console.log('🎨 Drawing mode changed:', mode);
          });

          console.log('✅ Drawing Manager initialized');
        }

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
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
        drawingManagerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [apiKey, center, zoom, height, enableDrawingTools]);

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
        <Text>Loading Google Maps with Drawing Tools...</Text>
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

export default GoogleMapWithDrawing;