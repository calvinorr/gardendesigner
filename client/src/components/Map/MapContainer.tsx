import React, { useState } from 'react';
import { MessageBar, Button } from '@fluentui/react-components';
import GoogleMap from './GoogleMap';
import GoogleMapWithDrawing from './GoogleMapWithDrawing';

interface MapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center = { lat: 54.651427935687735, lng: -5.580687100975887 }, // User's property coordinates
  zoom = 18
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const [drawingMode, setDrawingMode] = useState(false);
  const [shapes, setShapes] = useState<Array<{ type: string; overlay: any }>>([]);

  // Debug logging
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('Map center:', center);

  // Shape event handlers
  const handleShapeCreated = (type: google.maps.drawing.OverlayType, overlay: google.maps.MVCObject) => {
    console.log('🎨 New shape created in container:', type);
    setShapes(prev => [...prev, { type: type.toString(), overlay }]);
  };

  const handleShapeDeleted = (overlay: google.maps.MVCObject) => {
    console.log('🗑️ Shape deleted in container');
    setShapes(prev => prev.filter(shape => shape.overlay !== overlay));
  };

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
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <h2 style={{
            margin: '0 0 0.25rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2d8659'
          }}>
            Property Map {drawingMode && '- Drawing Mode'}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '0.875rem',
            color: '#666',
            opacity: 0.8
          }}>
            Satellite view • Northern Ireland • 1 acre property {shapes.length > 0 && `• ${shapes.length} shapes`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            appearance={drawingMode ? 'primary' : 'secondary'}
            onClick={() => setDrawingMode(!drawingMode)}
            size="small"
          >
            {drawingMode ? '🗺️ View Mode' : '✏️ Drawing Mode'}
          </Button>
          {shapes.length > 0 && (
            <Button
              appearance="subtle"
              onClick={() => {
                shapes.forEach(shape => shape.overlay.setMap(null));
                setShapes([]);
              }}
              size="small"
            >
              🗑️ Clear All
            </Button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {drawingMode ? (
          <GoogleMapWithDrawing
            apiKey={apiKey!}
            center={center}
            zoom={zoom}
            height="100%"
            onShapeCreated={handleShapeCreated}
            onShapeDeleted={handleShapeDeleted}
            enableDrawingTools={true}
          />
        ) : (
          <GoogleMap
            apiKey={apiKey!}
            center={center}
            zoom={zoom}
            height="100%"
          />
        )}
      </div>
    </div>
  );
};

export default MapContainer;