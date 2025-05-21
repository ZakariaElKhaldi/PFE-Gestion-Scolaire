import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-programs-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Programs" (
                "programId" VARCHAR(36) PRIMARY KEY,
                "name" VARCHAR(100) NOT NULL UNIQUE,
                "description" TEXT,
                "departmentId" VARCHAR(36),
                "startDate" DATE,
                "endDate" DATE,
                "status" VARCHAR(20) NOT NULL DEFAULT 'upcoming', -- ENUM('active', 'inactive', 'upcoming', 'completed')
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_programs_department"
                    FOREIGN KEY ("departmentId")
                    REFERENCES "Departments"("departmentId")
                    ON DELETE SET NULL -- Or RESTRICT
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "Programs" ADD CONSTRAINT "enum_programs_status" CHECK ("status" IN ('active', 'inactive', 'upcoming', 'completed'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Programs" table.`);

        logger.info(`[${migrationName}] Table "Programs" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Programs";`);
        logger.info(`[${migrationName}] Table "Programs" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
