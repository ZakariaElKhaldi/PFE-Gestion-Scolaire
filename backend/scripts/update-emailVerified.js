// Script to update emailVerified field for all users
require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateEmailVerifiedField() {
  console.log('Starting script to update emailVerified field for all users...');
  
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
    
    // Update emailVerified to TRUE for all users
    console.log('Updating emailVerified field for all users...');
    const [result] = await connection.execute(`
      UPDATE users 
      SET emailVerified = TRUE 
      WHERE emailVerified IS NULL OR emailVerified = FALSE
    `);
    
    console.log(`Updated ${result.affectedRows} users`);
    
    // Update the default value for the field
    console.log('Updating default value for emailVerified field...');
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN emailVerified BOOLEAN DEFAULT TRUE
    `);
    
    console.log('Default value updated successfully');
    
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Error updating emailVerified field:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed');
  }
}

// Execute the function
updateEmailVerifiedField().catch(console.error); 