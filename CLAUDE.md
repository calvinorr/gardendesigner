# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GardenDesigner is a comprehensive digital garden management platform for homeowners with large properties (~1 acre). The application provides interactive mapping with Google Maps integration, plant cataloging, task management, and intelligent mowing route optimization.

## Architecture

This is a full-stack application with a client-server architecture:

- **Frontend**: React 19+ with TypeScript, located in `/client/`
- **Backend**: Node.js with Express, located in `/server/`
- **Database**: MongoDB with Mongoose ODM
- **UI Framework**: Fluent UI React components for modern design
- **Maps**: Google Maps JavaScript API for satellite imagery and interactive mapping

## Development Commands

### Starting the Application
```bash
# Start both client and server in development mode
npm run dev

# Start only the server (development mode with nodemon)
npm run server:dev

# Start only the client (React development server)
npm run client:dev

# Production server start
npm start
```

### Building and Testing
```bash
# Build the React client for production
npm run build

# Run tests (currently not configured)
npm test

# Client-specific commands (run from /client directory)
cd client && npm start    # Start React dev server
cd client && npm test     # Run React tests
cd client && npm run build # Build React app
```

## Agent OS Integration

This project uses Agent OS for structured development workflows:

- **Product Documentation**: `.agent-os/product/` contains mission, roadmap, tech stack, and decisions
- **Feature Specifications**: `.agent-os/specs/` contains detailed feature specs with tasks
- **Development Phases**: Roadmap defines 5 phases from MVP to advanced features

Key Agent OS commands:
- Use `@~/.agent-os/instructions/create-spec.md` for new feature specifications
- Use `@~/.agent-os/instructions/execute-tasks.md` for implementing features
- Reference `.agent-os/product/roadmap.md` for current development priorities

## Key Technical Details

### Database Connection
- MongoDB connection configured via `MONGODB_URI` environment variable
- Default fallback: `mongodb://localhost:27017/gardendesigner`
- Uses Mongoose ODM for data modeling

### Environment Configuration
- Server expects `.env` file with environment variables
- Critical variables: `MONGODB_URI`, `PORT`, Google Maps API keys
- API keys should be stored server-side for security

### Google Maps Integration
- Primary mapping service using Google Maps JavaScript API
- Requires API key configuration with domain restrictions
- Supports satellite imagery, custom overlays, markers, and drawing tools
- Performance optimized with Canvas/WebGL layers for many map elements

### Project Structure
```
/
├── server/           # Node.js/Express backend
│   └── index.js     # Main server entry point
├── client/          # React TypeScript frontend
│   ├── src/         # React source code
│   └── public/      # Static assets
├── .agent-os/       # Agent OS documentation and specs
└── package.json     # Root package with dev scripts
```

## Development Workflow

1. **Feature Planning**: Create specs using Agent OS create-spec workflow
2. **Implementation**: Follow task breakdown in spec files
3. **Testing**: Verify functionality before marking tasks complete
4. **Environment Setup**: Ensure MongoDB and required API keys are configured
5. **Incremental Development**: Complete features in small, testable steps

## Current Development Status

- **Phase 1**: Core Garden Mapping (MVP) - Google Maps integration in progress
- **Next Priorities**: Google Maps API setup, React component architecture, MongoDB configuration
- **Architecture State**: Basic Express server and React app bootstrapped, awaiting feature implementation