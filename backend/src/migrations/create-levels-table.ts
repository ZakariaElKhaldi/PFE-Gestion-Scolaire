import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-levels-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Levels" (
                "levelId" VARCHAR(36) PRIMARY KEY,
                "name" VARCHAR(100) NOT NULL UNIQUE,
                "description" TEXT,
                "order" INTEGER,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP
            );
        `);
        logger.info(`[${migrationName}] Table "Levels" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Levels";`);
        logger.info(`[${migrationName}] Table "Levels" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
