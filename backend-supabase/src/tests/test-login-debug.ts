import { userModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../config/supabase';

async function testLoginDebug() {
  try {
    console.log('Testing login with debugging...');
    
    // Find user by email directly
    const user = await userModel.findByEmail('admin@example.com');
    console.log('User from model:', user);
    
    if (user) {
      console.log('User is found, checking properties:');
      console.log('- isActive:', user.isActive);
      
      // Try to verify password
      const plainPassword = 'Password123!';
      const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
      console.log('Password valid:', isPasswordValid);
      
      // Check the raw data from Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'admin@example.com')
        .single();
        
      if (error) {
        console.error('Error fetching from DB:', error);
      } else {
        console.log('\nRaw data from DB:');
        console.log(data);
        console.log('- is_active in raw data:', data.is_active);
      }
    } else {
      console.log('User not found');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the test
testLoginDebug(); 