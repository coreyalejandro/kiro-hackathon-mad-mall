# Source Code Structure

Clean, organized source code following separation of concerns.

## 📁 Directory Structure

### `/components/`
Reusable UI and functional components
- Currently empty - ready for component development

### `/services/`
Business logic, API services, and core functionality
- `LiveMeetingManager.ts` - Meeting management service
- `/titanEngine/realtime-collaboration/` - Real-time collaboration system
  - `AgentCommunicationBus.ts` - Agent communication infrastructure
  - `server.ts` - Collaboration server implementation

### `/types/`
TypeScript type definitions and interfaces
- `/agents/` - Agent-related type definitions
  - `AgentInterfaces.ts` - Core agent interfaces and capabilities

### `/demos/`
Demonstration and example code
- `demo.ts` - Real-time collaboration demo script

### `/utils/`
Utility functions and helpers
- Currently empty - ready for utility development

### `/config/`
Configuration files moved from realtime-collaboration module
- `package.json` - Module dependencies
- `package-lock.json` - Dependency lock file
- `tsconfig.json` - TypeScript configuration

## 🏗️ Architecture Principles

- **Separation of Concerns:** Each directory has a specific purpose
- **Clean Dependencies:** Services can use types, but not vice versa
- **Modular Design:** Components are self-contained and reusable
- **Type Safety:** Strong TypeScript typing throughout

## 🚀 Getting Started

1. Components go in `/components/`
2. Business logic goes in `/services/`
3. Type definitions go in `/types/`
4. Utilities go in `/utils/`
5. Demos and examples go in `/demos/`