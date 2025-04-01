/**
 * Database Reset Script
 * 
 * This script helps developers reset their database to a clean state.
 * It will:
 * 1. Drop all tables from the database
 * 2. Recreate the database structure
 * 
 * WARNING: This will delete all data in the database!
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get confirmation from user
function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function resetDatabase() {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  WARNING: This will DELETE ALL DATA in your database!');
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Make sure you have backups if needed.');
  
  const answer = await askQuestion('\x1b[1m Are you sure you want to continue? (yes/no) \x1b[0m');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('Database reset cancelled.');
    rl.close();
    return;
  }
  
  console.log('Proceeding with database reset...');
  
  try {
    // Create connection without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    console.log('Connected to MySQL server');
    
    // Get database name from env
    const dbName = process.env.DB_NAME;
    
    // Drop database if it exists
    console.log(`Dropping database ${dbName} if it exists...`);
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    
    // Create database
    console.log(`Creating database ${dbName}...`);
    await connection.query(`CREATE DATABASE ${dbName} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Close connection
    await connection.end();
    
    console.log('Database recreated. Running migrations...');
    
    // Run migrations
    await execPromise('npm run migrations');
    
    console.log('\x1b[32m%s\x1b[0m', '✅ Database reset completed successfully!');
    console.log('You can now start the server with: npm run dev');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error resetting database:');
    console.error(error);
  } finally {
    rl.close();
  }
}

resetDatabase(); 