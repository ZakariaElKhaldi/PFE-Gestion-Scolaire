import { createParentRelationshipTable } from '../migrations/create-parent-relationship-table';

/**
 * Run all database migrations
 * @returns Promise that resolves when all migrations are complete
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');
    
    // Run parent relationship table migration
    await createParentRelationshipTable();
    
    console.log('All migrations completed successfully!');
    // Don't exit the process when used as a module
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error; // Rethrow to let caller handle it
  }
}

// Direct execution (when run directly with ts-node)
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 