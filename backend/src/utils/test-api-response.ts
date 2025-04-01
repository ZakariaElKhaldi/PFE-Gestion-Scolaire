import { Request, Response } from 'express';
import { StudentModel } from '../models/student.model';

// Mock request and response objects
const mockReq = {
  user: {
    userId: 'f4b969e2-324a-4333-9624-d016a54ea06d',
    role: 'student'
  },
  params: {
    studentId: 'f4b969e2-324a-4333-9624-d016a54ea06d'
  },
  query: {}
} as unknown as Request;

const mockRes = {
  status: (code: number) => {
    console.log(`Response status code: ${code}`);
    return mockRes;
  },
  json: (data: any) => {
    console.log('API Response structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check specifically for the courses array
    if (data?.data?.courses) {
      console.log(`\nCourses array exists and has ${data.data.courses.length} items`);
      
      if (data.data.courses.length > 0) {
        console.log('\nSample course data:');
        console.log(JSON.stringify(data.data.courses[0], null, 2));
      }
    } else {
      console.log('\nWARNING: courses array not found in the expected structure!');
      console.log('Expected: response.data.courses to be an array');
    }
    
    return mockRes;
  }
} as unknown as Response;

async function testApiResponse() {
  console.log('\n===== TESTING API RESPONSE STRUCTURE =====');
  console.log('Using student ID: f4b969e2-324a-4333-9624-d016a54ea06d (Student Johnson)');
  
  try {
    // Get courses directly from the model
    console.log('\nTesting direct model call:');
    const courses = await StudentModel.getStudentCourses('f4b969e2-324a-4333-9624-d016a54ea06d');
    console.log(`Model returned ${courses.length} courses`);
    
    // Generate a proper API response like the controller would
    console.log('\nTesting expected API response structure:');
    const apiResponse = {
      error: false,
      data: { courses },
      message: 'Student courses retrieved successfully'
    };
    
    mockRes.json(apiResponse);
    
    console.log('\nTEST COMPLETED');
    
  } catch (error) {
    console.error('TEST ERROR:', error);
  }
}

// Run the test
testApiResponse()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
  }); 