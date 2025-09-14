# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-13-maps-canvas-pipeline/spec.md

## Endpoints

### POST /api/garden-maps
**Purpose:** Save garden map data with shapes and measurements
**Parameters:**
- `propertyId`: String - Unique property identifier
- `mapData`: Object - Complete map dataset including shapes, layers, and measurements
- `coordinates`: Object - Property center coordinates (lat, lng)
**Response:**
```json
{
  "success": true,
  "mapId": "unique-map-identifier",
  "savedAt": "2025-09-13T23:31:00Z"
}
```
**Errors:** 400 (Invalid map data), 401 (Unauthorized), 500 (Server error)

### GET /api/garden-maps/:propertyId
**Purpose:** Retrieve saved garden map data for a property
**Parameters:**
- `propertyId`: String - Property identifier in URL path
**Response:**
```json
{
  "success": true,
  "mapData": {
    "shapes": [...],
    "layers": [...],
    "measurements": {...},
    "coordinates": {...}
  },
  "lastModified": "2025-09-13T23:31:00Z"
}
```
**Errors:** 404 (Map not found), 401 (Unauthorized), 500 (Server error)

### PUT /api/garden-maps/:mapId
**Purpose:** Update existing garden map with new shape or layer data
**Parameters:**
- `mapId`: String - Map identifier in URL path
- `updateData`: Object - Incremental updates to shapes, layers, or measurements
**Response:**
```json
{
  "success": true,
  "updated": true,
  "version": 2
}
```
**Errors:** 404 (Map not found), 400 (Invalid update data), 500 (Server error)

### DELETE /api/garden-maps/:mapId
**Purpose:** Remove garden map data
**Parameters:**
- `mapId`: String - Map identifier to delete
**Response:**
```json
{
  "success": true,
  "deleted": true
}
```
**Errors:** 404 (Map not found), 401 (Unauthorized), 500 (Server error)

### POST /api/garden-maps/:mapId/export
**Purpose:** Generate export data in various formats (JSON, SVG)
**Parameters:**
- `mapId`: String - Map to export
- `format`: String - Export format ('json', 'svg', 'png')
- `includeMetadata`: Boolean - Whether to include measurement and layer data
**Response:**
```json
{
  "success": true,
  "exportData": "...",
  "format": "json",
  "size": 1024
}
```
**Errors:** 404 (Map not found), 400 (Invalid format), 500 (Export failed)

## Controllers

### GardenMapController
- **saveMap()** - Handle map data persistence with validation and MongoDB storage
- **loadMap()** - Retrieve and format map data for client consumption
- **updateMap()** - Process incremental updates with version control
- **deleteMap()** - Remove map data with cascade delete for related resources
- **exportMap()** - Generate export data with format-specific transformations

### Error Handling
- Validate all coordinate data before database storage
- Implement request size limits for large map datasets
- Handle MongoDB connection failures gracefully
- Log all map operations for debugging and analytics
- Return consistent error response format across all endpoints