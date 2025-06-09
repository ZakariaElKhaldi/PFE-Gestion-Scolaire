# School Management System - Supabase Backend

This is the Supabase implementation of the School Management System backend.

## Features

- **User Management**: Authentication and authorization with Supabase
- **Course Management**: Create and manage courses, assignments, and materials
- **Attendance Tracking**: Record and view student attendance
- **Parent Verification**: Secure parent-student relationship verification system
- **Document Management**: Upload and share educational documents
- **Grading System**: Record and calculate student grades
- **API**: RESTful API for the frontend applications

## Tech Stack

- **Supabase**: Database, authentication, storage, and real-time features
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Database (via Supabase)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your Supabase credentials
4. Start the development server:
   ```
   npm run dev
   ```

## Database Schema

The database schema is defined in `src/migrations/schema.sql`. This file can be executed in the Supabase SQL editor to create the necessary tables and relationships.

### Key Tables

- **users**: User accounts with role-based access control
- **departments**: Academic departments
- **courses**: Courses offered by the institution
- **course_enrollments**: Student enrollments in courses
- **assignments**: Course assignments
- **submissions**: Student submissions for assignments
- **parent_student_relationships**: Verification of parent-student relationships

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `POST /api/auth/forgot-password`: Request password reset
- `POST /api/auth/reset-password`: Reset password
- `GET /api/auth/me`: Get current user information

### Courses

- `GET /api/courses`: Get all courses
- `GET /api/courses/:id`: Get course details
- `POST /api/courses`: Create a new course
- `PUT /api/courses/:id`: Update a course
- `DELETE /api/courses/:id`: Delete a course

### Assignments

- `GET /api/assignments`: Get all assignments
- `GET /api/assignments/:id`: Get assignment details
- `POST /api/assignments`: Create a new assignment
- `PUT /api/assignments/:id`: Update an assignment
- `DELETE /api/assignments/:id`: Delete an assignment
- `POST /api/assignments/:id/submit`: Submit an assignment
- `POST /api/assignments/:id/grade`: Grade a submission

## Security

- JWT-based authentication
- Row-Level Security (RLS) policies in Supabase
- Role-based access control
- Password hashing with bcrypt

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run migrations`: Run database migrations

## License

This project is licensed under the ISC License. 