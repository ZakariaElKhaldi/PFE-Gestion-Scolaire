import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { config } from '.';

// Load environment variables
dotenv.config();

// Create a connection pool
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Database connection established successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
  });

/**
 * Helper function to execute SQL queries
 * @param sql SQL query string
 * @param params Query parameters
 * @returns Query results
 */
export const queryAsync = async (sql: string, params: any[] = []): Promise<any> => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}; 