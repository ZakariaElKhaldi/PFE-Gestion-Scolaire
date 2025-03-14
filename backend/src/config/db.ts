import * as mysql from 'mysql2/promise';
import { config } from './index';

// Create the database connection pool with improved error handling
let pool: mysql.Pool;

try {
  // Attempt to create a real database connection pool
  console.log('Attempting to create database pool with config:', {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    database: config.db.name,
    // Password intentionally omitted for security
  });
  
  pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true  // Allow multiple statements in a single query
  });
  
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Error creating database pool:', error);
  
  // Instead of creating an empty object, create a mock pool with the same interface
  // to prevent "Cannot read properties of undefined" errors
  pool = {
    execute: async () => {
      console.error('Mock database pool execute method called - database is not connected');
      return [[], []];
    },
    query: async () => {
      console.error('Mock database pool query method called - database is not connected');
      return [[], []];
    },
    getConnection: async () => {
      console.error('Mock database pool getConnection method called - database is not connected');
      throw new Error('Database connection not available');
    },
    // Add other necessary methods to prevent crashes
    end: async () => {},
    on: () => ({}),
    // Type assertion to satisfy TypeScript
  } as unknown as mysql.Pool;
  
  console.log('Created mock database pool to prevent crashes');
}

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (!pool.getConnection) {
      console.error('Database pool not properly initialized');
      return false;
    }
    
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    console.log('Please make sure MySQL is running and the database is set up.');
    console.log('Check your .env file for correct database configuration:');
    console.log(`DB_HOST=${config.db.host}`);
    console.log(`DB_PORT=${config.db.port}`);
    console.log(`DB_USER=${config.db.user}`);
    console.log(`DB_NAME=${config.db.name}`);
    console.log('You can run "node db/setup.js" to create the database schema.');
    return false;
  }
};

/**
 * Execute a SQL query with better error handling
 */
export const query = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  try {
    if (!pool.execute) {
      console.error('Database pool not properly initialized');
      return [];
    }
    
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

/**
 * Execute a transaction with multiple queries
 */
export type Transaction = <T>(callback: (connection: mysql.PoolConnection) => Promise<T>) => Promise<T>;

export const transaction: Transaction = async <T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> => {
  if (!pool.getConnection) {
    console.error('Database pool not properly initialized');
    throw new Error('Database connection not available');
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Export the pool
export { pool }; 