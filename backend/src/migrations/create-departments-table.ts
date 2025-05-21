import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-departments-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration to create Departments table with consolidated schema...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Departments" (
                "departmentId" VARCHAR(36) PRIMARY KEY,
                "name" VARCHAR(100) NOT NULL UNIQUE,
                "description" TEXT,
                "headId" VARCHAR(36),
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_departments_head"
                    FOREIGN KEY ("headId")
                    REFERENCES "Users"("userId")
                    ON DELETE SET NULL
            );
        `);
        logger.info(`[${migrationName}] Table "Departments" created successfully or already exists with the new schema.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Departments";`);
        logger.info(`[${migrationName}] Table "Departments" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
  } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
