/**
 * Database seed script for comprehensive test data
 * Run with: node db/seed-test-data.js
 * 
 * This script inserts test data for multiple entities:
 * - Courses
 * - Classes
 * - Class Schedules
 * - Course Enrollments
 * - Assignments
 * - Assignment Submissions
 * - Grades
 * - Attendance
 * - Materials
 * - Messages
 * - Documents
 * - Events
 * - Notifications
 * 
 * NOTE: Run this script AFTER running seed-users.js to ensure required users exist
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Helper to generate a random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to format dates for MySQL
function formatDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function seedTestData() {
  console.log('Starting comprehensive test data seed process...');
  
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe',
    multipleStatements: true
  });

  try {
    // Get existing users and departments for reference
    const [users] = await connection.query('SELECT id, role FROM users');
    const [departments] = await connection.query('SELECT id FROM departments');
    
    // Filter users by role
    const adminUsers = users.filter(u => u.role === 'administrator').map(u => u.id);
    const teacherUsers = users.filter(u => u.role === 'teacher').map(u => u.id);
    const studentUsers = users.filter(u => u.role === 'student').map(u => u.id);
    
    // Specific user ID for Student Johnson
    const studentJohnsonId = 'f4b969e2-324a-4333-9624-d016a54ea06d';
    
    // Check if Student Johnson exists
    const [studentJohnson] = await connection.query('SELECT id FROM users WHERE id = ?', [studentJohnsonId]);
    if (studentJohnson.length === 0) {
      console.log('WARNING: Student Johnson user not found. Special assignments will not be created.');
    } else {
      console.log('Found Student Johnson user, will create special assignments.');
      // Ensure this user is in our studentUsers array if they exist
      if (!studentUsers.includes(studentJohnsonId)) {
        studentUsers.push(studentJohnsonId);
      }
    }
    
    if (teacherUsers.length === 0 || studentUsers.length === 0) {
      throw new Error('Required users not found. Run seed-users.js first.');
    }
    
    const departmentId = departments[0]?.id;
    
    if (!departmentId) {
      throw new Error('No departments found. Run seed-users.js first.');
    }
    
    // ======= 1. Create Courses =======
    console.log('Creating courses...');
    const courseIds = [];
    
    // Math course
    const mathCourseId = uuidv4();
    courseIds.push(mathCourseId);
    await connection.query(`
      INSERT INTO courses (id, name, code, description, teacherId, startDate, endDate, credits, maxStudents, status, departmentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mathCourseId,
      'Mathematics 101',
      'MATH101',
      'Introduction to basic mathematical concepts including algebra, geometry, and calculus',
      teacherUsers[0],
      '2023-09-01',
      '2024-06-15',
      3,
      30,
      'active',
      departmentId
    ]);
    
    // Physics course
    const physicsCourseId = uuidv4();
    courseIds.push(physicsCourseId);
    await connection.query(`
      INSERT INTO courses (id, name, code, description, teacherId, startDate, endDate, credits, maxStudents, status, departmentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      physicsCourseId,
      'Physics Fundamentals',
      'PHYS101',
      'Introduction to mechanics, thermodynamics, and wave phenomena',
      teacherUsers[0],
      '2023-09-01',
      '2024-06-15',
      4,
      25,
      'active',
      departmentId
    ]);
    
    // Chemistry course
    const chemistryCourseId = uuidv4();
    courseIds.push(chemistryCourseId);
    await connection.query(`
      INSERT INTO courses (id, name, code, description, teacherId, startDate, endDate, credits, maxStudents, status, departmentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      chemistryCourseId,
      'Chemistry Basics',
      'CHEM101',
      'Introduction to atomic structure, chemical bonds, and reactions',
      teacherUsers[0],
      '2023-09-01',
      '2024-06-15',
      3,
      25,
      'active',
      departmentId
    ]);
    
    console.log(`Created ${courseIds.length} courses`);

    // ======= 2. Create Classes =======
    console.log('Creating classes...');
    const classIds = [];
    
    for (const courseId of courseIds) {
      const classId = uuidv4();
      classIds.push(classId);
      await connection.query(`
        INSERT INTO classes (id, courseId, teacherId, room, capacity, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        classId,
        courseId,
        teacherUsers[0],
        `Room ${Math.floor(Math.random() * 20) + 101}`,
        25,
        'active'
      ]);
    }
    
    console.log(`Created ${classIds.length} classes`);
    
    // ======= 3. Create Class Schedules =======
    console.log('Creating class schedules...');
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    let scheduleCount = 0;
    
    for (const classId of classIds) {
      // Each class has 2 days per week
      const randDay1 = days[Math.floor(Math.random() * 3)];
      const randDay2 = days[Math.floor(Math.random() * 2) + 3];
      
      await connection.query(`
        INSERT INTO class_schedules (id, classId, day, startTime, endTime)
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        classId,
        randDay1,
        '09:00:00',
        '10:30:00'
      ]);
      scheduleCount++;
      
      await connection.query(`
        INSERT INTO class_schedules (id, classId, day, startTime, endTime)
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        classId,
        randDay2,
        '13:00:00',
        '14:30:00'
      ]);
      scheduleCount++;
    }
    
    console.log(`Created ${scheduleCount} class schedules`);
    
    // ======= 4. Create Course Enrollments =======
    console.log('Creating course enrollments...');
    let enrollmentCount = 0;
    
    for (const courseId of courseIds) {
      for (const studentId of studentUsers) {
        await connection.query(`
          INSERT INTO course_enrollments (id, courseId, studentId, status)
          VALUES (?, ?, ?, ?)
        `, [
          uuidv4(),
          courseId,
          studentId,
          'active'
        ]);
        enrollmentCount++;
      }
    }
    
    console.log(`Created ${enrollmentCount} course enrollments`);
    
    // ======= 5. Create Assignments =======
    console.log('Creating assignments...');
    const assignmentIds = [];
    
    // Create multiple assignments for each course
    for (const courseId of courseIds) {
      const titles = ['Midterm Exam', 'Final Project', 'Homework Assignment', 'Lab Report', 'Quiz'];
      
      // Create 3 assignments per course
      for (let i = 0; i < 3; i++) {
        const assignmentId = uuidv4();
        assignmentIds.push(assignmentId);
        
        const dueDate = formatDate(randomDate(
          new Date(2023, 9, 15), // Oct 15, 2023
          new Date(2024, 5, 1)   // Jun 1, 2024
        ));
        
        await connection.query(`
          INSERT INTO assignments (id, courseId, title, description, dueDate, points, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          assignmentId,
          courseId,
          `${titles[i % titles.length]} #${i+1}`,
          `Complete the ${titles[i % titles.length].toLowerCase()} according to the instructions provided in class.`,
          dueDate,
          i === 0 ? 100 : (i === 1 ? 50 : 25), // Points based on assignment type
          'published'
        ]);
      }
    }
    
    // Create special assignments for Student Johnson
    if (studentJohnson.length > 0) {
      console.log('Creating special assignments for Student Johnson...');
      const studentJohnsonCourseId = courseIds[0]; // Use the first course
      const specialAssignments = [
        {
          title: 'Introduction Assignment',
          description: 'Introductory assignment for the course',
          dueDate: formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago (past)
          points: 30,
          status: 'published'
        },
        {
          title: 'Mid-term Project',
          description: 'Project to demonstrate understanding of mid-term concepts',
          dueDate: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago (past)
          points: 50,
          status: 'published'
        },
        {
          title: 'Final Exam',
          description: 'Final examination covering all course material',
          dueDate: formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 14 days from now (future)
          points: 100,
          status: 'published'
        },
        {
          title: 'Group Presentation',
          description: 'Group presentation on selected course topics',
          dueDate: formatDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)), // 21 days from now (future)
          points: 75,
          status: 'published'
        },
        {
          title: 'Research Paper',
          description: 'Individual research paper on an approved topic',
          dueDate: formatDate(new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)), // 28 days from now (future)
          points: 100,
          status: 'published'
        }
      ];
      
      for (const assignment of specialAssignments) {
        const assignmentId = uuidv4();
        assignmentIds.push(assignmentId);
        
        await connection.query(`
          INSERT INTO assignments (id, courseId, title, description, dueDate, points, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          assignmentId,
          studentJohnsonCourseId,
          assignment.title,
          assignment.description,
          assignment.dueDate,
          assignment.points,
          assignment.status
        ]);
      }
      
      console.log(`Created 5 special assignments for Student Johnson`);
    }
    
    console.log(`Created ${assignmentIds.length} assignments total`);
    
    // ======= 6. Create Assignment Submissions =======
    console.log('Creating assignment submissions...');
    let submissionCount = 0;
    
    for (const assignmentId of assignmentIds) {
      for (const studentId of studentUsers) {
        const submittedAt = formatDate(randomDate(
          new Date(2023, 9, 20), // Oct 20, 2023
          new Date(2024, 4, 20)  // May 20, 2024
        ));
        
        // Not all students submit all assignments (80% submission rate)
        if (Math.random() > 0.2) {
          await connection.query(`
            INSERT INTO assignment_submissions (id, assignmentId, studentId, submittedAt, status, submissionUrl)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            uuidv4(),
            assignmentId,
            studentId,
            submittedAt,
            'submitted',
            `https://storage.example.com/submissions/${studentId}_${assignmentId}.pdf`
          ]);
          submissionCount++;
        }
      }
    }
    
    console.log(`Created ${submissionCount} assignment submissions`);
    
    // ======= 7. Create Grades =======
    console.log('Creating grades...');
    let gradeCount = 0;
    
    // For each course and student, create some grades
    for (const courseId of courseIds) {
      for (const studentId of studentUsers) {
        const gradeTypes = ['midterm', 'participation', 'assignment'];
        
        // Create 3 grades per student per course
        for (let i = 0; i < 3; i++) {
          await connection.query(`
            INSERT INTO grades (id, studentId, courseId, value, type, gradedBy, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            uuidv4(),
            studentId,
            courseId,
            Math.floor(Math.random() * 30) + 70, // Grades between 70-100
            gradeTypes[i],
            teacherUsers[0],
            `Good job on the ${gradeTypes[i]}`
          ]);
          gradeCount++;
        }
      }
    }
    
    console.log(`Created ${gradeCount} grades`);
    
    // ======= 8. Create Attendance Records =======
    console.log('Creating attendance records...');
    let attendanceCount = 0;
    
    // Create attendance records for each student in each course
    for (const courseId of courseIds) {
      for (const studentId of studentUsers) {
        // Create attendance for 5 different dates
        const statuses = ['present', 'present', 'present', 'late', 'absent'];
        
        for (let i = 0; i < 5; i++) {
          const date = new Date(2023, 9 + i, 1 + i); // Starting from Oct 1, 2023
          
          await connection.query(`
            INSERT INTO attendance (id, courseId, studentId, date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            uuidv4(),
            courseId,
            studentId,
            date.toISOString().split('T')[0],
            statuses[i],
            i === 4 ? 'Student notified in advance about absence' : null // Add notes for absence
          ]);
          attendanceCount++;
        }
      }
    }
    
    console.log(`Created ${attendanceCount} attendance records`);
    
    // ======= 9. Create Course Materials =======
    console.log('Creating course materials...');
    let materialCount = 0;
    
    const materialTypes = ['document', 'video', 'link'];
    const materialTitles = [
      'Lecture Slides', 'Textbook Chapter', 'Reference Guide', 
      'Tutorial Video', 'Practice Problems', 'Supplementary Reading'
    ];
    
    for (const courseId of courseIds) {
      // Create 3 materials per course
      for (let i = 0; i < 3; i++) {
        const type = materialTypes[i % materialTypes.length];
        const title = materialTitles[Math.floor(Math.random() * materialTitles.length)];
        
        await connection.query(`
          INSERT INTO materials (id, courseId, title, description, type, url, uploadedBy, size, duration)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          courseId,
          `${title} - ${i+1}`,
          `${title} for the course module ${i+1}`,
          type,
          type === 'video' 
            ? `https://video.example.com/${courseId}/video${i}.mp4`
            : (type === 'document' 
                ? `https://docs.example.com/${courseId}/doc${i}.pdf`
                : `https://resources.example.com/${courseId}/resource${i}`),
          teacherUsers[0],
          type === 'document' ? Math.floor(Math.random() * 5000) + 500 : null, // Size in KB
          type === 'video' ? Math.floor(Math.random() * 30) + 10 : null // Duration in minutes
        ]);
        materialCount++;
      }
    }
    
    console.log(`Created ${materialCount} course materials`);
    
    // ======= 10. Create Messages =======
    console.log('Creating messages...');
    let messageCount = 0;
    
    // Messages from teacher to all students
    for (const studentId of studentUsers) {
      await connection.query(`
        INSERT INTO messages (id, senderId, receiverId, subject, content, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        teacherUsers[0],
        studentId,
        'Welcome to the course',
        'Welcome to the new academic year! I look forward to working with you all this semester. Please review the syllabus and let me know if you have any questions.',
        'sent'
      ]);
      messageCount++;
      
      // Some students have read the message
      if (Math.random() > 0.3) {
        await connection.query(`
          INSERT INTO messages (id, senderId, receiverId, subject, content, status, readAt)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          studentId,
          teacherUsers[0],
          'Re: Welcome to the course',
          'Thank you for the welcome message. I have reviewed the syllabus and I am looking forward to the course.',
          'read',
          formatDate(new Date())
        ]);
        messageCount++;
      }
    }
    
    console.log(`Created ${messageCount} messages`);
    
    // ======= 11. Create Documents =======
    console.log('Creating documents...');
    let documentCount = 0;
    
    for (const studentId of studentUsers) {
      const documentTypes = ['transcript', 'medical certificate', 'enrollment verification'];
      
      // Each student submits one document
      await connection.query(`
        INSERT INTO documents (id, userId, title, description, type, url, size, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId,
        `${documentTypes[Math.floor(Math.random() * documentTypes.length)]} - ${new Date().getFullYear()}`,
        'Official document for school records',
        documentTypes[Math.floor(Math.random() * documentTypes.length)],
        `https://documents.example.com/${studentId}/doc${Math.floor(Math.random() * 1000)}.pdf`,
        Math.floor(Math.random() * 2000) + 500, // Size in KB
        ['pending', 'approved'][Math.floor(Math.random() * 2)] // 50% pending, 50% approved
      ]);
      documentCount++;
    }
    
    console.log(`Created ${documentCount} documents`);
    
    // ======= 12. Create Events =======
    console.log('Creating events...');
    
    const eventIds = [];
    const eventTitles = [
      'Parent-Teacher Conference', 'Science Fair', 'Math Competition',
      'End of Year Ceremony', 'Field Trip', 'Guest Speaker Session'
    ];
    
    for (let i = 0; i < 4; i++) {
      const eventId = uuidv4();
      eventIds.push(eventId);
      
      const startDate = new Date(2023, 8 + i * 2, 15); // Bimonthly events starting from Sep 15
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 2); // 2 hour events
      
      await connection.query(`
        INSERT INTO events (id, title, description, startDate, endDate, location, organizer, type, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        eventId,
        eventTitles[i % eventTitles.length],
        `School-wide ${eventTitles[i % eventTitles.length].toLowerCase()} for all students and faculty`,
        formatDate(startDate),
        formatDate(endDate),
        `Main Building, Room ${Math.floor(Math.random() * 10) + 100}`,
        adminUsers[0] || teacherUsers[0],
        i % 2 === 0 ? 'academic' : 'social',
        'scheduled'
      ]);
    }
    
    console.log(`Created ${eventIds.length} events`);
    
    // ======= 13. Create Notifications =======
    console.log('Creating notifications...');
    let notificationCount = 0;
    
    // Create notifications for all students
    for (const studentId of studentUsers) {
      const notificationTypes = [
        'assignment_due', 'grade_posted', 'course_announcement', 
        'event_reminder', 'attendance_alert'
      ];
      
      // Create 3 notifications per student
      for (let i = 0; i < 3; i++) {
        const type = notificationTypes[i % notificationTypes.length];
        const messages = {
          assignment_due: 'You have an assignment due soon',
          grade_posted: 'A new grade has been posted',
          course_announcement: 'New announcement in your course',
          event_reminder: 'Upcoming school event',
          attendance_alert: 'Attendance record updated'
        };
        
        await connection.query(`
          INSERT INTO notifications (id, userId, type, message, isRead, relatedId)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          studentId,
          type,
          messages[type],
          Math.random() > 0.5, // 50% chance of being read
          type === 'assignment_due' && assignmentIds.length > 0 
            ? assignmentIds[Math.floor(Math.random() * assignmentIds.length)] 
            : null
        ]);
        notificationCount++;
      }
    }
    
    console.log(`Created ${notificationCount} notifications`);
    
    console.log('\nTest data seed completed successfully!');
    
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the seed function
seedTestData().catch(console.error); 