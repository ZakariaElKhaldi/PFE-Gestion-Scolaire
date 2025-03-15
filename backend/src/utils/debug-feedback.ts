import { pool } from '../config/db';
import { feedbackModel } from '../models/feedback.model';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Debug utility for feedback issues
 * Run with: npx ts-node src/utils/debug-feedback.ts
 */
async function debugFeedback() {
  try {
    console.log('=== FEEDBACK DEBUG UTILITY ===');
    
    // User ID to check - using the one from the logs
    const userId = 'f4b969e2-324a-4333-9624-d016a54ea06d';
    console.log(`Checking feedback for user ID: ${userId}`);
    
    // Step 1: Check if user exists
    console.log('\n[STEP 1] Checking if user exists...');
    const [userResult] = await pool.query(
      'SELECT id, email, firstName, lastName, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (Array.isArray(userResult) && userResult.length > 0) {
      console.log('User found:', userResult[0]);
    } else {
      console.log('❌ ERROR: User not found in database');
      return;
    }
    
    // Step 2: Check feedback directly in database 
    console.log('\n[STEP 2] Checking feedback directly in database...');
    
    // First check if table exists
    try {
      await pool.query('SHOW TABLES LIKE "feedback"');
      console.log('Feedback table exists');
    } catch (error) {
      console.error('❌ ERROR: Feedback table does not exist or error checking it', error);
      return;
    }
    
    // Check feedback entries
    const [dbFeedback] = await pool.query(
      'SELECT * FROM feedback WHERE studentId = ?',
      [userId]
    );
    
    if (Array.isArray(dbFeedback) && dbFeedback.length > 0) {
      console.log(`Found ${dbFeedback.length} feedback entries in database:`);
      console.log(JSON.stringify(dbFeedback, null, 2));
      
      // List course IDs
      const courseIds = dbFeedback.map((f: any) => f.courseId);
      console.log('Course IDs with feedback:', courseIds);
    } else {
      console.log('❌ No feedback found in database for this user');
    }
    
    // Step 3: Check API model result
    console.log('\n[STEP 3] Checking feedback model getByStudentId result...');
    try {
      const apiResults = await feedbackModel.getByStudentId(userId);
      console.log(`API model returned ${apiResults.length} feedback entries:`);
      console.log(JSON.stringify(apiResults, null, 2));
      
      if (apiResults.length === 0) {
        console.log('❌ API model returned empty array but database has records!');
      }
    } catch (error) {
      console.error('❌ ERROR: Could not get feedback from API model', error);
    }
    
    // Step 4: Create a test token to simulate API call
    console.log('\n[STEP 4] Creating test token for API testing...');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';
    const token = jwt.sign({ 
      userId, 
      email: 'student@school.com',
      role: 'student' 
    }, jwtSecret, { expiresIn: '1h' });
    console.log('Test token created. Use this in Postman or API client:');
    console.log(token);
    console.log('\nAPI URL to test: http://localhost:3001/api/feedback/student');
    console.log('Add Authorization header: Bearer TOKEN');
    
    console.log('\n=== DEBUG COMPLETED ===');
    console.log('Check the results above to diagnose the feedback issue');
  } catch (error) {
    console.error('Error in debug script:', error);
  } finally {
    // Close DB connection
    pool.end();
  }
}

// Run the debug function
debugFeedback(); 