import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

async function testLogin() {
  try {
    console.log('Testing login...');
    
    // Try to login with the admin user
    const result = await authService.login({
      email: 'admin@example.com',
      password: 'Password123!'
    });
    
    console.log('Login successful:', result);
  } catch (error) {
    console.error('Login failed:', error);
    
    // Let's check the user directly from the database
    const { supabaseAdmin } = require('../config/supabase');
    const { data, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();
    
    if (dbError) {
      console.error('Error fetching user from DB:', dbError);
    } else {
      console.log('User from DB:', data);
      console.log('is_active value:', data.is_active);
      console.log('isActive property used in code:', data.isActive);
    }
  }
  
  process.exit(0);
}

// Run the test
testLogin(); 