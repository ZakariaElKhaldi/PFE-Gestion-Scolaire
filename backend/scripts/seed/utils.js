/**
 * Utility functions for seed scripts
 */
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Hash a password with bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Create a table if it doesn't exist
 * @param {object} connection - MySQL connection
 * @param {string} tableName - Name of the table
 * @param {string} createTableSQL - SQL to create the table
 */
async function createTableIfNotExists(connection, tableName, createTableSQL) {
  try {
    await connection.query(createTableSQL);
    console.log(`Table ${tableName} ready`);
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Delete existing records by email to handle duplicates
 * @param {object} connection - MySQL connection
 * @param {string} email - Email to check for
 * @param {string} table - Table name
 */
async function deleteExistingRecordByEmail(connection, email, table = 'users') {
  try {
    const [rows] = await connection.query(
      `SELECT id FROM ${table} WHERE email = ?`,
      [email]
    );
    
    if (rows.length > 0) {
      console.log(`Found existing ${table} record with email ${email}. Deleting...`);
      await connection.query(
        `DELETE FROM ${table} WHERE email = ?`,
        [email]
      );
    }
  } catch (error) {
    console.error(`Error checking/deleting existing record:`, error.message);
  }
}

/**
 * Check if department code exists and use a different one if it does
 * @param {object} connection - MySQL connection
 * @param {string} code - Department code to check
 * @returns {Promise<string>} - A unique department code
 */
async function getUniqueDepartmentCode(connection, code) {
  try {
    const [rows] = await connection.query(
      'SELECT code FROM departments WHERE code = ?',
      [code]
    );
    
    if (rows.length === 0) {
      return code;
    }
    
    // If code exists, append a random number
    const uniqueCode = `${code}${Math.floor(Math.random() * 900) + 100}`;
    console.log(`Department code ${code} already exists. Using ${uniqueCode} instead.`);
    return uniqueCode;
  } catch (error) {
    console.error('Error checking department code:', error.message);
    // Return a random code if there's an error
    return `${code}${Math.floor(Math.random() * 900) + 100}`;
  }
}

/**
 * Find the next occurrence of a specific day of the week
 * @param {Date} date - Starting date
 * @param {number} dayOfWeek - Day to find (0 = Sunday, 1 = Monday, etc.)
 * @returns {Date} - Next occurrence of the specified day
 */
function getNextDayOfWeek(date, dayOfWeek) {
  const resultDate = new Date(date.getTime());
  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  return resultDate;
}

module.exports = {
  uuidv4,
  hashPassword,
  createTableIfNotExists,
  deleteExistingRecordByEmail,
  getUniqueDepartmentCode,
  getNextDayOfWeek
}; 