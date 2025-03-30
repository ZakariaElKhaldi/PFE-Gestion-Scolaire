/**
 * Seed script for attendance records
 */
const { uuidv4, createTableIfNotExists, getNextDayOfWeek } = require('./utils');

/**
 * Seed attendance records
 * @param {object} connection - MySQL connection
 * @param {object} classData - Class IDs from classes seed
 * @param {object} userData - User IDs from users seed
 */
async function seedAttendance(connection, classData, userData) {
  console.log('Creating attendance records...');
  
  // Extract IDs
  const { class1Id, class2Id, class3Id, classes } = classData;
  const { studentId1, studentId2, studentId3 } = userData;
  
  // Get courseIds from classData
  const courseIds = {
    course1Id: classes[0].courseId, // Math course
    course2Id: classes[1].courseId, // Physics course
    course3Id: classes[2].courseId  // Chemistry course
  };
  
  try {
    // Create attendance table if it doesn't exist
    await createTableIfNotExists(connection, 'attendance', `
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (courseId, studentId, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Clean up existing attendance records
    await connection.query(`
      DELETE FROM attendance 
      WHERE (studentId = ? OR studentId = ? OR studentId = ?)
      AND (courseId = ? OR courseId = ? OR courseId = ?)
    `, [
      studentId1, studentId2, studentId3,
      courseIds.course1Id, courseIds.course2Id, courseIds.course3Id
    ]).catch(err => {
      console.warn('Warning when cleaning attendance:', err.message);
    });
    
    const currentDate = new Date();
    
    // Find next Monday, Tuesday, and Wednesday
    const nextMonday = getNextDayOfWeek(currentDate, 1); // 1 is Monday
    const nextTuesday = getNextDayOfWeek(currentDate, 2); // 2 is Tuesday
    const nextWednesday = getNextDayOfWeek(currentDate, 3); // 3 is Wednesday
    
    // Generate some past attendance records (for the past 3 weeks)
    const attendancePromises = [];
    
    for (let i = 1; i <= 3; i++) {
      // Math class attendance (Monday)
      const pastMonday = new Date(nextMonday);
      pastMonday.setDate(pastMonday.getDate() - (7 * i));
      const mondayDate = pastMonday.toISOString().split('T')[0];
      
      // Student 1 in Math class
      attendancePromises.push(
        connection.query(`
          INSERT INTO attendance (
            id, courseId, studentId, date, status, notes
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          courseIds.course1Id,
          studentId1,
          mondayDate,
          i === 2 ? 'absent' : 'present',
          i === 2 ? 'Student was sick' : ''
        ]).then(() => {
          console.log(`Attendance record created: Student 1, Math course, ${mondayDate}, ${i === 2 ? 'absent' : 'present'}`);
        })
      );
      
      // Student 2 in Math class (only for the last 2 weeks)
      if (i < 3) {
        attendancePromises.push(
          connection.query(`
            INSERT INTO attendance (
              id, courseId, studentId, date, status, notes
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            uuidv4(),
            courseIds.course1Id,
            studentId2,
            mondayDate,
            'present',
            ''
          ]).then(() => {
            console.log(`Attendance record created: Student 2, Math course, ${mondayDate}, present`);
          })
        );
      }
      
      // Physics class attendance (Tuesday)
      const pastTuesday = new Date(nextTuesday);
      pastTuesday.setDate(pastTuesday.getDate() - (7 * i));
      const tuesdayDate = pastTuesday.toISOString().split('T')[0];
      
      // Student 1 in Physics class
      attendancePromises.push(
        connection.query(`
          INSERT INTO attendance (
            id, courseId, studentId, date, status, notes
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          courseIds.course2Id,
          studentId1,
          tuesdayDate,
          i === 1 ? 'late' : 'present',
          i === 1 ? 'Student arrived 10 minutes late' : ''
        ]).then(() => {
          console.log(`Attendance record created: Student 1, Physics course, ${tuesdayDate}, ${i === 1 ? 'late' : 'present'}`);
        })
      );
      
      // Student 3 in Physics class
      attendancePromises.push(
        connection.query(`
          INSERT INTO attendance (
            id, courseId, studentId, date, status, notes
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          courseIds.course2Id,
          studentId3,
          tuesdayDate,
          'present',
          ''
        ]).then(() => {
          console.log(`Attendance record created: Student 3, Physics course, ${tuesdayDate}, present`);
        })
      );
      
      // Chemistry class attendance (Wednesday)
      const pastWednesday = new Date(nextWednesday);
      pastWednesday.setDate(pastWednesday.getDate() - (7 * i));
      const wednesdayDate = pastWednesday.toISOString().split('T')[0];
      
      // Student 3 in Chemistry class
      attendancePromises.push(
        connection.query(`
          INSERT INTO attendance (
            id, courseId, studentId, date, status, notes
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          courseIds.course3Id,
          studentId3,
          wednesdayDate,
          i === 3 ? 'excused' : 'present',
          i === 3 ? 'Family emergency' : ''
        ]).then(() => {
          console.log(`Attendance record created: Student 3, Chemistry course, ${wednesdayDate}, ${i === 3 ? 'excused' : 'present'}`);
        })
      );
    }
    
    // Handle attendance insertion errors individually
    for (const attendancePromise of attendancePromises) {
      try {
        await attendancePromise;
      } catch (error) {
        // This might happen if the unique constraint is violated
        console.warn('Warning when inserting attendance:', error.message);
      }
    }
    
    console.log('Created attendance records for the past 3 weeks');
    
    return {
      success: true,
      message: 'Attendance records created successfully'
    };
  } catch (error) {
    console.error('Error creating attendance records:', error);
    throw error;
  }
}

module.exports = seedAttendance; 