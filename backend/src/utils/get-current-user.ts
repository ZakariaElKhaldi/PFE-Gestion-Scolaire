import { pool } from '../config/db';

async function getCurrentUser() {
  console.log('Checking recent logins in the system...');
  
  try {
    // Check users in the database
    const [users] = await pool.query(`
      SELECT id, email, firstName, lastName, role, studentId 
      FROM users 
      ORDER BY createdAt DESC 
      LIMIT 10
    `);
    
    console.log(`Found ${(users as any[]).length} recent users:`);
    
    (users as any[]).forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Student ID: ${user.studentId || 'N/A'}`);
      console.log('---');
    });
    
    console.log('\nIMPORTANT: Look at the browser console in the frontend to see your user ID.');
    console.log('Instructions:');
    console.log('1. Open your browser developer tools (F12) on the assignments page');
    console.log('2. Go to the Console tab');
    console.log('3. Paste and run this code to see your current user ID:');
    console.log('   console.log("Current user ID:", JSON.parse(localStorage.getItem("auth") || "{}").user?.id)');
    
    console.log('\nIf your user ID is not one of the student users above, run the following script:');
    console.log('npx ts-node src/utils/assign-to-current-user.ts USER_ID_FROM_BROWSER');
    
  } catch (error) {
    console.error('Error getting users:', error);
  } finally {
    // Close the database connection
    pool.end();
    process.exit(0);
  }
}

// Run the function
getCurrentUser(); 