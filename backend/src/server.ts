// Add database initialization before starting the server
import app, { server, io } from './app';
import { runMigrations } from './db/migrations';
import { config } from './config';
import { testConnection } from './config/db';
import { initializeDatabase } from './utils/db-init';
import { ensureUploadDirectories } from './services/file-upload.service';
import { logger } from './utils/logger';
import { isSystemOperational } from './utils/health-check';

async function startServer() {
  try {
    logger.startup('Starting server initialization...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Database connection failed - attempting to continue with limited functionality');
    } else {
      logger.startup('Database connection established successfully');
      
      // Run migrations
      try {
        logger.startup('Running database migrations...');
        await runMigrations();
        logger.startup('Database migrations completed successfully');
      } catch (migrationError) {
        logger.error('Database migration failed', migrationError);
        logger.warn('Server will continue with limited functionality');
      }
      
      // Initialize any additional database tables if needed
      try {
        await initializeDatabase();
        logger.startup('Database tables initialized successfully');
      } catch (initError) {
        logger.error('Error initializing database tables', initError);
        logger.warn('Some database features may not be available');
      }
    }
    
    // Ensure upload directories exist
    try {
      await ensureUploadDirectories();
      logger.startup('Upload directories initialized');
    } catch (uploadError) {
      logger.error('Failed to initialize upload directories', uploadError);
      logger.warn('File upload functionality may not work properly');
    }

    // Check if system is operational enough to start
    const operational = await isSystemOperational();
    if (!operational) {
      logger.warn('System health check indicates critical issues - starting in MAINTENANCE MODE');
    }

    // Start the server
    const PORT = config.server.port || 3001;
    
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. The server may already be running.`);
        logger.info('You can continue using the existing server instance.');
        process.exit(0); // Exit gracefully
      } else {
        logger.error('Server error:', error);
        process.exit(1);
      }
    });
    
    // Setup debug listeners for Socket.IO
    io.on('connection', (socket) => {
      logger.debug(`Socket connected: ${socket.id}`);
    });
    
    io.engine.on("connection_error", (err) => {
      logger.error(`Socket.IO connection error: ${err.message}`, { context: err.context });
    });
    
    server.listen(PORT, () => {
      if (operational) {
        logger.startup(`Server running at http://localhost:${PORT}`);
        logger.info(`API docs available at http://localhost:${PORT}/api-docs`);
        logger.info(`Socket.IO server running on ws://localhost:${PORT}`);
      } else {
        logger.warn(`Server running in MAINTENANCE MODE at http://localhost:${PORT}`);
        logger.warn('Only basic functionality and health checks are available');
      }
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
  
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
startServer(); 