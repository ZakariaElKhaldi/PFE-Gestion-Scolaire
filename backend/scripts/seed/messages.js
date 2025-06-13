/**
 * Seed script for messages
 */
const { uuidv4, createTableIfNotExists } = require('./utils');

/**
 * Seed messages
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 * @returns {object} - Message IDs for reference
 */
async function seedMessages(connection, userData) {
  console.log('Creating messages...');
  
  // Extract user IDs
  const { adminId, teacherId1, teacherId2, studentId1, studentId2, parentId1, parentId2 } = userData;
  
  try {
    // Create messages table if it doesn't exist
    await createTableIfNotExists(connection, 'messages', `
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        sender_id VARCHAR(36) NOT NULL,
        receiver_id VARCHAR(36) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL DEFAULT NULL,
        status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (sent_at),
        INDEX (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Clean up existing messages
    await connection.query(`
      DELETE FROM messages 
      WHERE sender_id IN (?, ?, ?, ?, ?, ?, ?) OR receiver_id IN (?, ?, ?, ?, ?, ?, ?)
    `, [
      adminId, teacherId1, teacherId2, studentId1, studentId2, parentId1, parentId2,
      adminId, teacherId1, teacherId2, studentId1, studentId2, parentId1, parentId2
    ]).catch(err => {
      console.warn('Warning when cleaning messages:', err.message);
    });
    
    // Generate message IDs
    const messageId1 = uuidv4();
    const messageId2 = uuidv4();
    const messageId3 = uuidv4();
    const messageId4 = uuidv4();
    const messageId5 = uuidv4();
    const messageId6 = uuidv4();
    
    // Create a message from admin to teachers (announcement)
    await connection.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, subject, content, status, sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId1,
      adminId,
      teacherId1,
      'Staff Meeting - Thursday',
      'This is a reminder that we have a staff meeting scheduled for Thursday at 3:00 PM. Please prepare your quarterly reports.',
      'read',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    ]);
    console.log('Created admin announcement to teacher 1');
    
    // Admin message to teacher 2
    await connection.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, subject, content, status, sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId2,
      adminId, 
      teacherId2,
      'Staff Meeting - Thursday',
      'This is a reminder that we have a staff meeting scheduled for Thursday at 3:00 PM. Please prepare your quarterly reports.',
      'delivered',
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    ]);
    console.log('Created admin announcement to teacher 2');
    
    // Teacher 1 message to student 1
    await connection.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, subject, content, status, sent_at, read_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId3,
      teacherId1,
      studentId1,
      'About Your Latest Assignment',
      'I wanted to discuss your latest mathematics assignment. Your approach to problem 3 was quite creative. Could you stop by during office hours to discuss it further?',
      'read',
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    ]);
    console.log('Created teacher message to student');
    
    // Teacher to parent
    await connection.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, subject, content, status, sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId4,
      teacherId1,
      parentId1,
      'Student Progress Update',
      'I wanted to update you on your child\'s progress in mathematics class. They\'ve shown significant improvement in the last two weeks and their homework completion rate has been excellent.',
      'delivered',
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    ]);
    console.log('Created teacher message to parent');
    
    // Student to teacher
    await connection.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, subject, content, status, sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId5,
      studentId1,
      teacherId1,
      'Question about Assignment 3',
      'I\'m having difficulty understanding question 5 in Assignment 3. Could you provide some additional explanation or resources to help me understand the concept better?',
      'delivered',
      new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    ]);
    console.log('Created student message to teacher');
    
    // Parent to teacher
    await connection.query(`
      INSERT INTO messages (
        id, sender_id, receiver_id, subject, content, status, sent_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId6,
      parentId1,
      teacherId1,
      'Request for Parent-Teacher Meeting',
      'I would like to schedule a meeting to discuss my child\'s progress in your class. I\'m available next Monday or Wednesday after 4:00 PM. Please let me know what works best for you.',
      'sent',
      new Date() // Just now
    ]);
    console.log('Created parent message to teacher');
    
    return {
      success: true,
      messageIds: {
        messageId1,
        messageId2,
        messageId3,
        messageId4,
        messageId5,
        messageId6
      },
      message: 'Messages created successfully'
    };
  } catch (error) {
    console.error('Error creating messages:', error);
    throw error;
  }
}

module.exports = seedMessages; 