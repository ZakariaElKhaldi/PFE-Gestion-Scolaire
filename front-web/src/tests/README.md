# Integration Testing for School Management System

This directory contains integration tests for the School Management System frontend services that interact with the Supabase backend.

## Test Files

- `enrollment-service.test.ts` - Tests for enrollment service integration
- `payment-service.test.ts` - Tests for payment service integration
- `certificate-service.test.ts` - Tests for certificate service integration

## Testing Tools

- **Vitest** - Test runner and assertion library
- **MSW (Mock Service Worker)** - API mocking library for intercepting network requests
- **Axios** - HTTP client for making API requests

## Running Tests

To run all integration tests:

```bash
npm test
```

To run a specific test file:

```bash
npm run test -- src/tests/enrollment-service.test.ts
```

To run tests in watch mode:

```bash
npm run test:watch
```

To run all tests including legacy tests:

```bash
npm run test:all
```

## Test Structure

Each test file follows a similar structure:

1. **Mock Data Setup** - Define mock API responses
2. **MSW Server Configuration** - Set up request handlers for API endpoints
3. **Test Cases** - Define test cases for each service method
4. **Lifecycle Hooks** - Set up and tear down MSW server before and after tests

## Mocked Endpoints

### Enrollment Service
- GET `/enrollments/student/:studentId` - Get enrollments for a student
- POST `/enrollments` - Create a new enrollment
- PUT `/enrollments/:id` - Update an enrollment

### Payment Service
- GET `/payments/summary/:studentId` - Get payment summary for a student
- GET `/payments` - Get all payments
- GET `/payments/student/:studentId` - Get payments for a student
- GET `/payments/invoices/:studentId` - Get invoices for a student
- GET `/payments/methods/:studentId` - Get payment methods for a student
- POST `/payments/process` - Process a payment

### Certificate Service
- GET `/certificates/student` - Get certificates for the current student
- GET `/certificates/:id` - Get a certificate by ID
- GET `/certificates/verify/:verificationId` - Verify a certificate
- POST `/certificates/download/:id` - Download a certificate

## Adding New Tests

To add a new test file:

1. Create a new file with the `.test.ts` extension
2. Import the service to be tested and the testing utilities
3. Set up mock data and MSW server
4. Define test cases for the service methods
5. Add the new test file to the `test` script in `package.json` 