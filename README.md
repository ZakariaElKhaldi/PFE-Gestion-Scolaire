# School Management System - Supabase Migration

This project is a migration of a traditional Node.js/Express/MySQL School Management System to a Supabase-based architecture.

## Project Structure

The project consists of two main parts:
- `backend-supabase/`: Backend API built with Node.js, Express, and Supabase
- `front-web/`: Frontend web application built with React

## Backend Implementation

The backend has been migrated to use Supabase for:
- Authentication
- Database operations
- Storage for files (profile pictures, certificates, etc.)

### Key Modules

1. **User Management**
   - CRUD operations for user profiles
   - Profile picture uploads with Supabase Storage
   - Role-based access control

2. **Department Management**
   - CRUD operations with role-based access control
   - Department hierarchy and relationships

3. **Course Management**
   - Relationships between courses, departments, and teachers
   - Filtering capabilities and role-based permissions

4. **Enrollment System**
   - Enrollment model with status tracking (active, completed, dropped)
   - Role-based permissions for enrollment management

5. **Payment System**
   - Integration with Stripe for online payments
   - Multiple payment methods support
   - Webhook handling for payment status updates

6. **Certificate System**
   - Certificate generation and verification
   - QR code functionality for certificate validation
   - File upload for certificate PDFs using Supabase Storage

## Frontend Integration

The frontend has been updated to work with the new Supabase backend:

1. **API Client**
   - Updated to work with the new API endpoints
   - Token-based authentication

2. **Service Layer**
   - Updated service files for each module
   - Proper error handling and type definitions

3. **Configuration**
   - Centralized API configuration

## Getting Started

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend-supabase
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase credentials and other configuration

3. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd front-web
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file based on `.env.example`
   - Set `VITE_API_URL` to point to your backend API

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

The project includes integration tests for the frontend services that interact with the Supabase backend.

### Running Tests

```bash
cd front-web
npm test
```

To run a specific test file:

```bash
npm run test -- src/tests/enrollment-service.test.ts
```

### Test Coverage

The tests cover the following services:

- **Enrollment Service**: Student enrollments, course registrations
- **Payment Service**: Payment processing, invoices, payment methods
- **Certificate Service**: Certificate verification, downloads

For more details, see the [Testing Documentation](front-web/src/tests/README.md).

## API Documentation

The API endpoints follow RESTful conventions:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Departments**: `/api/departments/*`
- **Courses**: `/api/courses/*`
- **Enrollments**: `/api/enrollments/*`
- **Payments**: `/api/payments/*`
- **Certificates**: `/api/certificates/*`

## Technologies Used

- **Backend**: Node.js, Express, Supabase, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Authentication**: JWT with Supabase Auth
- **Storage**: Supabase Storage
- **Payment Processing**: Stripe
- **Certificate Verification**: QR Code
- **Testing**: Vitest, MSW (Mock Service Worker)