import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Define your API mocks
const handlers = [
  // Auth endpoints
  rest.post('http://localhost:3001/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            role: 'student',
          },
          token: 'mock-token',
        },
      })
    );
  }),

  // Enrollment endpoints
  rest.get('http://localhost:3001/api/enrollments/student/:studentId', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'enrollment-1',
          studentId: req.params.studentId,
          courseId: 'course-1',
          status: 'active',
          enrollmentDate: '2023-01-01',
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        },
      ])
    );
  }),

  // Course endpoints
  rest.get('http://localhost:3001/api/courses', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'course-1',
          name: 'Introduction to Programming',
          code: 'CS101',
          description: 'Basic programming concepts',
          teacherId: 'teacher-1',
          startDate: '2023-01-01',
          endDate: '2023-05-31',
          credits: 3,
          createdAt: '2022-12-01',
          updatedAt: '2022-12-01',
        },
      ])
    );
  }),

  // Payment endpoints
  rest.get('http://localhost:3001/api/payments/summary/:studentId', (req, res, ctx) => {
    return res(
      ctx.json({
        totalPaid: 500,
        pendingPayments: 200,
        nextPaymentDue: '2023-07-01',
        overduePayments: 0,
      })
    );
  }),

  // Certificate endpoints
  rest.get('http://localhost:3001/api/certificates/student', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'cert-1',
          title: 'Course Completion',
          issueDate: '2023-05-31',
          issuer: 'University',
          type: 'Academic',
          status: 'valid',
          verificationId: 'verify-1',
          studentId: 'user-1',
          description: 'Certificate for completing the course',
          skills: ['JavaScript', 'React'],
          createdAt: '2023-05-31',
          updatedAt: '2023-05-31',
        },
      ])
    );
  }),
];

// Setup MSW server
const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close()); 