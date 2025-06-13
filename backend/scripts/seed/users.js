/**
 * Seed script for users
 */
const { uuidv4, hashPassword, deleteExistingRecordByEmail } = require('./utils');

/**
 * Seed users
 * @param {object} connection - MySQL connection
 * @returns {object} - User IDs for use in other seed modules
 */
async function seedUsers(connection) {
  console.log('Creating users...');
  
  // Default password for all users
  const hashedPassword = await hashPassword('password123');
  
  // Generate UUIDs for each user
  // Administrators
  const adminId = uuidv4();
  const adminId2 = uuidv4();
  
  // Teachers
  const teacherId1 = uuidv4();
  const teacherId2 = uuidv4();
  const teacherId3 = uuidv4();
  const teacherId4 = uuidv4();
  
  // Students
  // Set specific UUID for Student Johnson to match the one used in the application
  const studentId1 = 'f4b969e2-324a-4333-9624-d016a54ea06d';
  const studentId2 = uuidv4();
  const studentId3 = uuidv4();
  const studentId4 = uuidv4();
  const studentId5 = uuidv4();
  
  // Parents
  const parentId1 = uuidv4();
  const parentId2 = uuidv4();
  const parentId3 = uuidv4();
  const parentId4 = uuidv4();
  
  try {
    // Check which columns exist in the users table
    const [columnsResult] = await connection.query('SHOW COLUMNS FROM users');
    const columns = columnsResult.map(col => col.Field);
    
    const hasProfilePicture = columns.includes('profilePicture');
    const hasBio = columns.includes('bio');
    const hasEmailVerified = columns.includes('emailVerified');
    
    console.log('Available columns in users table:', columns.join(', '));
    
    // Delete existing records by email to prevent duplicates
    await deleteExistingRecordByEmail(connection, 'admin@school.com');
    await deleteExistingRecordByEmail(connection, 'director@school.com');
    await deleteExistingRecordByEmail(connection, 'teacher@school.com');
    await deleteExistingRecordByEmail(connection, 'science.teacher@school.com');
    await deleteExistingRecordByEmail(connection, 'math.teacher@school.com');
    await deleteExistingRecordByEmail(connection, 'history.teacher@school.com');
    await deleteExistingRecordByEmail(connection, 'student@school.com');
    await deleteExistingRecordByEmail(connection, 'mike.student@school.com');
    await deleteExistingRecordByEmail(connection, 'emma.student@school.com');
    await deleteExistingRecordByEmail(connection, 'alex.student@school.com');
    await deleteExistingRecordByEmail(connection, 'sophia.student@school.com');
    await deleteExistingRecordByEmail(connection, 'parent@school.com');
    await deleteExistingRecordByEmail(connection, 'jane.parent@school.com');
    await deleteExistingRecordByEmail(connection, 'robert.parent@school.com');
    await deleteExistingRecordByEmail(connection, 'maria.parent@school.com');
    
    // Helper function to create dynamic query based on available columns
    const createUserInsertQuery = () => {
      const fields = ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'phoneNumber'];
      
      if (hasProfilePicture) fields.push('profilePicture');
      if (hasBio) fields.push('bio');
      if (hasEmailVerified) fields.push('emailVerified');
      
      const placeholders = fields.map(() => '?').join(', ');
      return `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`;
    };
    
    // Helper function to prepare user values based on available columns
    const prepareUserValues = (id, email, firstName, lastName, role, phone, profilePic, bio) => {
      const values = [id, email, hashedPassword, firstName, lastName, role, phone];
      
      if (hasProfilePicture) values.push(profilePic || null);
      if (hasBio) values.push(bio || null);
      if (hasEmailVerified) values.push(true);
      
      return values;
    };
    
    // Insert admin users
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      adminId,
      'admin@school.com',
      'Admin',
      'User',
      'administrator',
      '123-456-7890',
        'https://randomuser.me/api/portraits/men/1.jpg',
        'Main system administrator with over 10 years of experience in educational institutions.'
      )
    );
    console.log('Admin user created successfully');
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        adminId2, 
        'director@school.com', 
        'Emily', 
        'Rodriguez', 
        'administrator', 
        '123-456-7891',
        'https://randomuser.me/api/portraits/women/2.jpg',
        'School Director with a PhD in Educational Leadership. Focused on improving educational standards and student outcomes.'
      )
    );
    console.log('Admin 2 (Director) created successfully');
    
    // Insert teacher users
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      teacherId1,
      'teacher@school.com',
        'John', 
      'Smith',
      'teacher',
        '123-456-7892',
        'https://randomuser.me/api/portraits/men/3.jpg',
        'English teacher with 8 years of experience. Specializes in contemporary literature and creative writing.'
      )
    );
    console.log('Teacher 1 created successfully');
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      teacherId2,
      'science.teacher@school.com',
      'Sarah',
      'Johnson',
      'teacher',
        '123-456-7893',
        'https://randomuser.me/api/portraits/women/4.jpg',
        'Science teacher with a focus on physics and chemistry. PhD in Physics from Stanford University.'
      )
    );
    console.log('Teacher 2 created successfully');
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        teacherId3, 
        'math.teacher@school.com', 
        'David', 
        'Wilson', 
        'teacher', 
        '123-456-7894',
        'https://randomuser.me/api/portraits/men/5.jpg',
        'Mathematics teacher specializing in advanced calculus and statistics. 12 years of teaching experience.'
      )
    );
    console.log('Teacher 3 created successfully');
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        teacherId4, 
        'history.teacher@school.com', 
        'Linda', 
        'Garcia', 
        'teacher', 
        '123-456-7895',
        'https://randomuser.me/api/portraits/women/6.jpg',
        'History teacher with expertise in world civilizations and American history. Published author on historical topics.'
      )
    );
    console.log('Teacher 4 created successfully');
    
    // Insert student users
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      studentId1,
      'student@school.com',
      'Student',
      'Johnson',
      'student',
        '123-456-7896',
        'https://randomuser.me/api/portraits/men/7.jpg',
        'Junior year student interested in computer science and mathematics. Active in the chess club.'
      )
    );
    console.log('Student 1 created successfully with ID: ' + studentId1);
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      studentId2,
      'mike.student@school.com',
      'Mike',
      'Williams',
      'student',
        '123-456-7897',
        'https://randomuser.me/api/portraits/men/8.jpg',
        'Senior year student with a focus on science and robotics. President of the Robotics Club.'
      )
    );
    console.log('Student 2 created successfully with ID: ' + studentId2);
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      studentId3,
      'emma.student@school.com',
      'Emma',
      'Davis',
      'student',
        '123-456-7898',
        'https://randomuser.me/api/portraits/women/9.jpg',
        'Sophomore interested in literature and journalism. Editor of the school newspaper.'
      )
    );
    console.log('Student 3 created successfully with ID: ' + studentId3);
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        studentId4, 
        'alex.student@school.com', 
        'Alex', 
        'Martinez', 
        'student', 
        '123-456-7899',
        'https://randomuser.me/api/portraits/men/10.jpg',
        'Freshman with interest in music and performing arts. Member of the school band.'
      )
    );
    console.log('Student 4 created successfully with ID: ' + studentId4);
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        studentId5, 
        'sophia.student@school.com', 
        'Sophia', 
        'Brown', 
        'student', 
        '123-456-7900',
        'https://randomuser.me/api/portraits/women/11.jpg',
        'Junior year student focused on art and design. Winner of multiple art competitions.'
      )
    );
    console.log('Student 5 created successfully with ID: ' + studentId5);
    
    // Insert parent users
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      parentId1,
      'parent@school.com',
        'Robert', 
      'Johnson',
      'parent',
        '123-456-7901',
        'https://randomuser.me/api/portraits/men/12.jpg',
        'Father of Student Johnson. Works as a software engineer and actively participates in school activities.'
      )
    );
    console.log('Parent 1 created successfully');
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
      parentId2,
      'jane.parent@school.com',
      'Jane',
      'Williams',
      'parent',
        '123-456-7902',
        'https://randomuser.me/api/portraits/women/13.jpg',
        'Mother of Mike Williams. Works as a doctor and volunteers for school health initiatives.'
      )
    );
    console.log('Parent 2 created successfully');
    
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        parentId3, 
        'robert.parent@school.com', 
        'Robert', 
        'Davis', 
        'parent', 
        '123-456-7903',
        'https://randomuser.me/api/portraits/men/14.jpg',
        'Father of Emma Davis. Professor of Literature at the local university.'
      )
    );
    console.log('Parent 3 created successfully');
      
    await connection.query(
      createUserInsertQuery(),
      prepareUserValues(
        parentId4, 
        'maria.parent@school.com', 
        'Maria', 
        'Martinez', 
        'parent', 
        '123-456-7904',
        'https://randomuser.me/api/portraits/women/15.jpg',
        'Mother of Alex Martinez. Works in the arts and helps coordinate school music programs.'
      )
    );
    console.log('Parent 4 created successfully');
    
    // Return IDs for use in other seed modules
    return {
      adminId,
      adminId2,
      teacherId1,
      teacherId2,
      teacherId3,
      teacherId4,
      studentId1,
      studentId2,
      studentId3,
      studentId4,
      studentId5,
      parentId1,
      parentId2,
      parentId3,
      parentId4
    };
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

module.exports = seedUsers; 