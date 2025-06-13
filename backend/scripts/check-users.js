const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pfe'
    });

    console.log('Checking users with profile pictures...');

    // Query users with profile pictures
    const [rows] = await connection.query(`
      SELECT email, firstName, lastName, role, profilePicture, bio
      FROM users 
      WHERE profilePicture IS NOT NULL
      LIMIT 3
    `);

    console.log('Found users with profile pictures:', rows.length);
    
    // Display users with profile pictures
    rows.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`- Name: ${user.firstName} ${user.lastName}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Role: ${user.role}`);
      console.log(`- Profile Picture: ${user.profilePicture}`);
      console.log(`- Bio: ${user.bio}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
run(); 