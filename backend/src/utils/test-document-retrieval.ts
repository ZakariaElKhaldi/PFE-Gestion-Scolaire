import { pool } from '../config/db';
import axios from 'axios';

/**
 * Test script to verify document retrieval
 */
const testDocumentRetrieval = async () => {
  try {
    console.log('Starting document retrieval test...');
    
    // Check if there are any documents in the database
    const [rows] = await pool.query('SELECT * FROM documents LIMIT 5');
    console.log(`Found ${(rows as any[]).length} documents in the database`);
    
    if ((rows as any[]).length === 0) {
      console.error('No documents found in the database!');
      process.exit(1);
    }
    
    // Log the document details
    console.log('Document details:', JSON.stringify(rows, null, 2));
    
    // Try to access the documents API
    try {
      // This will likely fail due to authentication, but we can check the error type
      const response = await axios.get('http://localhost:3001/api/documents');
      console.log('API response:', response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.log('API requires authentication as expected.');
      } else {
        console.error('Unexpected API error:', error.message);
      }
    }
    
    // Test the individual document retrieval for download
    const testDocumentId = (rows as any[])[0]?.id;
    
    if (testDocumentId) {
      console.log(`Testing download for document ID: ${testDocumentId}`);
      
      try {
        // This will likely fail due to authentication, but we can check the error type
        await axios.get(`http://localhost:3001/api/documents/${testDocumentId}/download`);
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          console.log('Download API requires authentication as expected.');
        } else {
          console.error('Unexpected download API error:', error.message);
        }
      }
    }
    
    console.log('Document retrieval test completed.');
    process.exit(0);
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
};

testDocumentRetrieval(); 