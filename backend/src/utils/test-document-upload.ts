import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { pool } from '../config/db';

/**
 * Test script to directly upload a document to the API
 */
const testDocumentUpload = async () => {
  try {
    console.log('Starting document upload test...');
    
    // Create a form with test data
    const formData = new FormData();
    formData.append('title', 'Test Document');
    formData.append('description', 'This is a test document for debugging');
    formData.append('type', 'test');
    
    // Use a sample PDF file for testing
    const testFilePath = path.join(__dirname, '../../uploads/test-file.txt');
    
    // Create a test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(testFilePath, 'This is a test file for document upload.');
      console.log(`Created test file at ${testFilePath}`);
    }
    
    // Add the file to form data
    formData.append('file', fs.createReadStream(testFilePath));
    
    console.log('Sending upload request to test endpoint...');
    
    // Send the upload request
    const response = await axios.post('http://localhost:3001/api/documents/test-upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('Upload response:', response.data);
    
    // Check if the document was saved to the database
    if (response.data && response.data.data && response.data.data.document && response.data.data.document.id) {
      const documentId = response.data.data.document.id;
      console.log(`Checking database for document ID: ${documentId}`);
      
      // Query the database directly to verify
      const [rows] = await pool.query('SELECT * FROM documents WHERE id = ?', [documentId]);
      console.log('Database query result:', rows);
      
      if (Array.isArray(rows) && rows.length > 0) {
        console.log('Test successful! Document was properly saved to the database.');
      } else {
        console.error('Test failed! Document was not found in the database.');
      }
    } else {
      console.error('Test failed! Document ID not returned in response.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
};

testDocumentUpload(); 