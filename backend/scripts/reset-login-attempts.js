// Script to reset login attempts for a user
require('dotenv').config();
const mysql = require('mysql2/promise');

async function resetLoginAttempts() {
  // User email to reset login attempts for
  const userEmail = 'vertigoevilman1@gmail.com';
  
  console.log(`Starting login attempts reset for user: ${userEmail}`);
  
  // Create MySQL connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe'
  });
  
  try {
    console.log('Connected to database successfully');
    
    // Delete login attempts for this user/email
    const [result1] = await connection.execute(
      'DELETE FROM login_attempts WHERE email = ?',
      [userEmail]
    );
    
    console.log(`Deleted ${result1.affectedRows} login attempt records for ${userEmail}`);
    
    // Also reset any account locking in the users table
    const [result2] = await connection.execute(
      'UPDATE users SET failedLoginAttempts = 0, accountLocked = FALSE WHERE email = ?',
      [userEmail]
    );
    
    console.log(`Reset account lock status for user: ${userEmail}`);
    console.log(`Reset ${result2.affectedRows} user records`);
    
    console.log('Login attempts reset successfully!');
    
  } catch (error) {
    console.error('Error resetting login attempts:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Execute the function
resetLoginAttempts().catch(console.error); 