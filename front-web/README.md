# School Management System - Frontend

This is the web frontend for the School Management System, built with React and integrated with a Supabase-based backend.

## Integration with Supabase Backend

The frontend has been updated to work with the Supabase backend through the following service integrations:

### 1. User Management
- Authentication with JWT
- User profiles and role-based access control
- Profile picture uploads with Supabase Storage

### 2. Course Management
- Course listing, filtering, and search
- Course details and enrollment
- Course materials and assignments

### 3. Enrollment System
- Student course enrollment
- Enrollment status tracking (active, completed, dropped)
- Grade management

### 4. Payment System
- Payment processing with Stripe
- Invoice generation and management
- Payment method management

### 5. Certificate System
- Certificate generation and verification
- Certificate download and sharing
- QR code validation

## Project Structure

```
front-web/
├── public/           # Static assets
├── src/
│   ├── components/   # React components
│   ├── config/       # Configuration files
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── pages/        # Page components
│   ├── services/     # API service layers
│   ├── styles/       # Global styles
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── tests/            # Test files
└── README.md         # This file
```

## Service Integration

The frontend communicates with the backend through service layers:

- `auth.service.ts` - Authentication and user management
- `course-service.ts` - Course management
- `enrollment-service.ts` - Enrollment management
- `payment-service.ts` - Payment processing and management
- `certificate.service.ts` - Certificate management

Each service uses the centralized API client (`api-client.ts`) which handles:
- Authentication headers
- Error handling
- Response formatting

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with:
```
VITE_API_URL=http://localhost:3001/api
```

3. Start the development server:
```bash
npm run dev
```

## Testing

Run the tests to verify the service integrations:
```bash
npm test
```

## Building for Production

```bash
npm run build
```

## Deployment

The built application can be deployed to any static hosting service. Make sure to set the appropriate environment variables for the production environment. 