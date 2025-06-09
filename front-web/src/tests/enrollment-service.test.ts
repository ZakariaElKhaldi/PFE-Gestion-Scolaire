import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { enrollmentService } from '../services/enrollment-service';
import { http, HttpResponse } from 'msw';
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
  http.get('http://localhost:3001/api/enrollments/student/:studentId', () => {
    return HttpResponse.json(mockEnrollments);
  }),
  
  // POST create enrollment
  http.post('http://localhost:3001/api/enrollments', async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    return HttpResponse.json({
      id: 'enroll-3',
      studentId: body.studentId,
      courseId: body.courseId,
      status: 'active',
      enrollmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
  
  // PUT update enrollment
  http.put('http://localhost:3001/api/enrollments/:id', async ({ params, request }) => {
    const enrollmentId = params.id as string;
    const body = await request.json() as Record<string, any>;
    const enrollment = mockEnrollments.find(e => e.id === enrollmentId);
    
    if (!enrollment) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({
      ...enrollment,
      status: body.status || enrollment.status,
      updatedAt: new Date().toISOString(),
    });
  })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

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