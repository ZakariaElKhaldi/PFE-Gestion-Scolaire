import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { testSupabaseConnection } from './config/supabase';
import fs from 'fs';
import path from 'path';

async function startServer() {
  try {
    logger.startup('Starting server initialization...');
    
    // Test Supabase connection
    const supabaseConnected = await testSupabaseConnection();
    if (!supabaseConnected) {
      logger.error('Supabase connection failed - attempting to continue with limited functionality');
    } else {
      logger.startup('Supabase connection established successfully');
    }
    
    // Ensure upload directories exist
    try {
      const uploadDir = config.upload.dir;
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      logger.startup('Upload directories initialized');
    } catch (uploadError) {
      logger.error('Failed to initialize upload directories', uploadError);
      logger.warn('File upload functionality may not work properly');
    }

    // Start the server
    const PORT = config.server.port;
    
    app.listen(PORT, () => {
      logger.startup(`Server running at http://localhost:${PORT}`);
      logger.info(`Environment: ${config.server.env}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handler
function gracefulShutdown() {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
  
  process.exit(0);
}

// Start server
startServer(); 