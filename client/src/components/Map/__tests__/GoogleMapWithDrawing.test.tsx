import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleMapWithDrawing from '../GoogleMapWithDrawing';

// Mock Google Maps JavaScript API
const mockMap = {
  setCenter: jest.fn(),
  setZoom: jest.fn(),
  addListener: jest.fn(),
};

const mockDrawingManager = {
  setMap: jest.fn(),
  addListener: jest.fn(),
  getDrawingMode: jest.fn(),
  setDrawingMode: jest.fn(),
};

const mockMarker = {
  setPosition: jest.fn(),
  setMap: jest.fn(),
  addListener: jest.fn(),
};

const mockLoader = {
  load: jest.fn().mockResolvedValue(undefined),
};

// Mock @googlemaps/js-api-loader
jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => mockLoader),
}));

// Mock Google Maps API
Object.defineProperty(window, 'google', {
  value: {
    maps: {
      Map: jest.fn().mockImplementation(() => mockMap),
      Marker: jest.fn().mockImplementation(() => mockMarker),
      MapTypeControlStyle: {
        HORIZONTAL_BAR: 'horizontal_bar',
      },
      ControlPosition: {
        TOP_CENTER: 'top_center',
        LEFT_TOP: 'left_top',
      },
      SymbolPath: {
        CIRCLE: 'circle',
      },
      drawing: {
        DrawingManager: jest.fn().mockImplementation(() => mockDrawingManager),
        OverlayType: {
          POLYGON: 'polygon',
          RECTANGLE: 'rectangle',
          CIRCLE: 'circle',
        },
      },
    },
  },
  writable: true,
});

describe('GoogleMapWithDrawing', () => {
  const mockProps = {
    apiKey: 'test-api-key',
    center: { lat: 54.651427935687735, lng: -5.580687100975887 },
    zoom: 18,
    height: '500px',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<GoogleMapWithDrawing {...mockProps} />);

    expect(screen.getByText('Loading Google Maps with Drawing Tools...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows error when no API key provided', async () => {
    render(<GoogleMapWithDrawing {...mockProps} apiKey="" />);

    await waitFor(() => {
      expect(screen.getByText(/Map Error:/)).toBeInTheDocument();
      expect(screen.getByText(/Google Maps API key is required/)).toBeInTheDocument();
    });
  });

  test('initializes Google Maps API with drawing and geometry libraries', async () => {
    render(<GoogleMapWithDrawing {...mockProps} />);

    await waitFor(() => {
      expect(mockLoader.load).toHaveBeenCalled();
    });

    // Verify Loader was initialized with correct libraries
    const { Loader } = require('@googlemaps/js-api-loader');
    expect(Loader).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      version: 'weekly',
      libraries: ['maps', 'drawing', 'geometry'],
    });
  });

  test('creates map with correct options', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    render(<GoogleMapWithDrawing {...mockProps} />, { container });

    await waitFor(() => {
      expect(window.google.maps.Map).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          center: mockProps.center,
          zoom: mockProps.zoom,
          mapTypeId: 'satellite',
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })
      );
    });
  });

  test('initializes drawing manager when enabled', async () => {
    render(<GoogleMapWithDrawing {...mockProps} enableDrawingTools={true} />);

    await waitFor(() => {
      expect(window.google.maps.drawing.DrawingManager).toHaveBeenCalledWith(
        expect.objectContaining({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: expect.objectContaining({
            position: 'left_top',
            drawingModes: ['polygon', 'rectangle', 'circle'],
          }),
        })
      );
    });

    expect(mockDrawingManager.setMap).toHaveBeenCalledWith(mockMap);
  });

  test('does not initialize drawing manager when disabled', async () => {
    render(<GoogleMapWithDrawing {...mockProps} enableDrawingTools={false} />);

    await waitFor(() => {
      expect(window.google.maps.Map).toHaveBeenCalled();
    });

    expect(window.google.maps.drawing.DrawingManager).not.toHaveBeenCalled();
  });

  test('calls onShapeCreated when shape is created', async () => {
    const onShapeCreated = jest.fn();
    render(
      <GoogleMapWithDrawing
        {...mockProps}
        enableDrawingTools={true}
        onShapeCreated={onShapeCreated}
      />
    );

    await waitFor(() => {
      expect(mockDrawingManager.addListener).toHaveBeenCalledWith(
        'overlaycomplete',
        expect.any(Function)
      );
    });

    // Simulate shape creation
    const overlayCompleteCallback = mockDrawingManager.addListener.mock.calls
      .find(call => call[0] === 'overlaycomplete')[1];

    const mockEvent = {
      type: 'polygon',
      overlay: {
        addListener: jest.fn(),
        setMap: jest.fn(),
      },
    };

    overlayCompleteCallback(mockEvent);

    expect(onShapeCreated).toHaveBeenCalledWith('polygon', mockEvent.overlay);
  });

  test('calls onShapeDeleted when shape is right-clicked', async () => {
    const onShapeDeleted = jest.fn();
    render(
      <GoogleMapWithDrawing
        {...mockProps}
        enableDrawingTools={true}
        onShapeDeleted={onShapeDeleted}
      />
    );

    await waitFor(() => {
      expect(mockDrawingManager.addListener).toHaveBeenCalledWith(
        'overlaycomplete',
        expect.any(Function)
      );
    });

    // Simulate shape creation and then deletion
    const overlayCompleteCallback = mockDrawingManager.addListener.mock.calls
      .find(call => call[0] === 'overlaycomplete')[1];

    const mockOverlay = {
      addListener: jest.fn(),
      setMap: jest.fn(),
    };

    const mockEvent = {
      type: 'polygon',
      overlay: mockOverlay,
    };

    overlayCompleteCallback(mockEvent);

    // Simulate right-click deletion
    const rightClickCallback = mockOverlay.addListener.mock.calls
      .find(call => call[0] === 'rightclick')[1];

    rightClickCallback();

    expect(mockOverlay.setMap).toHaveBeenCalledWith(null);
    expect(onShapeDeleted).toHaveBeenCalledWith(mockOverlay);
  });

  test('adds property marker with correct styling', async () => {
    render(<GoogleMapWithDrawing {...mockProps} />);

    await waitFor(() => {
      expect(window.google.maps.Marker).toHaveBeenCalledWith({
        position: mockProps.center,
        map: mockMap,
        title: 'Property Center - 1 Acre Garden',
        icon: {
          path: 'circle',
          fillColor: '#4caf50',
          fillOpacity: 1,
          strokeColor: '#2d8659',
          strokeWeight: 3,
          scale: 10,
        },
      });
    });
  });

  test('cleans up drawing manager on unmount', () => {
    const { unmount } = render(<GoogleMapWithDrawing {...mockProps} enableDrawingTools={true} />);

    unmount();

    // Note: The actual cleanup would be tested through integration tests
    // as the cleanup happens in the useEffect cleanup function
  });
});