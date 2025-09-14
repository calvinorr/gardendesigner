# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-13-maps-canvas-pipeline/spec.md

## Schema Changes

### New Collection: gardenMaps

```javascript
const gardenMapSchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  propertyCoordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  layers: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    visible: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ['borders', 'paths', 'grass', 'shrubs', 'custom'],
      required: true
    },
    color: { type: String, default: '#007bff' },
    opacity: { type: Number, default: 0.6, min: 0, max: 1 }
  }],
  shapes: [{
    id: { type: String, required: true },
    layerId: { type: String, required: true },
    type: {
      type: String,
      enum: ['polygon', 'rectangle', 'circle'],
      required: true
    },
    coordinates: {
      // For polygons and rectangles: array of lat/lng points
      points: [{
        lat: Number,
        lng: Number
      }],
      // For circles: center and radius
      center: {
        lat: Number,
        lng: Number
      },
      radius: Number // in meters
    },
    measurements: {
      area: {
        squareFeet: { type: Number, required: true },
        acres: { type: Number, required: true },
        squareMeters: { type: Number, required: true }
      },
      perimeter: { type: Number }, // in meters
      calculatedAt: { type: Date, default: Date.now }
    },
    canvasData: {
      // Canvas-specific coordinates and styling
      pixelCoordinates: [{
        x: Number,
        y: Number
      }],
      canvasCenter: {
        x: Number,
        y: Number
      },
      canvasRadius: Number,
      zIndex: { type: Number, default: 0 }
    },
    metadata: {
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      createdBy: String, // Drawing source: 'maps' or 'canvas'
      notes: String
    }
  }],
  canvasSettings: {
    dimensions: {
      width: { type: Number, default: 800 },
      height: { type: Number, default: 600 }
    },
    scale: {
      metersPerPixel: { type: Number, required: true },
      zoomLevel: { type: Number, default: 1 }
    },
    viewport: {
      centerX: { type: Number, default: 400 },
      centerY: { type: Number, default: 300 }
    }
  },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});
```

### Indexes and Constraints

```javascript
// Compound index for efficient property-user queries
gardenMapSchema.index({ propertyId: 1, userId: 1 });

// Index for shape lookups within maps
gardenMapSchema.index({ 'shapes.id': 1 });
gardenMapSchema.index({ 'shapes.layerId': 1 });

// Ensure shape IDs are unique within each map
gardenMapSchema.index(
  { propertyId: 1, 'shapes.id': 1 },
  { unique: true }
);

// Ensure layer IDs are unique within each map
gardenMapSchema.index(
  { propertyId: 1, 'layers.id': 1 },
  { unique: true }
);
```

### Data Validation

```javascript
// Pre-save middleware for data validation
gardenMapSchema.pre('save', function(next) {
  // Validate that all shapes reference existing layers
  const layerIds = this.layers.map(layer => layer.id);
  const invalidShapes = this.shapes.filter(
    shape => !layerIds.includes(shape.layerId)
  );

  if (invalidShapes.length > 0) {
    return next(new Error('All shapes must reference valid layers'));
  }

  // Update timestamps for modified shapes
  this.shapes.forEach(shape => {
    if (shape.isModified()) {
      shape.metadata.updatedAt = new Date();
    }
  });

  next();
});
```

## Migration Requirements

Since this is a new collection, no migrations are required. The schema will be created automatically when the first garden map is saved.

## Data Integrity Rules

- **Shape-Layer Relationship:** All shapes must belong to a valid layer
- **Coordinate Validation:** GPS coordinates must be valid lat/lng values
- **Measurement Consistency:** Area calculations must be recalculated if shape coordinates change
- **Canvas Synchronization:** Canvas pixel coordinates must be updated when GPS coordinates change
- **Version Control:** Version number increments with each significant update