import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrollmentService } from '../services/enrollment-service';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API responses
const mockEnrollments = [
  {
    id: 'enroll-1',
    studentId: 'student-1',
    courseId: 'course-1',
    status: 'active',
    enrollmentDate: '2023-01-01',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 'enroll-2',
    studentId: 'student-1',
    courseId: 'course-2',
    status: 'completed',
    enrollmentDate: '2022-09-01',
    completionDate: '2022-12-15',
    grade: 'A',
    createdAt: '2022-09-01',
    updatedAt: '2022-12-15',
  },
];

// Setup MSW server
const server = setupServer(
  // GET student enrollments
  rest.get('http://localhost:3001/api/enrollments/student/:studentId', (req, res, ctx) => {
    return res(ctx.json(mockEnrollments));
  }),
  
  // POST create enrollment
  rest.post('http://localhost:3001/api/enrollments', (req, res, ctx) => {
    return res(ctx.json({
      id: 'enroll-3',
      ...req.body,
      status: 'active',
      enrollmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }),
  
  // PUT update enrollment
  rest.put('http://localhost:3001/api/enrollments/:id', (req, res, ctx) => {
    const enrollmentId = req.params.id as string;
    return res(ctx.json({
      id: enrollmentId,
      ...mockEnrollments.find(e => e.id === enrollmentId),
      ...req.body,
      updatedAt: new Date().toISOString(),
    }));
  })
);

// Start server before all tests
beforeEach(() => {
  server.listen();
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

describe('Enrollment Service Integration', () => {
  it('should fetch student enrollments', async () => {
    const result = await enrollmentService.getStudentEnrollments('student-1');
    expect(result).toEqual(mockEnrollments);
  });
  
  it('should create a new enrollment', async () => {
    const newEnrollment = {
      studentId: 'student-1',
      courseId: 'course-3',
    };
    
    const result = await enrollmentService.createEnrollment(newEnrollment);
    
    expect(result).toHaveProperty('id', 'enroll-3');
    expect(result).toHaveProperty('studentId', 'student-1');
    expect(result).toHaveProperty('courseId', 'course-3');
    expect(result).toHaveProperty('status', 'active');
  });
  
  it('should update an enrollment status', async () => {
    const updatedStatus = 'completed';
    const result = await enrollmentService.updateEnrollmentStatus('enroll-1', updatedStatus);
    
    expect(result).toHaveProperty('id', 'enroll-1');
    expect(result).toHaveProperty('status', updatedStatus);
  });
}); 