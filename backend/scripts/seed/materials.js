/**
 * Seed script for course materials
 */
const { uuidv4, createTableIfNotExists } = require('./utils');

/**
 * Seed course materials
 * @param {object} connection - MySQL connection
 * @param {object} courseData - Course IDs from courses seed
 */
async function seedMaterials(connection, courseData) {
  console.log('Creating course materials...');
  
  // Extract IDs
  const { course1Id, course2Id, course3Id } = courseData;
  
  try {
    // Get teacher IDs from courses
    const [rows] = await connection.query(`
      SELECT id, teacherId FROM courses WHERE id IN (?, ?, ?)
    `, [course1Id, course2Id, course3Id]);
    
    const courseTeachers = {};
    rows.forEach(row => {
      courseTeachers[row.id] = row.teacherId;
    });
    
    // Create materials table if it doesn't exist
    await createTableIfNotExists(connection, 'materials', `
      CREATE TABLE IF NOT EXISTS materials (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('document', 'video', 'link') NOT NULL,
        url VARCHAR(255) NOT NULL,
        uploadedBy VARCHAR(36) NOT NULL,
        uploadedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        size INT,
        duration INT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table materials ready');
    
    // Clean up existing materials
    await connection.query(`
      DELETE FROM materials 
      WHERE courseId = ? OR courseId = ? OR courseId = ?
    `, [course1Id, course2Id, course3Id]).catch(err => {
      console.warn('Warning when cleaning materials:', err.message);
    });
    
    // Generate material IDs
    const mathSyllabusId = uuidv4();
    const mathTextbookId = uuidv4();
    const physicsLabManualId = uuidv4();
    const physicsSlideId = uuidv4();
    const chemistryTextbookId = uuidv4();
    
    // Insert mathematics materials
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy, size
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mathSyllabusId,
      course1Id,
      'Advanced Math Syllabus',
      'Course syllabus with grading information, schedule, and expectations',
      'document',
      '/files/math/syllabus.pdf',
      courseTeachers[course1Id],
      1024
    ]);
    console.log('Material created: Advanced Math Syllabus');
    
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy, size
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      mathTextbookId,
      course1Id,
      'Mathematics Textbook',
      'Required textbook for the course covering all essential topics',
      'document',
      '/files/math/textbook.pdf',
      courseTeachers[course1Id],
      5120
    ]);
    console.log('Material created: Mathematics Textbook');
    
    // Insert physics materials
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy, size
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      physicsLabManualId,
      course2Id,
      'Physics Lab Manual',
      'Manual containing instructions for all lab experiments',
      'document',
      '/files/physics/lab_manual.pdf',
      courseTeachers[course2Id],
      3072
    ]);
    console.log('Material created: Physics Lab Manual');
    
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy, size, duration
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      physicsSlideId,
      course2Id,
      'Lecture Slides: Newton\'s Laws',
      'Presentation slides covering Newton\'s three laws of motion',
      'video',
      '/files/physics/newton_laws_video.mp4',
      courseTeachers[course2Id],
      15360,
      1200 // 20 minutes in seconds
    ]);
    console.log('Material created: Lecture Video: Newton\'s Laws');
    
    // Insert chemistry materials
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy, size
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      chemistryTextbookId,
      course3Id,
      'Chemistry Fundamentals',
      'Digital textbook covering all basic chemistry concepts',
      'document',
      '/files/chemistry/fundamentals.pdf',
      courseTeachers[course3Id],
      4096
    ]);
    console.log('Material created: Chemistry Fundamentals');
    
    return {
      success: true,
      materialIds: {
        mathSyllabusId,
        mathTextbookId,
        physicsLabManualId,
        physicsSlideId,
        chemistryTextbookId
      },
      message: 'Course materials created successfully'
    };
  } catch (error) {
    console.error('Error creating course materials:', error);
    throw error;
  }
}

module.exports = seedMaterials; 