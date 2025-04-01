# School Management System Backend

## Overview

This is the backend component of the School Management System - a comprehensive solution for educational institutions to manage students, courses, attendance, and more.

## Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your MySQL credentials and other settings

### Development

To start the development server:

```
npm run dev
```

This will:
1. Set NODE_ENV to development
2. Start the server with hot reloading
3. Automatically run migrations if needed
4. Initialize the database tables

### Running Frontend and Backend Together

For full-stack development:

```
npm run dev:full
```

This will concurrently run both the backend and frontend servers.

## Database Management

### Reset Database

If you need to reset your database to a clean state:

```
npm run db:reset
```

⚠️ **WARNING**: This will delete all data in your database!

### Run Migrations

To run database migrations manually:

```
npm run migrations
```

### Check System Health

To check the system health status:

```
npm run check-health
```

## Project Structure

- `/src` - Source code
  - `/config` - Configuration files
  - `/controllers` - Request handlers
  - `/middlewares` - Express middlewares
  - `/models` - Database models
  - `/routes` - API routes
  - `/services` - Business logic
  - `/utils` - Utility functions
  - `/migrations` - Database migrations
  - `/db` - Database scripts and migrations manager
- `/uploads` - File uploads directory
- `/scripts` - Utility scripts

## API Endpoints

The API documentation is available at `http://localhost:3001/api-docs` when the server is running.

## Features

- User authentication and authorization
- Course management
- Class scheduling
- Attendance tracking
- Document management
- Parent-student relationship verification
- Payments and invoicing
- Feedback system
- Material management
- Certificate generation

## Improved System Architecture

The system now features:

1. **Enhanced Database Initialization**
   - Systematic migrations tracking
   - Automatic table creation
   - Foreign key constraint validation

2. **Improved Logging**
   - Structured, colored console output
   - Different log levels based on environment
   - Specific logging for database operations and startup

3. **Health Monitoring**
   - System health status endpoint
   - Database connection monitoring
   - Disk space and memory usage monitoring

4. **Graceful Error Handling**
   - Improved startup error recovery
   - Better database error reporting
   - Graceful shutdown process

5. **Developer Experience**
   - Streamlined development workflow
   - Database reset capabilities
   - Frontend and backend concurrent development 