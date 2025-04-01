import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
}

async function createMockCourse() {
  try {
    console.log('Creating database pool...');
    
    // Define mock course IDs for testing
    const mockCourseIds = [
      'mock-course-for-feedback-test',
      'mock-course-2'  // Add the ID the frontend is trying to use
    ];
    
    // Find a teacher to associate with the course
    const [teachers] = await pool.query<UserRow[]>('SELECT id FROM users WHERE role = ?', ['teacher']);
    let teacherId: string;
    
    if (!Array.isArray(teachers) || teachers.length === 0) {
      console.error('No teachers found in the database. Creating a default teacher...');
      
      // Create a default teacher
      teacherId = uuidv4();
      await pool.query(
        'INSERT INTO users (id, firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [teacherId, 'Mock', 'Teacher', 'mock.teacher@school.com', 'password123', 'teacher']
      );
      
      console.log('Created default teacher with ID:', teacherId);
    } else {
      teacherId = teachers[0].id;
    }
    
    // Create both mock courses
    for (const courseId of mockCourseIds) {
      // Check if course already exists
      const [existingCourses] = await pool.query<RowDataPacket[]>('SELECT * FROM courses WHERE id = ?', [courseId]);
      
      if (Array.isArray(existingCourses) && existingCourses.length > 0) {
        console.log(`Mock course already exists with ID: ${courseId}`);
        continue;
      }
      
      // Create the mock course
      await pool.query(
        `INSERT INTO courses (id, name, code, description, teacherId, startDate, endDate, credits, maxStudents, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          `Mock Web Development (${courseId})`,
          courseId === 'mock-course-2' ? 'WEB102' : 'WEB101',
          `A mock course for testing feedback functionality (${courseId})`,
          teacherId,
          '2023-01-01',
          '2023-12-31',
          3,
          30,
          'active'
        ]
      );
      
      console.log(`Created mock course with ID: ${courseId}`);
    }
    
    console.log('Mock course setup complete!');
  } catch (error) {
    console.error('Error creating mock course:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createMockCourse(); 