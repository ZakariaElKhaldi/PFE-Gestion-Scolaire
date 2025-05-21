import { QueryInterface } from 'sequelize';
import { logger } from '../utils/logger'; // Assuming logger path
import { query } from '../config/db'; // Assuming db utility path

const migrationName = 'create-parents-table';

export async function up(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Starting migration...`);
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS "Parents" (
                "parentId" VARCHAR(36) PRIMARY KEY,
                "userId" VARCHAR(36) NOT NULL UNIQUE,
                "occupation" VARCHAR(255),
                "profilePictureUrl" VARCHAR(255),
                "preferredLanguage" VARCHAR(50) DEFAULT 'en',
                "status" VARCHAR(20) NOT NULL DEFAULT 'active', -- ENUM('active', 'inactive')
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "fk_parents_user"
                    FOREIGN KEY ("userId")
                    REFERENCES "Users"("userId")
                    ON DELETE CASCADE
            );
        `);
        // Add ENUM type for status if not directly supported
        // await query(`ALTER TABLE "Parents" ADD CONSTRAINT "enum_parents_status" CHECK ("status" IN ('active', 'inactive'));`);
        // logger.info(`[${migrationName}] ENUM constraint for "status" added to "Parents" table.`);

        logger.info(`[${migrationName}] Table "Parents" created successfully or already exists.`);
        logger.info(`[${migrationName}] Migration completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during migration:`, error);
        throw error;
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    logger.info(`[${migrationName}] Reverting migration...`);
    try {
        await query(`DROP TABLE IF EXISTS "Parents";`);
        logger.info(`[${migrationName}] Table "Parents" dropped successfully.`);
        logger.info(`[${migrationName}] Reversion completed successfully.`);
    } catch (error) {
        logger.error(`[${migrationName}] Error during reversion:`, error);
        throw error;
    }
}
