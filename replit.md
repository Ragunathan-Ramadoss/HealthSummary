# MediReport AI - Medical Test Analysis System

## Overview

MediReport AI is a full-stack web application that processes medical test data and generates AI-powered diagnostic reports using local LLM integration (Ollama). The system provides a user-friendly interface for healthcare professionals to input patient data and test results, then generates comprehensive analysis reports.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom medical theme
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

### Monorepo Structure
The application follows a monorepo pattern with clear separation:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common TypeScript schemas and types
- Root level configuration files for build tools

## Key Components

### Database Layer (Drizzle + PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Definition**: Type-safe schema definitions in `shared/schema.ts`
- **Tables**: 
  - `patients` - Patient demographic information
  - `test_results` - Medical test data and AI-generated reports
- **Migration System**: Drizzle-kit for database migrations

### Backend API (Express.js)
- **REST API**: Express server with JSON middleware
- **Storage Interface**: Abstracted storage layer with in-memory fallback
- **Route Structure**: Organized routes in `server/routes.ts`
- **Error Handling**: Centralized error handling middleware
- **Development Logging**: Request/response logging for API endpoints

### Frontend Architecture (React + TypeScript)
- **Component Library**: shadcn/ui with comprehensive UI components
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query for server state management
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Medical Theme**: Custom color palette optimized for healthcare applications

### AI Integration
- **LLM Provider**: Configured for Ollama integration (LLaMA 3.2)
- **Report Generation**: Processes medical test parameters to generate diagnostic insights
- **Async Processing**: Non-blocking AI report generation workflow

## Data Flow

### Patient Registration Flow
1. User inputs patient demographic data (ID, name, age, gender)
2. System checks for existing patient records
3. Creates new patient record if not found
4. Returns patient information for test data entry

### Test Analysis Workflow
1. User selects test type from predefined configurations
2. Dynamic form renders appropriate test parameters
3. Form validation ensures data integrity
4. Test result record created in database
5. AI analysis triggered asynchronously
6. Generated report stored and displayed to user

### Test Configuration System
- **Predefined Tests**: Blood, urine, lipid, thyroid, liver function tests
- **Dynamic Parameters**: Each test type has specific parameters with normal ranges
- **Validation**: Type-safe parameter validation with appropriate input controls

## External Dependencies

### Core Framework Dependencies
- **React 18**: Modern React with hooks and concurrent features
- **Express.js**: Lightweight web framework for Node.js
- **TypeScript**: Type safety across full stack
- **Vite**: Fast build tool and development server

### Database & ORM
- **Drizzle ORM**: Type-safe PostgreSQL ORM
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **Drizzle-kit**: Migration and introspection tools

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Data Management
- **TanStack Query**: Server state management
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Setup
- **Hot Reload**: Vite HMR for frontend development
- **TypeScript Compilation**: Incremental builds with shared tsconfig
- **Database Management**: Drizzle push for schema synchronization
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: esbuild bundles server to `dist/index.js`
- **Static Serving**: Express serves built frontend in production
- **Database**: Requires provisioned PostgreSQL instance

### Configuration Management
- **Environment-based**: NODE_ENV determines development vs production behavior
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Build Scripts**: Separate build processes for client and server bundling

The application is designed for easy deployment on platforms that support Node.js and PostgreSQL, with the ability to scale the AI processing component independently if needed.