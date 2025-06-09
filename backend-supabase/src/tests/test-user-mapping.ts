import { supabaseAdmin } from '../config/supabase';

async function testUserMapping() {
  try {
    console.log('Testing user mapping...');
    
    // Query for the admin user we created
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();
    
    if (error) {
      console.error('Error querying user:', error);
      return;
    }
    
    console.log('Database fields:');
    console.log('- is_active:', data.is_active);
    console.log('- is_verified:', data.is_verified);
    
    // Create a user object like our model would
    const user = {
      id: data.id,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      profilePictureUrl: data.profile_picture_url,
      phoneNumber: data.phone_number,
      lastLogin: data.last_login,
      isActive: data.is_active, // This is the key mapping we're checking
      isVerified: data.is_verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      resetPasswordToken: data.reset_password_token,
      resetPasswordExpires: data.reset_password_expires ? new Date(data.reset_password_expires) : undefined
    };
    
    console.log('\nModel properties:');
    console.log('- isActive:', user.isActive);
    console.log('- isVerified:', user.isVerified);
    
    // Exit the process
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the test
testUserMapping(); 