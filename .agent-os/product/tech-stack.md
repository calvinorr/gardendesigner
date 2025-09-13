# Technical Stack

## Backend Framework
- **Node.js**: Latest LTS version with Express framework for API development
- **Authentication**: Secure user authentication with hashed passwords and HTTPS

## Database System
- **MongoDB**: Document-oriented database with MongoDB Atlas for cloud hosting
- **ODM**: Mongoose for schema definitions and data access

## Frontend Framework
- **React**: Modern single-page application (SPA) framework
- **State Management**: React state management for app data (plants, tasks, map data)

## Build Tools & Package Management
- **Package Manager**: npm
- **Module System**: ES6 modules with modern JavaScript

## CSS Framework & UI Components
- **Fluent UI**: Microsoft's Fluent UI React component library for modern design aesthetics
- **Responsive Design**: Mobile-first approach optimized for desktop and tablet

## External API Integrations
- **Google Maps JavaScript API**: Satellite imagery, interactive mapping, drawing tools, and markers
- **Plant Database APIs**: Trefle or APIFarmer for comprehensive plant species information
- **API Key Management**: Server-side secure storage of API keys

## Mapping & Geospatial
- **Google Maps API**: Primary mapping service with satellite view
- **Custom Overlays**: Polygon drawing for garden zones with semi-transparent shading
- **Markers**: Custom plant and tree markers with icons
- **Measurement Tools**: Distance and area calculation capabilities

## Hosting & Deployment
- **Application Hosting**: Heroku, Vercel, or similar cloud platform
- **Database Hosting**: MongoDB Atlas managed database service
- **SSL/Security**: HTTPS encryption for all data transmission

## Development & DevOps
- **Version Control**: Git with GitHub
- **Environment Configuration**: Environment variables for API keys and connection strings
- **Backup Strategy**: Regular database backups and data export functionality

## Additional Services
- **Email Service**: For task reminders and notifications (optional)
- **Push Notifications**: Browser Push API for due task alerts
- **Caching**: Server-side caching for plant database API responses to reduce external calls

## Performance & Optimization
- **Map Rendering**: Canvas or WebGL layers for smooth interaction with many markers
- **Algorithm Processing**: Server-side route optimization for mowing patterns
- **Asset Optimization**: Efficient loading of map tiles and UI components