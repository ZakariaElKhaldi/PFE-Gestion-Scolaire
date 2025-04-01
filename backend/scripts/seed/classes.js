/**
 * Seed script for classes and schedules
 */
const { uuidv4, createTableIfNotExists, getNextDayOfWeek } = require('./utils');

/**
 * Seed classes and schedules
 * @param {object} connection - MySQL connection
 * @param {object} courseData - Course IDs from courses seed
 * @returns {object} - Class IDs for use in other seed modules
 */
async function seedClasses(connection, courseData) {
  console.log('Creating classes and schedules...');
  
  // Extract course IDs
  const { course1Id, course2Id, course3Id } = courseData;
  
  // Class IDs
  const class1Id = uuidv4();
  const class2Id = uuidv4();
  const class3Id = uuidv4();
  
  try {
    // Create classes table if it doesn't exist
    await createTableIfNotExists(connection, 'classes', `
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        teacherId VARCHAR(36) NOT NULL,
        room VARCHAR(50) NOT NULL,
        capacity INT NOT NULL DEFAULT 30,
        status ENUM('active', 'cancelled', 'completed') NOT NULL DEFAULT 'active',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Get teacher IDs from courses
    const [rows] = await connection.query(`
      SELECT id, teacherId FROM courses WHERE id IN (?, ?, ?)
    `, [course1Id, course2Id, course3Id]);
    
    const courseTeachers = {};
    rows.forEach(row => {
      courseTeachers[row.id] = row.teacherId;
    });
    
    // Delete any existing classes for these courses
    await connection.query(`
      DELETE FROM classes WHERE courseId IN (?, ?, ?)
    `, [course1Id, course2Id, course3Id]).catch(err => {
      console.warn('Warning when cleaning classes:', err.message);
    });
    
    // Create class sessions
    await connection.query(`
      INSERT INTO classes (
        id, courseId, teacherId, room, capacity, status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      class1Id,
      course1Id,
      courseTeachers[course1Id],
      'Room 101',
      30,
      'active'
    ]);
    console.log('Class session 1 created for Advanced Mathematics');
    
    await connection.query(`
      INSERT INTO classes (
        id, courseId, teacherId, room, capacity, status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      class2Id,
      course2Id,
      courseTeachers[course2Id],
      'Room 203',
      25,
      'active'
    ]);
    console.log('Class session 2 created for Physics 101');
    
    await connection.query(`
      INSERT INTO classes (
        id, courseId, teacherId, room, capacity, status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      class3Id,
      course3Id,
      courseTeachers[course3Id],
      'Lab 2',
      20,
      'active'
    ]);
    console.log('Class session 3 created for Chemistry Basics');
    
    // Create class schedules table if it doesn't exist
    await createTableIfNotExists(connection, 'class_schedules', `
      CREATE TABLE IF NOT EXISTS class_schedules (
        id VARCHAR(36) PRIMARY KEY,
        classId VARCHAR(36) NOT NULL,
        day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Delete any existing schedule entries for these classes
    await connection.query(`
      DELETE FROM class_schedules WHERE classId IN (?, ?, ?)
    `, [class1Id, class2Id, class3Id]).catch(err => {
      console.warn('Warning when cleaning schedules:', err.message);
    });
    
    // Create class schedules
    await connection.query(`
      INSERT INTO class_schedules (
        id, classId, day, startTime, endTime
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      class1Id,
      'monday',
      '09:00:00',
      '10:30:00'
    ]);
    console.log('Schedule created for Math class on Monday');
    
    await connection.query(`
      INSERT INTO class_schedules (
        id, classId, day, startTime, endTime
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      class2Id,
      'tuesday',
      '13:00:00',
      '14:30:00'
    ]);
    console.log('Schedule created for Physics class on Tuesday');
    
    await connection.query(`
      INSERT INTO class_schedules (
        id, classId, day, startTime, endTime
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      class3Id,
      'wednesday',
      '10:00:00',
      '12:00:00'
    ]);
    console.log('Schedule created for Chemistry class on Wednesday');
    
    return {
      class1Id,
      class2Id,
      class3Id,
      classes: [
        {
          id: class1Id,
          courseId: course1Id,
          day: 'monday'
        },
        {
          id: class2Id,
          courseId: course2Id,
          day: 'tuesday'
        },
        {
          id: class3Id,
          courseId: course3Id,
          day: 'wednesday'
        }
      ]
    };
  } catch (error) {
    console.error('Error creating classes:', error);
    throw error;
  }
}

module.exports = seedClasses; 