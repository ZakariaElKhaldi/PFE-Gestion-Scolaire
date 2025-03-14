/**
 * Database reset and seed script
 * Run with: node db/reset-db.js
 * 
 * This script:
 * 1. Resets the database using schema.sql
 * 2. Seeds basic users with seed-users.js
 * 3. Seeds test data with seed-test-data.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const util = require('util');

// Convert exec to promise
const execPromise = util.promisify(exec);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function resetDatabase() {
  console.log('Starting database reset and seed process...');
  
  // Database connection config
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe',
    multipleStatements: true
  };
  
  try {
    // Step 1: Reset the database with schema.sql
    console.log('\n=== STEP 1: Resetting database schema ===');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found at: ' + schemaPath);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Create connection without specifying database to be able to drop it
    let connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });
    
    // Drop and recreate database
    await connection.query(`DROP DATABASE IF EXISTS ${dbConfig.database};`);
    await connection.query(`CREATE DATABASE ${dbConfig.database};`);
    await connection.query(`USE ${dbConfig.database};`);
    
    // Run the schema SQL
    await connection.query(schema);
    console.log('Database schema reset successfully');
    await connection.end();
    
    // Step 2: Run the seed-users.js script
    console.log('\n=== STEP 2: Seeding users ===');
    await execPromise('node db/seed-users.js');
    
    // Step 3: Run the seed-test-data.js script
    console.log('\n=== STEP 3: Seeding test data ===');
    await execPromise('node db/seed-test-data.js');
    
    console.log('\n=== Database reset and seed completed successfully! ===');
    console.log('\nYou can now log in with the following credentials:');
    console.log('- Admin: admin@school.com / password123');
    console.log('- Teacher: teacher@school.com / password123');
    console.log('- Student: student@school.com / password123 (ID: f4b969e2-324a-4333-9624-d016a54ea06d)');
    console.log('- Parent: parent@school.com / password123');
    
  } catch (error) {
    console.error('Error during database reset and seed:', error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabase(); 