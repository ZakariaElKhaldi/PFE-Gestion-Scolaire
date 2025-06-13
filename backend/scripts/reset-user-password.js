// Script to reset a user's password
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetUserPassword() {
  // User email to reset
  const userEmail = 'vertigoevilman1@gmail.com';
  
  // New password to set
  const newPassword = 'Password123!';
  
  console.log(`Starting password reset for user: ${userEmail}`);
  
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
    
    // Find user
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    );
    
    if (users.length === 0) {
      console.error(`No user found with email: ${userEmail}`);
      return;
    }
    
    const userId = users[0].id;
    console.log(`Found user with ID: ${userId}`);
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    console.log(`Password updated for user: ${userEmail}`);
    console.log(`New password is: ${newPassword}`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Execute the function
resetUserPassword().catch(console.error); 