import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-material-progress-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "MaterialProgress" (
                "progressId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL,
                "materialId" VARCHAR(36) NOT NULL,
                "status" VARCHAR(20) NOT NULL DEFAULT 'not_started', -- ENUM('not_started', 'in_progress', 'completed')
                "progressPercentage" INTEGER DEFAULT 0,
                "lastAccessedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "completedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT "fk_materialprogress_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_materialprogress_material"
                    FOREIGN KEY ("materialId")
                    REFERENCES "Materials"("materialId")
                    ON DELETE CASCADE,
                UNIQUE ("userId", "materialId") -- Each user has one progress entry per material
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "MaterialProgress" ADD CONSTRAINT "enum_materialprogress_status" CHECK ("status" IN ('not_started', 'in_progress', 'completed'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "MaterialProgress" table.`);

        logger.info(`[${migrationName}] Table "MaterialProgress" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "MaterialProgress";`);
        logger.info(`[${migrationName}] Table "MaterialProgress" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
