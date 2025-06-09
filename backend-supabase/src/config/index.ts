import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Configuration object
export const config = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  upload: {
    dir: path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || '').split(','),
  },
  security: {
    maxLoginAttempts: 5,
    lockDurationMinutes: 15,
  },
};

// Validate critical configuration
if (!config.jwt.secret || config.jwt.secret === 'your-secret-key') {
  console.warn('Warning: Using default JWT secret. Set JWT_SECRET in .env for production.');
}

if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('Error: Missing Supabase configuration. Check your .env file.');
  process.exit(1);
}

export default config; 