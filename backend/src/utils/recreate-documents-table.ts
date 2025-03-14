import { pool } from '../config/db';
import { createDocumentsTableSQL } from '../models/document.model';

/**
 * Script to drop and recreate the documents table
 */
const recreateDocumentsTable = async () => {
  try {
    console.log('Dropping documents table if exists...');
    await pool.query('DROP TABLE IF EXISTS documents');
    
    console.log('Creating documents table with new schema...');
    await pool.query(createDocumentsTableSQL);
    
    console.log('Documents table recreated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error recreating documents table:', error);
    process.exit(1);
  }
};

recreateDocumentsTable(); 