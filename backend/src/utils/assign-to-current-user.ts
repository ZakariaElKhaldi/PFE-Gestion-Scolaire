import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

async function assignToCurrentUser() {
  if (process.argv.length < 3) {
    console.error('Please provide your user ID as an argument.');
    console.error('Usage: npx ts-node src/utils/assign-to-current-user.ts YOUR_USER_ID');
    process.exit(1);
  }

  const currentUserId = process.argv[2];
  console.log(`Assigning assignments to current user ID: ${currentUserId}`);
  
  try {
    // Check if the user exists and is a student
    const [users] = await pool.query('SELECT id, role, firstName, lastName FROM users WHERE id = ?', [currentUserId]);
    
    if (!users || (users as any[]).length === 0) {
      console.error('User not found with ID:', currentUserId);
      process.exit(1);
    }

    const user = (users as any[])[0];
    console.log(`Found user: ${user.firstName} ${user.lastName} (Role: ${user.role})`);
    
    if (user.role !== 'student') {
      console.log(`Warning: User is not a student (role: ${user.role}). Some features may not work as expected.`);
    }

    // Find or create a course
    console.log('Finding an existing course or creating a new one...');
    const [courses] = await pool.query('SELECT id FROM courses LIMIT 1');
    let courseId;
    
    if (!courses || (courses as any[]).length === 0) {
      // Create a teacher if needed
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
      console.log(`Using existing course with ID: ${courseId}`);
    }
    
    // Enroll the user in the course if not already enrolled
    const [enrollments] = await pool.query('SELECT id FROM course_enrollments WHERE courseId = ? AND studentId = ?', [courseId, currentUserId]);
    
    if (!enrollments || (enrollments as any[]).length === 0) {
      const enrollmentId = uuidv4();
      await pool.query(`
        INSERT INTO course_enrollments (id, courseId, studentId, status)
        VALUES (?, ?, ?, ?)
      `, [
        enrollmentId,
        courseId,
        currentUserId,
        'active'
      ]);
      console.log(`Enrolled user ${currentUserId} in course ${courseId}`);
    } else {
      console.log(`User is already enrolled in course ${courseId}`);
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
    
    // First clear any existing test assignments for this course
    console.log('Clearing existing test assignments...');
    await pool.query('DELETE FROM assignments WHERE courseId = ? AND title LIKE "Test Assignment%"', [courseId]);
    
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
    
    // Verify assignments are properly linked to the user
    const [upcomingAssignments] = await pool.query(`
      SELECT a.* FROM assignments a
      JOIN course_enrollments ce ON a.courseId = ce.courseId
      WHERE ce.studentId = ?
      AND a.status = 'published'
      AND a.dueDate > NOW()
      ORDER BY a.dueDate ASC
    `, [currentUserId]);
    
    console.log(`\nVerifying: Found ${(upcomingAssignments as any[]).length} upcoming assignments for user ${currentUserId}`);
    
    console.log('\nAssignment setup completed successfully!');
    console.log('------------------------');
    console.log('SUMMARY:');
    console.log(`- Assigned to user ID: ${currentUserId}`);
    console.log(`- Used course ID: ${courseId}`);
    console.log(`- Created ${assignmentIds.length} assignments`);
    console.log(`- ${(upcomingAssignments as any[]).length} are upcoming and should appear in the UI`);
    console.log('------------------------');
    console.log('Please refresh the assignments page to see the changes.');
    
  } catch (error) {
    console.error('Error assigning assignments to user:', error);
  } finally {
    // Close the database connection
    pool.end();
    process.exit(0);
  }
}

// Run the function
assignToCurrentUser(); 