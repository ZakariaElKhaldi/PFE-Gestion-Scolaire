import { supabaseAdmin } from '../config/supabase';
import { logger } from '../utils/logger';

async function testUserQuery() {
  try {
    console.log('Testing user query...');
    
    // Query for the admin user we just created
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com');
    
    if (error) {
      console.error('Error querying user:', error);
      return;
    }
    
    console.log('User found:', data);
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the test
testUserQuery(); 