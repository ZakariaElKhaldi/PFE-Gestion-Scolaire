import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

async function seedAssignments() {
  console.log('Starting to seed assignments data...');
  
  try {
    // First, let's get a student user to associate with enrollments
    const [users] = await pool.query('SELECT id, role FROM users WHERE role = "student" LIMIT 1');
    
    if (!users || (users as any[]).length === 0) {
      console.log('No student users found. Creating a test student...');
      const studentId = uuidv4();
      await pool.query(`
        INSERT INTO users (id, email, password, firstName, lastName, role, studentId)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        studentId,
        'teststudent@example.com',
        '$2a$10$KgP.WfCgj48MIQ.BK4PX2e0Zeq3OmFwk2nvflBHBetVvRaiNhTPMW', // password: password123
        'Test',
        'Student',
        'student',
        'ST12345'
      ]);
      console.log(`Created test student with ID: ${studentId}`);
    }

    const studentId = (users as any[])[0]?.id || ''; 
    
    // Create a test course if none exist
    const [courses] = await pool.query('SELECT id FROM courses LIMIT 1');
    let courseId;
    
    if (!courses || (courses as any[]).length === 0) {
      console.log('No courses found. Creating a test course...');
      // Create a test teacher if needed
      const [teachers] = await pool.query('SELECT id FROM users WHERE role = "teacher" OR role = "administrator" LIMIT 1');
      let teacherId;
      
      if (!teachers || (teachers as any[]).length === 0) {
        const newTeacherId = uuidv4();
        await pool.query(`
          INSERT INTO users (id, email, password, firstName, lastName, role)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          newTeacherId,
          'testteacher@example.com',
          '$2a$10$KgP.WfCgj48MIQ.BK4PX2e0Zeq3OmFwk2nvflBHBetVvRaiNhTPMW', // password: password123
          'Test',
          'Teacher',
          'teacher'
        ]);
        teacherId = newTeacherId;
        console.log(`Created test teacher with ID: ${teacherId}`);
      } else {
        teacherId = (teachers as any[])[0].id;
      }
      
      courseId = uuidv4();
      await pool.query(`
        INSERT INTO courses (id, name, code, description, teacherId, startDate, endDate, credits, maxStudents, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        courseId,
        'Test Course',
        'TST101',
        'A test course for development',
        teacherId,
        new Date().toISOString().split('T')[0], // today
        new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0], // 4 months from now
        3,
        30,
        'active'
      ]);
      console.log(`Created test course with ID: ${courseId}`);
    } else {
      courseId = (courses as any[])[0].id;
    }
    
    // Enroll the student in the course if not already enrolled
    const [enrollments] = await pool.query('SELECT id FROM course_enrollments WHERE courseId = ? AND studentId = ?', [courseId, studentId]);
    
    if (!enrollments || (enrollments as any[]).length === 0) {
      const enrollmentId = uuidv4();
      await pool.query(`
        INSERT INTO course_enrollments (id, courseId, studentId, status)
        VALUES (?, ?, ?, ?)
      `, [
        enrollmentId,
        courseId,
        studentId,
        'active'
      ]);
      console.log(`Enrolled student ${studentId} in course ${courseId}`);
    }
    
    // Create some test assignments
    const assignmentIds = [];
    const assignmentTitles = [
      'Introduction Assignment',
      'Mid-term Project',
      'Final Exam',
      'Group Presentation',
      'Research Paper'
    ];
    
    // First clear any existing test assignments
    console.log('Clearing existing test assignments...');
    await pool.query('DELETE FROM assignments WHERE title LIKE "Test Assignment%"');
    
    // Create new assignments
    for (let i = 0; i < 5; i++) {
      const assignmentId = uuidv4();
      const dueDate = new Date();
      
      // Set due dates: 2 past, 3 upcoming
      if (i < 2) {
        dueDate.setDate(dueDate.getDate() - (10 * (i + 1))); // Past due dates
      } else {
        dueDate.setDate(dueDate.getDate() + (7 * (i - 1))); // Future due dates
      }
      
      await pool.query(`
        INSERT INTO assignments (id, courseId, title, description, dueDate, points, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        assignmentId,
        courseId,
        `Test Assignment: ${assignmentTitles[i]}`,
        `This is a test assignment for ${assignmentTitles[i]}. It was auto-generated for testing purposes.`,
        dueDate.toISOString().slice(0, 19).replace('T', ' '),
        100,
        'published'
      ]);
      
      assignmentIds.push(assignmentId);
      console.log(`Created assignment: ${assignmentTitles[i]} with ID: ${assignmentId}`);
    }
    
    console.log('Assignment seeding completed successfully!');
    console.log('------------------------');
    console.log('SUMMARY:');
    console.log(`- Created/Found student ID: ${studentId}`);
    console.log(`- Created/Found course ID: ${courseId}`);
    console.log(`- Created ${assignmentIds.length} assignments`);
    console.log('------------------------');
    console.log('You can now test the assignments page with this data.');
    
  } catch (error) {
    console.error('Error seeding assignments data:', error);
  } finally {
    // Close the database connection
    pool.end();
    process.exit(0);
  }
}

// Run the seeding function
seedAssignments(); 