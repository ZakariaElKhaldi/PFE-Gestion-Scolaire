// Import the new migrations
import { addAuthFields } from './migrations/add-auth-fields';
import { createLoginAttemptsTable } from './migrations/create-login-attempts-table';

// Run migrations on startup
app.on('ready', async () => {
  try {
    // Run existing migrations
    // ...
    
    // Run new auth security migrations
    await addAuthFields();
    await createLoginAttemptsTable();
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Error running migrations:', error);
    process.exit(1);
  }
}); 