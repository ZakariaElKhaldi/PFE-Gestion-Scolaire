import { pool } from '../config/db';
import axios from 'axios';

async function testUpcomingAssignments() {
  console.log('Testing upcoming assignments endpoint...');
  
  try {
    // First, get the student user to test with
    const [users] = await pool.query('SELECT id, role, firstName, lastName FROM users WHERE role = "student" LIMIT 1');
    
    if (!users || (users as any[]).length === 0) {
      console.error('No student users found. Please run seed-assignments.ts first.');
      return;
    }

    const student = (users as any[])[0];
    console.log(`Found student: ${student.firstName} ${student.lastName} (${student.id})`);
    
    // Check assignments directly in the database
    console.log('Checking assignments in database...');
    const [assignments] = await pool.query(`
      SELECT a.* FROM assignments a
      JOIN course_enrollments ce ON a.courseId = ce.courseId
      WHERE ce.studentId = ?
      AND a.status = 'published'
      AND a.dueDate > NOW()
      ORDER BY a.dueDate ASC
    `, [student.id]);
    
    if (!assignments || (assignments as any[]).length === 0) {
      console.log('No upcoming assignments found in database.');
    } else {
      console.log(`Found ${(assignments as any[]).length} upcoming assignments in database:`);
      (assignments as any[]).forEach((assignment, index) => {
        console.log(`${index + 1}. ${assignment.title} (Due: ${new Date(assignment.dueDate).toLocaleString()})`);
      });
    }
    
    // Check course enrollments
    console.log('\nChecking course enrollments...');
    const [enrollments] = await pool.query(`
      SELECT ce.*, c.name as courseName FROM course_enrollments ce
      JOIN courses c ON ce.courseId = c.id
      WHERE ce.studentId = ?
    `, [student.id]);
    
    if (!enrollments || (enrollments as any[]).length === 0) {
      console.log('Student is not enrolled in any courses!');
    } else {
      console.log(`Student is enrolled in ${(enrollments as any[]).length} courses:`);
      (enrollments as any[]).forEach((enrollment, index) => {
        console.log(`${index + 1}. ${enrollment.courseName} (Status: ${enrollment.status})`);
      });
    }
    
    // Check directly if user is authenticated when making the api call
    // We'll try without auth just to check the response
    console.log('\nTesting API call without authentication...');
    try {
      const response = await axios.get('http://localhost:3001/api/assignments/upcoming');
      console.log('Response:', response.data);
    } catch (error: any) {
      console.log('Error calling API (expected):', error.response?.status, error.response?.data || error.message);
    }
    
    console.log('\nSee the frontend network tab to check the actual API response with authentication.');
    console.log('Check that the authenticated user ID matches the student ID we found:', student.id);
    
  } catch (error) {
    console.error('Error testing upcoming assignments:', error);
  } finally {
    // Close the database connection
    pool.end();
    process.exit(0);
  }
}

// Run the test function
testUpcomingAssignments(); 