# School Management System

A comprehensive solution for educational institutions to manage students, courses, attendance, and more.

## Features

- **User Management**: Registration and authentication for students, teachers, parents, and administrators
- **Course Management**: Create and manage courses, assignments, and materials
- **Attendance Tracking**: Record and view student attendance
- **Parent Verification**: Secure parent-student relationship verification system
- **Document Management**: Upload and share educational documents
- **Grading System**: Record and calculate student grades
- **Interactive Dashboard**: Role-specific dashboards for students, teachers, and parents
- **Responsive Design**: Works on mobile, tablet, and desktop

## Project Structure

This project consists of two main components:

- **Backend**: Node.js + Express + MySQL API server
- **Frontend**: React + Vite web application

## Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- npm

### Quick Setup (Recommended)

The easiest way to set up the entire project with sample data:

```
npm run setup-dev
```

This will:
1. Install all dependencies
2. Set up the database (with option to reset it)
3. Run migrations
4. Create sample data (optional)

### Manual Installation

1. Clone the repository
2. Install all dependencies:
   ```
   npm run install:all
   ```
3. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update with your MySQL credentials and other settings
4. Set up the database:
   ```
   cd backend
   npm run db:reset
   ```

### Development

Start both frontend and backend in development mode:

```
npm run dev
```

This will:
- Start the backend server on port 3001
- Start the frontend development server on port 5173
- Run database migrations if needed
- Set up hot reloading for both frontend and backend

### Production Build

To create production builds:

```
npm run build
```

### Sample Users

After setup, you can log in with these accounts:

- **Admin**
  - Email: admin@school.com
  - Password: password123

- **Teacher**
  - Email: teacher@school.com
  - Password: password123

- **Student**
  - Email: student@school.com
  - Password: password123

- **Parent**
  - Email: parent@school.com
  - Password: password123

## System Health

To check system health:

```
cd backend
npm run check-health
```

## System Architecture Improvements

- **Enhanced Database Initialization**: Automatic table creation with robust error handling
- **Improved Error Handling**: Consistent API error responses with detailed logging
- **Health Monitoring**: System health endpoints to check database, disk, and memory status
- **API Documentation**: Swagger/OpenAPI integration for interactive API documentation
- **Migration System**: Structured database migrations with priority-based execution
- **Development Tools**: One-command setup for the entire application
- **Graceful Error Handling**: Centralized error management with custom error types
- **Better DX**: Improved developer experience with simplified workflows

## Documentation

- Backend API documentation is available at `http://localhost:5000/api-docs` when the server is running
- Additional documentation can be found in the `docs` directory

## License

This project is licensed under the ISC License.